// UM comando para rodar o smoke test do Lote 0 no celular. Faz tudo:
//
//     node apps/native-smoke/rodar.mjs
//
// Existe porque o Victor disse *"não sei fazer"*, e ele tem razão de não saber: rodar React
// Native normalmente pede Android Studio, SDK, variável de ambiente e emulador. **Aqui não pede
// nada disso** — e isso não é sorte, é consequência direta da
// [ADR-0037](../../decisions/0037-stylesheet-puro-no-nativo-e-o-provider-e-nosso.md): trocar o
// Unistyles pelo `StyleSheet` puro foi o que devolveu o **Expo Go**, que é um app da loja que lê
// um QR code. O celular vira o aparelho de teste, sem instalar ferramenta nenhuma no PC.
//
// O script é sequencial e barulhento de propósito: cada passo diz o que está fazendo, para um
// erro no meio ter endereço em vez de virar "não funcionou".
import {execSync} from "node:child_process";
import {createHash} from "node:crypto";
import {existsSync, readFileSync, readdirSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import {gunzipSync} from "node:zlib";

const aqui = dirname(fileURLToPath(import.meta.url));

// `execSync` com string, e nunca `execFileSync`: no Windows `pnpm`/`npm`/`npx` são `.cmd`, e
// desde a correção do CVE-2024-27980 o Node recusa executar `.cmd` sem shell (EINVAL). O
// `check-pack.mjs` já tinha essa cicatriz documentada; a primeira versão do `preparar.mjs`
// repetiu o erro e teria quebrado no primeiro passo, na máquina onde este app é para rodar.
const rodar = (cmd, cwd = aqui) => execSync(cmd, {cwd, stdio: "inherit"});

const passo = (n, texto) => console.log(`\n\x1b[1m[${n}/6] ${texto}\x1b[0m`);

// ── O CONTROLE QUE FALTAVA, e ele existe por um defeito de 09/09/2026 ────────────────────────
//
// O `preparar` empacota, o `npm install` instala, e por muito tempo ninguém conferiu que a
// segunda coisa era a primeira. Não era: com a MESMA versão e código NOVO, o npm respondia
// `up to date` em 700 ms e deixava o código velho em `node_modules`. O Victor rodou o app depois
// de dois consertos e viu **todos** os erros de novo.
//
// O `preparar` passou a invalidar sempre, o que resolve a causa conhecida. Isto aqui é outra
// coisa: **a prova de que resolveu**. Um smoke test que roda o artefato errado não falha — ele
// RESPONDE ERRADO, com confiança, sobre um artefato que não existe mais. É a única falha deste
// app que não tem sintoma, e por isso é a única que precisa de gate.
//
// Ele compara o `dist/` de dentro do tarball com o `dist/` instalado, arquivo a arquivo.
// `dist/icons/` fica fora: são 2571 arquivos gerados, e o `check 38` do validador já os cobre.

// Leitor de tar mínimo — 512 bytes de cabeçalho, nome em 0..100 (mais o `prefix` ustar em
// 345..500), tamanho octal em 124..136, e o conteúdo arredondado para o bloco seguinte.
// É pouco código de propósito: `tar` existe no Windows moderno mas não em toda máquina, e este
// script existe justamente para não exigir ferramenta nenhuma além do Node.
function lerTarGz(caminho) {
  const buf = gunzipSync(readFileSync(caminho));
  const saida = new Map();
  for (let i = 0; i + 512 <= buf.length;) {
    const nome = buf.toString("utf8", i, i + 100).replace(/\0.*$/, "");
    if (!nome) break;
    const prefixo = buf.toString("utf8", i + 345, i + 500).replace(/\0.*$/, "");
    const octal = buf.toString("utf8", i + 124, i + 136).replace(/\0.*$/, "").trim();
    const tam = parseInt(octal || "0", 8) || 0;
    const tipo = String.fromCharCode(buf[i + 156]);
    const inicio = i + 512;
    if (tipo === "0" || tipo === "\0") {
      saida.set(prefixo ? `${prefixo}/${nome}` : nome, buf.subarray(inicio, inicio + tam));
    }
    i = inicio + Math.ceil(tam / 512) * 512;
  }
  return saida;
}

const sha = (b) => createHash("sha256").update(b).digest("hex");

function conferirArtefato() {
  const vendor = join(aqui, "vendor");
  const tgzs = readdirSync(vendor).filter((f) => f.endsWith(".tgz"));
  if (!tgzs.length) throw new Error("vendor/ está vazio — o passo 3 não produziu tarball");

  const divergentes = [];
  let comparados = 0;
  for (const tgz of tgzs) {
    // ⚠ `aurea-uds-native.tgz` -> `native`. A primeira versão fazia `.replace(/-\d.*$/, "")`,
    // que só funcionava com a VERSÃO no nome — e o nome estável (adotado no mesmo dia, para o
    // `package.json` parar de sujar o `git pull`) devolvia `native.tgz`, um pacote que não
    // existe. O gate reprovava tudo com "nem chegou a ser instalado".
    // **Gate amarrado a um formato de nome fica cego quando o nome muda** — é o terceiro caso
    // deste tipo hoje, depois do `check 39` e do `check 41`.
    const nomeDoPacote = tgz.replace(/^aurea-uds-/, "").replace(/\.tgz$/, "").replace(/-\d.*$/, "");
    const raizInstalada = join(aqui, "node_modules", "@aurea-uds", nomeDoPacote);
    if (!existsSync(raizInstalada)) {
      divergentes.push(`@aurea-uds/${nomeDoPacote} nem chegou a ser instalado`);
      continue;
    }
    for (const [caminho, conteudo] of lerTarGz(join(vendor, tgz))) {
      if (!caminho.startsWith("package/dist/") || !caminho.endsWith(".js")) continue;
      if (caminho.startsWith("package/dist/icons/")) continue;
      const instalado = join(raizInstalada, caminho.slice("package/".length));
      if (!existsSync(instalado)) { divergentes.push(`falta ${caminho}`); continue; }
      comparados++;
      if (sha(readFileSync(instalado)) !== sha(conteudo)) {
        divergentes.push(`${nomeDoPacote}/${caminho.slice("package/".length)} está DIFERENTE`);
      }
    }
  }
  if (divergentes.length) {
    console.error(`\n\x1b[31mO app NÃO está rodando o código que você acabou de empacotar.\x1b[0m\n`);
    for (const d of divergentes.slice(0, 8)) console.error(`  · ${d}`);
    if (divergentes.length > 8) console.error(`  · … e mais ${divergentes.length - 8}`);
    console.error(`
  Isso significa que o smoke test responderia as perguntas sobre o artefato ERRADO.
  Apague a instalação e rode de novo:

      rm -rf apps/native-smoke/node_modules apps/native-smoke/package-lock.json
      node apps/native-smoke/rodar.mjs
`);
    process.exit(1);
  }
  console.log(`conferido: ${comparados} arquivos do dist/ batem com o tarball recém-empacotado.`);
}

// Os pré-requisitos são conferidos ANTES de qualquer passo, e a mensagem traz o comando que
// resolve. É a diferença entre "não funcionou" e "faltou X, rode Y" — e este script existe
// justamente para quem não faz isto todo dia.
function exigir(cmd, nome, comoInstalar) {
  try {
    execSync(`${cmd} --version`, {stdio: ["ignore", "ignore", "ignore"]});
  } catch {
    console.error(`\n\x1b[31mFalta o ${nome}.\x1b[0m\n\n  ${comoInstalar}\n`);
    process.exit(1);
  }
}

exigir("node", "Node.js", "Baixe o LTS em https://nodejs.org e instale (avançar, avançar).");
// `pnpm` e não `npm` para empacotar: só ele converte `workspace:^` para a versão de verdade.
// A razão inteira está no cabeçalho do `preparar.mjs`.
exigir("pnpm", "pnpm", "Rode:  npm install -g pnpm");

// 🔴 O LOGIN DO iOS, e ele NAO e' opcional la — medido no changelog da propria Expo em
// 13/09/2026 (`expo.dev/changelog/expo-go-57-login`), palavras deles:
//   "you will need to be logged in to the same account on both the terminal and in Expo Go"
//   "This requirement currently only applies to the latest version of Expo Go for iOS"
// O Android NAO exige, e e' exatamente por isso que ele rodou e o iPhone bateu em
// "You need to be signed in to Expo Go and Expo CLI to open your project".
//
// ⚠ Isto e' AVISO, nao gate: reprovar pararia quem so' usa Android, que e' o caso comum aqui.
// A pergunta 3 do modo `lote7` e' a unica que so' o iOS responde — e ela e' a que bloqueia o
// cadastro —, entao quem for atras dela precisa desta tela.
function conferirLogin() {
  let quem = null;
  try {
    quem = execSync("npx expo whoami", {encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
                                        cwd: aqui}).trim();
  } catch { quem = null; }
  if (quem && !/not logged in/i.test(quem)) {
    console.log(`\nExpo CLI: logado como \x1b[1m${quem}\x1b[0m — o iPhone vai aceitar (se o Expo Go estiver na MESMA conta).`);
    return;
  }
  console.log(`
\x1b[33mExpo CLI: NAO logado.\x1b[0m
  \x1b[1mAndroid:\x1b[0m segue normal, nao precisa de login.
  \x1b[1miPhone:\x1b[0m vai recusar o projeto. O Expo Go 57 do iOS exige login nos DOIS lados,
  com a MESMA conta. Para resolver, escolha um:

  \x1b[1mA) token\x1b[0m — sem navegador, e e' o caminho de quem entra com Google (essa conta
     nao tem senha, entao \`npx expo login\` sem flag fica pedindo uma que nao existe):
       1. abra  https://expo.dev/settings/access-tokens  e crie um personal access token
       2. no PowerShell, NESTA janela:   $env:EXPO_TOKEN = "cole-o-token"
       3. confira:                       npx expo whoami
     (medido no fonte do @expo/cli: \`UserSettings.js\` le \`process.env.EXPO_TOKEN\`, e o
      \`user.js\` aceita isso como credencial — nao e' so' do EAS.)

  \x1b[1mB) navegador\x1b[0m — \`npx expo login --browser\`. ⚠ No Windows isso pode morrer com
     \`cmd.exe /c start ... exited with non-zero code: 1\`, porque o \`start\` corta a URL no
     primeiro \`&\`. Contorno medido em \`open.js\`, que le \`process.env.BROWSER\`:
       $env:BROWSER = "chrome"
       npx expo login --browser

  E depois, no iPhone: Expo Go -> aba Home -> avatar no canto -> a MESMA conta.
`);
}

// 🔴 POR QUE O `git pull` MORA AQUI DENTRO, e nao na linha de comando — 09/09/2026.
// A documentacao mandava rodar `git pull && node rodar.mjs`. Isso QUEBRA no Windows PowerShell
// 5.1, que nao aceita `&&`:
//     O token '&&' nao e um separador de instrucoes valido nesta versao.
// E a correcao obvia — trocar por `;` — seria PIOR que o defeito: `;` nao para no erro, entao um
// `git pull` que falhasse deixaria o smoke rodar contra codigo velho. Isso nao e hipotese: e
// exatamente a rodada 3 (o pull abortava) e a rodada 4 (o HEAD estava parado num commit
// anterior), as duas medidas neste mesmo dia.
// Entao a ordem deixa de ser sintaxe de shell e vira CODIGO: aqui o "para no erro" e garantido
// em qualquer shell, e o comando documentado passa a ser UM SO, sem encadeamento nenhum.
const semPull = process.argv.includes("--sem-pull");

try {
  if (semPull) {
    console.log("\n\x1b[33m[1/6] pulado (--sem-pull) — cuidado: pode estar medindo codigo velho.\x1b[0m");
  } else {
    passo(1, "atualizando o repositorio…");
    // `--ff-only`: se divergiu, e para PARAR e o humano decidir, nunca criar merge sozinho.
    rodar("git pull --ff-only", join(aqui, "..", ".."));
  }

  // 🔴 ANTES DE EMPACOTAR, e é de propósito: este passo custa menos de um segundo e evita
  //    empacotar, instalar e subir servidor para descobrir no VIDRO que uma prop está com o
  //    nome errado. Nasceu em 12/09/2026, escrevendo o modo `lote7`: eu chamei
  //    `<NumberField onChangeValue=...>` (o certo é `onValueChange`) e NADA pegou — o `App.js`
  //    é `.js`, o Metro não tipa, e o campo teria subido mudo no aparelho, sem erro no console.
  passo(2, "conferindo as props do App.js contra o fonte da biblioteca…");
  rodar("node conferir-props.mjs");

  passo(3, "empacotando os pacotes da Aurea…");
  rodar("node preparar.mjs");

  passo(4, "instalando as dependências do app (demora na primeira vez)…");
  // `npm`, e não `pnpm`: este app está FORA do workspace de propósito, para ser um consumidor
  // comum. Ver o comentário no `pnpm-workspace.yaml`.
  rodar("npm install --no-audit --no-fund");

  if (!existsSync(join(aqui, "node_modules", "expo"))) {
    throw new Error("o `expo` não apareceu em node_modules — a instalação não terminou");
  }

  passo(5, "conferindo que o app vai rodar o código recém-empacotado…");
  conferirArtefato();

  // O número que a tela DEVE mostrar, lido do arquivo que o passo 3 acabou de gravar.
  const MARCADOR = (() => {
    try {
      const v = JSON.parse(readFileSync(join(aqui, "versao.json"), "utf8"));
      return v.commit + (v.sujo ? " (arvore suja)" : "");
    } catch { return "(o preparar nao gravou o marcador)"; }
  })();
  conferirLogin();

  passo(6, "subindo o servidor. Leia o QR code com o app Expo Go do seu celular.");
  console.log(`
  \x1b[1mNo celular Android:\x1b[0m
    1. instale o app "Expo Go" pela Play Store (é grátis, é da Expo);
    2. abra ele e toque em "Scan QR code";
    3. aponte para o QR que vai aparecer aqui embaixo.

  \x1b[1mNo iPhone:\x1b[0m o mesmo, MAIS o login — o Expo Go 57 do iOS recusa o projeto sem ele.
    Se a linha acima disser "NAO logado", resolva por lá antes de ler o QR. No iPhone o login
    é em Expo Go -> Home -> avatar, e tem de ser a MESMA conta do terminal.

  O celular e o PC precisam estar \x1b[1mna mesma rede Wi-Fi\x1b[0m. Se não conectar, pare com
  Ctrl+C e rode de novo com \`npx expo start --tunnel\` de dentro de apps/native-smoke.

  \x1b[1mSe o erro que você viu antes voltar\x1b[0m, feche o Expo Go POR COMPLETO no celular
  (menu de apps recentes, deslizar para fora) e leia o QR de novo: o \`--clear\` acima limpa o
  cache do PC, mas o do celular só o próprio Expo Go limpa.

  \x1b[1;33mANTES DE JULGAR QUALQUER COISA, LEIA A SEGUNDA LINHA DA TELA DO APP.\x1b[0m Ela diz
  \x1b[1mbuild ${MARCADOR}\x1b[0m. Se o número na tela for OUTRO, o telefone está rodando código
  velho e nenhuma resposta vale — feche o Expo Go por completo e leia o QR de novo.
  Isto existe porque a pergunta "o telefone está rodando o meu código?" já custou quatro rodadas.

  \x1b[1mO que julgar está na própria tela do app\x1b[0m, e o gabarito está no README daqui.
  Para sair: Ctrl+C.
`);
  // ⚠ `--clear`, SEMPRE, e não é exagero — é a quarta rodada do mesmo sintoma, 09/09/2026.
  //
  // Depois de eliminar por medição tudo o que estava no disco (o `dist/` do commit está limpo, o
  // tarball bate com o instalado, o gate do passo 5 confere 22 arquivos), sobrou uma explicação
  // só: **o telefone estava rodando um JS que não existe no disco.** Isso é cache — do Metro, do
  // Expo Go, ou dos dois.
  //
  // O Metro chaveia o cache de transformação por conteúdo, então em teoria ele invalidaria
  // sozinho. **"Em teoria" foi o que custou as três rodadas anteriores.** O custo de limpar é uma
  // reconstrução de bundle por execução; o custo de NÃO limpar é um smoke test que responde onze
  // perguntas sobre um código que não está mais lá. A troca não é próxima.
  //
  // Mesma decisão, mesma razão e mesma forma da invalidação incondicional do `preparar.mjs`:
  // **num instrumento de medição, a limpeza não é condicional.**
  rodar("npx expo start --clear");
} catch (e) {
  console.error(`\n\x1b[31mfalhou:\x1b[0m ${e.message}`);
  // A saída real do subprocesso vem junto quando existe — sem ela, um `Command failed` obriga
  // quem está do outro lado a adivinhar, e foi o que aconteceu em 03/09/2026.
  const saida = [e.stdout, e.stderr].filter(Boolean).join("\n").trim();
  if (saida) console.error(`\n${saida}`);
  console.error("\nO README de apps/native-smoke/ tem o que cada passo faz e o que costuma quebrar.");
  process.exit(1);
}
