// Confere o BUNDLE — o JS que o telefone realmente recebe.
//
//     node apps/native-smoke/conferir-bundle.mjs
//
// 🔴 POR QUE ISTO EXISTE, e por que ele fica separado do `rodar.mjs`.
//
// Em 09/09/2026 o mesmo erro de tela voltou QUATRO vezes. Três causas de entrega foram achadas e
// consertadas (o npm que não reinstalava, o `git pull` que abortava, o gate cego), e na quarta o
// terminal saiu inteiramente limpo — e a tela vermelha continuou igual.
//
// A pergunta que faltava não era "o código está certo?" nem "o pacote instalado está certo?".
// Essas duas foram medidas várias vezes. **Era "o que o telefone está executando?"** — e a única
// resposta honesta é ler o bundle.
//
// Ele constrói o bundle de verdade — com `--no-bytecode`, porque o padrão sai compilado para o
// motor JavaScript do RN e não se lê como texto — e confere cada `accessibilityRole` contra a
// INTERSEÇÃO das duas listas do
// react-native instalado: a união do TypeScript e o enum do Android. É a mesma conta do `check 41`
// do validador, um degrau adiante: **o check 41 lê o que escrevemos; este lê o que roda.**
//
// ⚠ Fica FORA do `rodar.mjs` de propósito: construir o bundle leva minutos, e pagar isso a cada
// execução tornaria o instrumento caro demais para ser usado. Aqui ele é a segunda pergunta,
// feita quando a primeira já não explica.
import {execSync} from "node:child_process";
import {existsSync, readFileSync, readdirSync, rmSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = join(aqui, "..", "..");
const saida = join(aqui, ".bundle-conferencia");

const rn = join(raiz, "packages/native/node_modules/react-native");
const dts = join(rn, "Libraries/Components/View/ViewAccessibility.d.ts");
const kt = join(rn, "ReactAndroid/src/main/java/com/facebook/react/uimanager/ReactAccessibilityDelegate.kt");
for (const f of [dts, kt]) {
  if (!existsSync(f)) {
    console.error(`\nnão achei ${f} — rode \`pnpm install\` antes.\n`);
    process.exit(1);
  }
}
const ts = new Set(
  [...readFileSync(dts, "utf8").match(/export type AccessibilityRole =\s*([\s\S]*?);/)[1]
    .matchAll(/'([^']+)'/g)].map((m) => m[1]));
const android = new Set(
  readFileSync(kt, "utf8").match(/public enum class AccessibilityRole \{([\s\S]*?);/)[1]
    .replace(/\n/g, "").split(",").map((w) => w.trim().toLowerCase()).filter(Boolean));
const validos = new Set([...ts].filter((v) => android.has(v)));

console.log(`papéis servíveis: ${validos.size} (TypeScript ${ts.size} ∩ Android ${android.size})`);
console.log("construindo o bundle — leva alguns minutos…\n");

rmSync(saida, {recursive: true, force: true});
execSync(`npx expo export --platform android --no-bytecode --output-dir "${saida}"`,
         {cwd: aqui, stdio: "inherit"});

const pastaJs = join(saida, "_expo", "static", "js", "android");
const arq = readdirSync(pastaJs).find((f) => f.endsWith(".js"));
if (!arq) throw new Error("o export não produziu bundle .js");
const bundle = readFileSync(join(pastaJs, arq), "utf8");

const achados = new Map();
for (const m of bundle.matchAll(/accessibilityRole:\s*"([^"]+)"/g)) {
  achados.set(m[1], (achados.get(m[1]) ?? 0) + 1);
}
const maus = [...achados.keys()].filter((v) => !validos.has(v));

console.log(`\nbundle: ${arq} (${(bundle.length / 1e6).toFixed(1)} MB)\n`);
for (const [v, n] of [...achados].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(3)}x  ${v}${validos.has(v) ? "" : "   <-- INVÁLIDO"}`);
}
if (maus.length) {
  console.error(`\n\x1b[31mO bundle emite papel inválido: ${maus.join(", ")}.\x1b[0m`);
  console.error("O Android lança `Invalid accessibility role value` e a tela cai.\n");
  process.exit(1);
}
// ─────────────────────────────────────────────────────────────────────────────────────────────
// A SEGUNDA PERGUNTA DO BUNDLE — 10/09/2026: **a tela sai em português?**
//
// 🔴 POR QUE ISTO EXISTE: em 09/09 o Victor mandou foto do aparelho com `"Waiting for approval."`
// e `"This may be out of date."` no meio de uma tela em português. A biblioteca estava CERTA — o
// `App.js` é que não passava `strings={ptBR}` ao provider, e sem isso o inglês é o padrão
// correto. Um teste unitário não pega: ele monta o provider que o próprio teste escreveu, não o
// do app.
//
// ⚠ E A ARMADILHA AQUI NÃO É A FRASE, É A CODIFICAÇÃO. O minificador emite não-ASCII como escape
// HEX — `Esperando aprova\xe7\xe3o.` —, então um `grep` pela frase acentuada devolve **zero** e
// quem confiar nele conclui que a tradução não chegou. Isso aconteceu ao escrever este bloco:
// quatro das sete deram zero, e as três que "passaram" eram exatamente as sem acento. **O padrão
// do zero foi a pista.** Um segundo palpite, `\u00e9`, também estava errado. Só ler os bytes ao
// redor resolveu. Por isso a conferência abaixo aceita as DUAS formas.
const FRASES_PT = [
  "Esperando alguém agir.", "Esperando aprovação.", "Esperando outra coisa terminar.",
  "Sem conexão. Isto foi carregado antes.", "Isto pode estar desatualizado.",
  "Parte disto não pôde ser carregada.", "Funcionando com capacidade reduzida.",
];
const emHex = (t) => [...t].map((c) => (c.codePointAt(0) < 128 ? c
  : `\\x${c.codePointAt(0).toString(16).padStart(2, "0")}`)).join("");

const semFrase = FRASES_PT.filter((f) => !bundle.includes(f) && !bundle.includes(emHex(f)));
const passaTabela = /strings:\s*[\w$.]*ptBR/.test(bundle);

console.log(`\nfrases em português no bundle: ${FRASES_PT.length - semFrase.length}/${FRASES_PT.length}`);
console.log(`o App passa \`strings={ptBR}\` ao provider: ${passaTabela ? "sim" : "NÃO"}`);
if (semFrase.length || !passaTabela) {
  console.error("\n\x1b[31mA tela vai sair em inglês.\x1b[0m");
  if (!passaTabela) console.error("  O `App.js` não passa `strings={ptBR}` — o provider cai no `defaultStrings`.");
  for (const f of semFrase) console.error(`  frase ausente: ${f}`);
  process.exit(1);
}

console.log("\n\x1b[32mtodos os papéis do bundle são servíveis, e a tabela pt-BR chegou.\x1b[0m");
console.log("Se o aparelho ainda mostrar `Invalid accessibility role value`, ele NÃO está");
console.log("executando este bundle — feche o Expo Go por completo e leia o QR de novo.\n");
rmSync(saida, {recursive: true, force: true});
