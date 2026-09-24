// PUBLICAR — o passo 1 da ADR-0013, em código em vez de uma linha de shell.
//
// 🔴 POR QUE ISTO É SCRIPT E NÃO UM `foreach` NO TERMINAL. A ADR-0013 documentou o publish como
// uma linha de PowerShell, e ela envelheceu três vezes em três meses:
//
//   • 12/08/2026 — a forma original usava `&&`, que o PowerShell 5.1 NÃO TEM. Descoberto
//     executando, no meio do publish da `0.2.0`.
//   • 10/09/2026 — o caminho estava escrito à mão (`C:\dev\aurea-uds`) e o repositório mudou de
//     lugar. Caminho absoluto num comando de publicação é armadilha que só aparece na hora em
//     que não dá para errar.
//   • 10/09/2026 — a lista tinha SEIS pacotes e o repositório tem sete desde o Lote 0.
//
// É a mesma conclusão que o `apps/native-smoke/rodar.mjs` já tinha forçado: ORDEM DE EXECUÇÃO É
// CÓDIGO, NÃO SINTAXE DE SHELL. Um `foreach` com `Push-Location`, `$?`, `Get-ChildItem` e
// `Select-Object -Last 1` tem mais superfície de erro que este arquivo inteiro — e um deles é
// silencioso: `-Last 1` ordena por NOME, então quando existir uma `0.10.0` ela perde para a
// `0.7.0` e o script publica o tarball errado.
//
//   node scripts/publicar.mjs --dry-run   empacota, confere tudo, e NÃO publica
//   node scripts/publicar.mjs             confere a sessão do npm, empacota e publica,
//                                         pedindo 2FA a cada pacote
//
// ⚠ ISTO NÃO É PARA AGENTE RODAR. A ADR-0013 diz por escrito que o `npm login` e o publish são
// do Victor. O `--dry-run` é o que um agente pode rodar, e ele não fala com o registro além do
// `npm view`.
import {execSync} from "node:child_process";
import {readFileSync, readdirSync, mkdirSync, rmSync, existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname, join} from "node:path";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const seco = process.argv.includes("--dry-run");
const saida = join(raiz, ".tarballs");

// A ORDEM IMPORTA, e por duas razões diferentes — vale distinguir porque só uma é obrigatória:
//   • `tokens` antes de `native`: OBRIGATÓRIO. O `native` declara `@aurea-uds/tokens` em
//     `dependencies`, e o pnpm traduz `workspace:^` para `^<versão>`. Publicar o `native` antes
//     deixaria no registro um pacote apontando para uma versão que não existe.
//   • `react` depois dos outros: convenção da ADR-0013 — é o que a documentação de instalação
//     faz depender dos demais.
const ORDEM = ["tokens", "icons", "fonts", "core", "contracts", "react", "native"];

// A fonte da verdade é o DISCO, não esta lista — é o mesmo critério do check 42 do validate.py.
// Se um pacote publicável não estiver na ORDEM, o script PARA: publicar seis quando existem sete
// é o defeito que o check 42 nasceu pegando, e ele não pode voltar por aqui.
const noDisco = readdirSync(join(raiz, "packages"), {withFileTypes: true})
  .filter((d) => d.isDirectory() && existsSync(join(raiz, "packages", d.name, "package.json")))
  .filter((d) => !JSON.parse(readFileSync(join(raiz, "packages", d.name, "package.json"), "utf8")).private)
  .map((d) => d.name).sort();
const faltando = noDisco.filter((p) => !ORDEM.includes(p));
const sobrando = ORDEM.filter((p) => !noDisco.includes(p));
if (faltando.length || sobrando.length) {
  console.error(`publicar: a ORDEM deste script e os pacotes do disco divergem.`);
  if (faltando.length) console.error(`  publicáveis fora da ORDEM: ${faltando.join(", ")} — não seriam publicados`);
  if (sobrando.length) console.error(`  na ORDEM e não no disco: ${sobrando.join(", ")}`);
  process.exit(1);
}

// 🔴 PASSO 0 — A SESSÃO DO npm, CONFERIDA ANTES DE EMPACOTAR. Nasceu em 13/09/2026, publicando
// a `0.8.1`: o script empacotou os SETE, mandou o primeiro, e só então o registro respondeu
//
//   npm error code E404
//   npm error 404 Not Found - PUT https://registry.npmjs.org/@aurea-uds%2ftokens
//   npm error 404  ... could not be found or you do not have permission to access it.
//
// A causa era outra e mais simples — `npm whoami` devolvia **E401 Unauthorized**, a sessão tinha
// expirado desde a publicação da véspera. ⚠ **O npm devolve 404 no `PUT` para problema de
// AUTENTICAÇÃO**, de propósito: 401 revelaria se o pacote existe. Então a mensagem que ele mostra
// aponta para o lugar errado, e foi exatamente para lá que a investigação foi primeiro.
//
// ⚠ **E a janela encolheu:** desde dez/2025 o npm aposentou os tokens clássicos e a sessão dura
// ~2 h. "Publiquei ontem, logo estou logado" deixou de ser verdade.
//
// É a MESMA forma do gate que o `apps/native-smoke/rodar.mjs` ganhou no mesmo dia: conferir a
// credencial ANTES do trabalho caro, e dizer o comando que resolve. Custa uma chamada de rede e
// devolve um minuto de empacotamento mais a leitura de um erro que aponta para o lado errado.
//
// ⚠ **Não vale no `--dry-run`**: ele não envia nada, e exigir sessão ali tiraria do agente a
// única forma que ele tem de conferir a publicação (a ADR-0013 reserva o publish ao Victor).
if (!seco) {
  let quem = null;
  try {
    quem = execSync("npm whoami", {encoding: "utf8", stdio: ["ignore", "pipe", "ignore"]}).trim();
  } catch { quem = null; }
  if (!quem) {
    console.error(`
publicar: PAROU ANTES DE EMPACOTAR — o npm não está autenticado nesta sessão.

  \x1b[1mnpm login\x1b[0m        abre o navegador
  \x1b[1mnpm whoami\x1b[0m       tem de imprimir o seu usuário
  \x1b[1mnode scripts/publicar.mjs\x1b[0m

⚠ Se você publicou ontem, isso NÃO vale mais: desde dez/2025 a sessão do npm dura ~2 h.
⚠ E sem este passo o erro que aparece é \`404 Not Found - PUT\`, que parece "pacote não existe"
   e é, na verdade, falta de autenticação — o npm devolve 404 de propósito para não revelar se
   o pacote existe.`);
    process.exit(1);
  }
  console.log(`publicar: npm autenticado como \x1b[1m${quem}\x1b[0m`);
}

const versao = JSON.parse(readFileSync(join(raiz, "packages/react/package.json"), "utf8")).version;
console.log(`publicar: versão medida na árvore = ${versao}${seco ? "  (DRY RUN — nada será publicado)" : ""}`);
console.log(`publicar: ${ORDEM.length} pacotes, nesta ordem — ${ORDEM.join(" ")}\n`);

rmSync(saida, {recursive: true, force: true});
mkdirSync(saida, {recursive: true});

for (const p of ORDEM) {
  const nome = `@aurea-uds/${p}`;
  const dir = join(raiz, "packages", p);
  const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));

  // TODOS na mesma versão. Sem isto, um pacote esquecido no bump sai com número antigo e a
  // documentação de instalação passa a mentir. Foi tarefa registrada no publish da `0.2.0`.
  if (pkg.version !== versao) {
    console.error(`publicar: PAROU — ${nome} está em ${pkg.version} e o resto em ${versao}`);
    process.exit(1);
  }

  // PULA O QUE JÁ ESTÁ LÁ em vez de falhar: se um publish parou no meio, rodar de novo termina
  // o serviço em vez de reprovar em cima do primeiro pacote que deu certo.
  //
  // ⚠ DISTINGUE "não publicado" de "o comando quebrou". A primeira versão tratava QUALQUER
  // falha como "não está publicado", e isso é perigoso nos dois sentidos: esconde um npm
  // quebrado, e num registro fora do ar publicaria em cima do que já existe. Só `E404` é
  // resposta; qualquer outro erro PARA.
  const jaExiste = (() => {
    try {
      execSync(`npm view ${nome}@${versao} version`, {encoding: "utf8", stdio: ["ignore", "pipe", "pipe"]});
      return true;
    } catch (e) {
      const texto = String(e.stderr ?? "") + String(e.stdout ?? "") + String(e.message ?? "");
      if (/E404|is not in this registry|No match(ing version)? found/i.test(texto)) return false;
      console.error(`publicar: PAROU — \`npm view\` falhou para ${nome} por outro motivo que não "não existe":\n${texto.trim()}`);
      process.exit(1);
    }
  })();
  if (jaExiste) {
    console.log(`--- ${nome}@${versao} já está publicado, pulando`);
    continue;
  }

  // 🔴 EMPACOTA COM `pnpm`. Medido em 10/09/2026:
  //     npm  pack -> "@aurea-uds/tokens": "workspace:^"   <- não instala em ninguém
  //     pnpm pack -> "@aurea-uds/tokens": "^0.7.0"        <- correto
  // `workspace:` é protocolo do pnpm; fora dele não é versão válida.
  console.log(`--- ${nome}: empacotando com pnpm`);
  execSync(`pnpm pack --pack-destination "${saida}"`, {cwd: dir, stdio: ["ignore", "ignore", "inherit"]});

  // O nome do tarball é DERIVADO, não procurado com glob: `Get-ChildItem ... | Select -Last 1`
  // ordena por nome, e no dia em que existir uma `0.10.0` ela perde para a `0.7.0`.
  const tgz = join(saida, `aurea-uds-${p}-${versao}.tgz`);
  if (!existsSync(tgz)) {
    console.error(`publicar: PAROU — pnpm pack não gerou ${tgz}`);
    process.exit(1);
  }

  // CONFERE O ARTEFATO, não a intenção. Esta é a lição que o `conferir-bundle.mjs` custou: a
  // pergunta certa não é "o código está certo?", é "o que vai sair está certo?".
  const manifesto = JSON.parse(
    execSync(`tar xzOf "${tgz}" package/package.json`, {encoding: "utf8", maxBuffer: 32 * 1024 * 1024}));
  const vazou = ["dependencies", "peerDependencies", "optionalDependencies"]
    .flatMap((c) => Object.entries(manifesto[c] ?? {})
      .filter(([, v]) => String(v).startsWith("workspace:"))
      .map(([k, v]) => `${c}.${k}="${v}"`));
  if (vazou.length) {
    console.error(`publicar: PAROU — ${nome} levaria protocolo workspace: no tarball: ${vazou.join(", ")}`);
    process.exit(1);
  }
  if (manifesto.name !== nome || manifesto.version !== versao) {
    console.error(`publicar: PAROU — o tarball diz ${manifesto.name}@${manifesto.version}, esperado ${nome}@${versao}`);
    process.exit(1);
  }
  if (manifesto.publishConfig?.access !== "public") {
    console.error(`publicar: PAROU — ${nome} sem publishConfig.access="public"; o npm trataria o escopo como privado`);
    process.exit(1);
  }

  // QUEM ENVIA É O NPM, de propósito: o mecanismo de credencial não muda — 2FA aqui, OIDC na CI.
  // `pnpm publish` também traduziria, mas abriria duas perguntas não medidas (OIDC por ele, e o
  // `--publish-branch`, cujo padrão é `master` e que recusaria qualquer branch de trabalho).
  //
  // 🔴 `execSync` COM STRING, e não `execFileSync("npm", [...])` — medido em 11/09/2026, no
  // primeiro ensaio na máquina do Victor. No WINDOWS o `npm` é um `npm.cmd`, e desde a correção
  // do CVE-2024-27980 o Node RECUSA executar `.cmd`/`.bat` sem shell: ele lança EINVAL antes de
  // o npm existir. O sintoma foi o que NÃO apareceu — zero linha de `npm notice`, quando o
  // ensaio saudável imprime centenas.
  // ⚠ E o `scripts/check-pack.mjs` documenta essa armadilha por extenso desde sempre, no
  // comentário da constante `CMD`. Este arquivo foi escrito depois de ler aquele. Ler não é
  // aplicar.
  // ⚠ O comando é montado de valores do próprio repositório (nome do pacote e versão), não de
  // entrada de fora — não há texto de terceiro para o shell interpretar.
  const cmd = `npm publish "${tgz}"${seco ? " --dry-run" : ""}`;
  console.log(`--- ${nome}: ${cmd}`);
  try {
    execSync(cmd, {stdio: "inherit"});
  } catch (e) {
    // ⚠ MOSTRA O ERRO DE VERDADE. A primeira versão engolia o `catch` e imprimia só a frase
    // abaixo, o que deixou uma falha SEM CAUSA na tela do Victor — e diagnosticar uma falha
    // sem mensagem custou uma rodada inteira.
    console.error(`\npublicar: PAROU em ${nome} — ${e.message}`);
    console.error(`Os anteriores já estão publicados; rodar de novo continua daqui.`);
    process.exit(1);
  }
}

console.log(`\npublicar: ${seco ? "DRY RUN concluído — nada foi publicado" : `os ${ORDEM.length} em ${versao}`}`);
