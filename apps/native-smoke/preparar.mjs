// Empacota os pacotes da Aurea em vendor/ para o app de smoke test consumir.
//
// POR QUE TARBALL, e não link de workspace. Um app Expo dentro do workspace pnpm precisa de
// `watchFolders` e `nodeModulesPaths` no `metro.config.js` para enxergar symlinks para fora da
// raiz do projeto. Isso funciona, mas introduz uma classe inteira de falha que NÃO é o que este
// app existe para medir: se ele não abrir por causa da configuração do Metro, não aprendemos nada
// sobre a fundação nativa — aprendemos sobre o bundler. O tarball elimina isso: os pacotes chegam
// em `node_modules` como pacotes normais, exatamente como chegariam para o consumidor real.
//
// E há um ganho que não era o objetivo: isto testa **o artefato**, não a árvore. O que o
// `check-pack.mjs` mede em lista de arquivos, este app roda de verdade.
//
// ⚠ `pnpm pack`, NUNCA `npm pack`. Medido em 03/09/2026, e a diferença quebra o app:
//
//     npm  pack -> "@aurea-uds/tokens": "workspace:^"   (não instala em lugar nenhum)
//     pnpm pack -> "@aurea-uds/tokens": "^0.6.0"        (correto)
//
// O `@aurea-uds/native` é o primeiro pacote publicável desta casa com dependência de workspace,
// então este é um caminho novo — e é por isso que o `check-pack.mjs` ganhou a trava que confere
// que nenhum protocolo `workspace:` sobrevive no tarball.
import {execSync} from "node:child_process";
import {existsSync, mkdirSync, renameSync, rmSync, readdirSync, readFileSync, writeFileSync}
  from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = join(aqui, "..", "..");
const vendor = join(aqui, "vendor");

// `tokens` primeiro: `native` depende dele. `fonts` traz os .ttf.
const PACOTES = ["tokens", "fonts", "native"];

// `execSync` e não `execFileSync`, pela mesma razão que o `check-pack.mjs` já documenta: no
// Windows o `pnpm` é um `.cmd`, e desde a correção do CVE-2024-27980 o Node recusa executar
// `.cmd`/`.bat` sem shell (EINVAL). A primeira versão disto usava `execFileSync` e teria
// quebrado no PRIMEIRO passo, na máquina onde este app existe para ser rodado.
//
// E a saída é CAPTURADA para ser reimpressa no erro. A primeira versão usava
// `stdio: ["ignore","ignore","inherit"]` achando que isso mostraria a falha — e não mostrou: o
// pnpm escreve o erro no STDOUT, que estava sendo descartado. O Victor recebeu um
// `Command failed` sem uma linha de explicação, e eu tive de reproduzir num clone limpo para
// descobrir o que ele já teria lido na tela.
function pnpm(cmd, cwd) {
  try {
    return execSync(cmd, {cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"]});
  } catch (e) {
    const saida = [e.stdout, e.stderr].filter(Boolean).join("\n").trim();
    throw new Error(`\`${cmd}\` falhou em ${cwd}\n\n${saida || "(sem saída)"}`);
  }
}

// ⚠ SEM ISTO O PACK DO `native` FALHA NUM CLONE LIMPO, e foi assim que ele falhou na máquina do
// Victor em 03/09/2026:
//
//     [ERR_PNPM_CANNOT_RESOLVE_WORKSPACE_PROTOCOL] Cannot resolve workspace protocol of
//     dependency "@aurea-uds/tokens" because this dependency is not installed.
//
// O `pnpm pack` só converte `workspace:^` na versão de verdade se o pacote-alvo estiver
// **instalado** — e num clone recém-baixado não está. Aqui passava despercebido porque a sessão
// já tinha rodado `pnpm install` antes; o README chegou a afirmar "não precisa de pnpm install",
// que era falso e não tinha comando atrás.
//
// O install é FILTRADO e `--prod` de propósito: nesse recorte o `native` depende de uma coisa só,
// o `@aurea-uds/tokens`, que é link local sem dependências. Medido: **1,2 s**. Instalar o
// workspace inteiro para isto seria baixar Base UI, Playwright e o React Native — minutos, para
// resolver o nome de um pacote que está na pasta ao lado.
// ⚠ **E ELE SÓ RODA SE FOR PRECISO.** Isto é conserto de 03/09/2026, achado ao preparar o smoke
// do `Screen`, e o defeito era grave o bastante para valer as linhas:
//
// O install é FILTRADO e `--prod`. Numa máquina que já tem o workspace instalado por inteiro, o
// escopo não bate — e o pnpm resolve isso **APAGANDO o `node_modules` da raiz**. Aqui ele apagou:
// depois de rodar `preparar.mjs`, `vitest`, `tsc` e o `check-pack` sumiram do repositório, e foi
// preciso um `pnpm install` inteiro para voltar. Um script de smoke test não pode destruir a
// instalação de quem o roda.
//
// Sem flag nenhuma o pnpm PERGUNTA antes de apagar, e num terminal não interativo ele aborta —
// então "não passar flag" troca destruição silenciosa por parada obscura. Nenhuma das duas serve.
//
// A saída é não chegar lá: se o link que o `pnpm pack` precisa **já existe**, não há nada a
// instalar. Num clone limpo ele não existe, o install roda, e aí não há `node_modules` de outro
// escopo para purgar — que é justamente o caso em que a flag é inócua.
const linkDoTokens = join(raiz, "packages", "native", "node_modules", "@aurea-uds", "tokens");
if (existsSync(linkDoTokens)) {
  console.log("preparar: o link de `@aurea-uds/tokens` já existe — pulando o install.");
} else {
  console.log("preparar: resolvendo a dependência de workspace do `native`…");
  pnpm("pnpm install --filter @aurea-uds/native --prod --ignore-scripts "
       + "--config.confirmModulesPurge=false", raiz);
}

rmSync(vendor, {recursive: true, force: true});
mkdirSync(vendor, {recursive: true});

// 🔴 O NOME DO TARBALL PERDEU A VERSÃO — 09/09/2026, e isto conserta um defeito que só aparece
// na máquina de quem USA o repositório, nunca na de quem o escreve.
//
// O `pnpm pack` produz `aurea-uds-native-0.7.0.tgz`, com a versão no nome. O `package.json` deste
// app precisa apontar para esse nome exato — e ele é **versionado no git**. Resultado: rodar o
// smoke test **suja um arquivo rastreado**, e o `git pull` seguinte que toque nesse arquivo
// **ABORTA**:
//
//     error: Your local changes to the following files would be overwritten by merge:
//             apps/native-smoke/package.json
//
// O Victor puxou, rodou, e viu os mesmos erros — porque o pull não tinha entrado. **Um app de
// smoke test não pode brigar com o `git pull` de quem vai rodá-lo**, e é isso que um nome de
// arquivo com versão dentro garante que aconteça a cada bump.
//
// Com nome ESTÁVEL o `package.json` deixa de mudar: ele aponta para `aurea-uds-native.tgz` para
// sempre, e a versão volta a viver só onde ela é dado — dentro do pacote.
//
// ⚠ E o "mesmo nome de sempre" era exatamente o que fazia o npm responder `up to date` sem
// instalar. Isso já está resolvido acima, e por construção, não por sorte: a invalidação virou
// incondicional e o `rodar.mjs` CONFERE hash a hash o que ficou instalado.
for (const p of PACOTES) {
  pnpm(`pnpm pack --pack-destination "${vendor}"`, join(raiz, "packages", p));
  const bruto = readdirSync(vendor).find((f) => f.startsWith(`aurea-uds-${p}-`) && f.endsWith(".tgz"));
  if (!bruto) throw new Error(`o \`pnpm pack\` não produziu tarball de @aurea-uds/${p}`);
  renameSync(join(vendor, bruto), join(vendor, `aurea-uds-${p}.tgz`));
  console.log(`preparar: empacotou @aurea-uds/${p} (${bruto} -> aurea-uds-${p}.tgz)`);
}

// ⚠ E o `package.json` deste app aponta para os tarballs por NOME DE ARQUIVO, que carrega a
// VERSÃO — `file:./vendor/aurea-uds-native-0.7.0.tgz`. Escrito à mão, ele quebra em todo bump:
// o `vendor/` é limpo e repopulado com a versão nova, e o `npm install` do passo 2 morre num
// ENOENT apontando para um arquivo que não existe mais.
//
// Achado em 09/09/2026, logo depois do bump para a `0.7.0` — ou seja, **o app estava quebrado e
// ninguém saberia até tentar rodar**. Agora o `preparar` reescreve as três linhas a partir do que
// ele ACABOU de empacotar, e o número de versão deixa de existir escrito à mão.
const gerados = readdirSync(vendor).filter((f) => f.endsWith(".tgz")).sort();
{
  const pkgPath = join(aqui, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  let mudou = false;
  for (const p of PACOTES) {
    const tgz = `aurea-uds-${p}.tgz`;
    if (!gerados.includes(tgz)) throw new Error(`não achei ${tgz} em vendor/`);
    const alvo = `file:./vendor/${tgz}`;
    if (pkg.dependencies[`@aurea-uds/${p}`] !== alvo) {
      pkg.dependencies[`@aurea-uds/${p}`] = alvo;
      mudou = true;
    }
  }
  if (mudou) {
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
    console.log("preparar: package.json reapontado para os tarballs desta versão");
  }

  // 🔴 E AQUI MORAVA O DEFEITO MAIS CARO QUE ESTE APP JÁ TEVE — achado em 09/09/2026, e ele fez
  // o smoke test MENTIR. As duas linhas abaixo ficavam dentro do `if (mudou)`, ou seja: o
  // lockfile e o `node_modules/@aurea-uds` só eram apagados quando a **VERSÃO** mudava.
  //
  // Só que o caso comum não é esse. O caso comum — e o único que interessa aqui — é **mesma
  // versão, código novo**: consertei dois defeitos, empacotei de novo, e o app continuou rodando
  // o código velho. O `npm install` responde `up to date` em 700 ms e não instala nada, porque
  // para ele o `file:` alvo é literalmente o mesmo. Reproduzido com um marcador no `dist/`:
  //
  //     dentro do tarball recém-empacotado ....... 1   (o código novo ESTÁ lá)
  //     dentro de node_modules/@aurea-uds ........ 0   (não chegou)
  //
  // O Victor rodou o app depois de dois consertos e viu **todos** os erros de novo. "Todos" era
  // a pista: um conserto errado quebra um; nenhum conserto chegando quebra todos.
  //
  // Então a invalidação passou a ser INCONDICIONAL. O custo é medido — o `npm install` volta a
  // levar ~16 s em vez de 0,7 s — e é barato demais perto do que se compra: **um app de smoke
  // test que roda código velho é pior que nenhum app**, porque ele responde as onze perguntas
  // com confiança sobre um artefato que não existe mais. É o mesmo princípio dos gates deste
  // repositório: o que não pode acontecer nunca é o controle concordar com o passado.
  rmSync(join(aqui, "package-lock.json"), {force: true});
  rmSync(join(aqui, "node_modules", "@aurea-uds"), {recursive: true, force: true});
  console.log("preparar: lockfile e @aurea-uds/ removidos — o install SEMPRE busca o recém-empacotado");
}
if (gerados.length !== PACOTES.length) {
  throw new Error(`esperava ${PACOTES.length} tarballs, achei ${gerados.length}`);
}
console.log(`\npreparar: ${gerados.length} tarballs em vendor/\n  ${gerados.join("\n  ")}`);
console.log("\nAgora: npm install && npx expo start");

// ─────────────────────────────────────────────────────────────────────────────────────────────
// 🔴 O MARCADOR DE BUILD — 10/09/2026, e ele existe porque a pergunta "o telefone está rodando
// o meu código?" já custou QUATRO rodadas nesta semana.
//
// Em 09/09 três rodadas seguidas mediram entrega, não componente. Em 10/09 o Victor consertou,
// rodou, e disse *"nada mudou"* sobre TRÊS consertos independentes, em três arquivos
// diferentes. Isso não é três consertos errados: é a assinatura de código que não chegou —
// **conserto errado quebra um; conserto que não chega não muda nada.**
//
// O passo 3 do `rodar.mjs` confere o pacote INSTALADO contra o tarball, hash a hash. Ele passa
// mesmo quando o telefone serve um bundle de cache, porque ele olha o disco e não a tela.
//
// ✅ Este arquivo fecha o buraco pelo único lado que sobra: **a própria tela diz o commit.** O
// app mostra este texto no cabeçalho, então basta ler a tela para saber se o código chegou —
// sem ninguém precisar acreditar em ninguém.
// ⚠ Não entra no git (está no `.gitignore`): arquivo gerado que o script reescreve a cada
// rodada é exatamente o defeito do `package.json` de 09/09, que fazia o `git pull` abortar.
const commit = (() => {
  try { return execSync("git rev-parse --short HEAD", {cwd: aqui, encoding: "utf8"}).trim(); }
  catch { return "sem-git"; }
})();
const sujo = (() => {
  try { return execSync("git status --porcelain", {cwd: aqui, encoding: "utf8"}).trim() !== ""; }
  catch { return false; }
})();
writeFileSync(join(aqui, "versao.json"), JSON.stringify({
  commit, sujo, empacotadoEm: new Date().toISOString(),
}, null, 2) + "\n");
console.log(`  marcador: commit ${commit}${sujo ? " (arvore SUJA)" : ""}`);
