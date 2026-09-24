// O que o interpretador de cor do REACT NATIVE aceita — e o que ele recusa.
//
//   node scripts/measure-color-rn-parser.mjs
//
// POR QUE ISTO EXISTE, e por que ele não estava aqui desde o começo: a Etapa 1 do NATIVE.md
// mediu a COR (quanto se perde ao converter) e a ADR-0027 decidiu emitir gamute largo mais hex.
// Ficou como "ponto de aparelho" a pergunta de se o React Native pinta o valor largo — e eu mandei
// o Victor instalar Expo, Expo Go e parear celular para descobrir.
//
// Era desnecessário. O `StyleSheet` do React Native resolve cor com `@react-native/normalize-colors`,
// que é **JavaScript puro** e roda no Node. Se ele recusa a string, não existe pergunta de
// aparelho: a cor nunca chega à tela. A medição custa segundos e não custa hardware.
//
// LIMITE DECLARADO, para não virar conclusão maior do que é: isto mede o caminho de STRING de
// estilo, que é como 100% da Aurea usaria cor. NÃO cobre `PlatformColor()` nem `DynamicColorIOS()`,
// que buscam cor por NOME num catálogo nativo e não passam por este interpretador. Um caminho de
// gamute largo por catálogo de assets continua possível — e continua não medido.
//
// A DEPENDÊNCIA NÃO ENTRA NESTE REPOSITÓRIO. O `BUILDING.md` §3.3 manda parar e chamar o Victor
// antes de somar dependência, e uma medição pontual não justifica isso. O script procura o módulo
// onde ele já exista; se não achar, diz como obtê-lo numa pasta descartável.
import {createRequire} from "node:module";
import {existsSync} from "node:fs";

const CANDIDATOS = [
  new URL("../node_modules/", import.meta.url).pathname,
  "C:/dev/teste-cor/node_modules/",
  process.env.RN_COLORS_DIR ? process.env.RN_COLORS_DIR + "/node_modules/" : null,
].filter(Boolean);

let norm = null, versao = null;
for (const base of CANDIDATOS) {
  const alvo = base + "@react-native/normalize-colors/package.json";
  const caminho = alvo.replace(/^\//, "").match(/^[A-Za-z]:/) ? alvo.replace(/^\//, "") : alvo;
  if (!existsSync(caminho)) continue;
  const req = createRequire(import.meta.url);
  try {
    const m = req(caminho.replace("/package.json", ""));
    norm = typeof m === "function" ? m : (m.default ?? m.normalizeColor);
    versao = req(caminho).version;
    break;
  } catch { /* tenta o próximo */ }
}

if (!norm) {
  console.error(
    "Não achei `@react-native/normalize-colors`.\n\n"
    + "Ele NÃO é dependência deste repositório de propósito. Para rodar a medição, instale-o numa\n"
    + "pasta descartável e aponte para ela:\n\n"
    + "  mkdir rn-cor && cd rn-cor && npm i @react-native/normalize-colors@latest\n"
    + "  RN_COLORS_DIR=<caminho-da-pasta> node scripts/measure-color-rn-parser.mjs\n");
  process.exit(1);
}

// Os formatos que interessam: os três que o alvo nativo emite, mais os vizinhos, para a resposta
// não parecer específica de um deles.
const CASOS = [
  ["hex", "#f0b100", "o que a Aurea emite como fallback"],
  ["rgb()", "rgb(240, 177, 0)", "a forma clássica"],
  ["hsl()", "hsl(44, 100%, 47%)", "a outra forma clássica"],
  ["hwb()", "hwb(44 0% 6%)", ""],
  ["color(display-p3 …)", "color(display-p3 0.9037 0.7031 0.0745)", "O GAMUTE LARGO da ADR-0027"],
  ["color(srgb …)", "color(srgb 0.94 0.69 0)", "a sintaxe color() sem gamute largo"],
  ["oklch()", "oklch(0.795 0.184 86.047)", "A FONTE dos tokens da Aurea"],
  ["oklab()", "oklab(0.795 0.0125 0.1836)", ""],
  ["lab()", "lab(50% 40 59.5)", ""],
  ["lch()", "lch(50% 70 56)", ""],
  ["color-mix()", "color-mix(in oklch, #f0b100, red)", ""],
];

const rgba = (n) => `rgba(${(n >>> 24) & 255}, ${(n >>> 16) & 255}, ${(n >>> 8) & 255}, ${((n & 255) / 255).toFixed(2)})`;

console.log(`## O interpretador de cor do React Native — versão ${versao}\n`);
console.log("| formato | aceito? | resultado | |");
console.log("|---|:--:|---|---|");
let aceitos = 0;
const recusados = [];
for (const [nome, valor, nota] of CASOS) {
  let r;
  try { r = norm(valor); } catch { r = null; }
  const ok = typeof r === "number";
  if (ok) aceitos++; else recusados.push(nome);
  console.log(`| \`${nome}\` | ${ok ? "**sim**" : "não"} | ${ok ? rgba(r) : "—"} | ${nota} |`);
}
console.log(`\n**${aceitos} de ${CASOS.length} aceitos.** Recusados: ${recusados.join(", ")}.`);

// A conclusão que decide o alvo nativo, escrita pelo próprio resultado — não à mão.
const p3ok = typeof norm("color(display-p3 0.9037 0.7031 0.0745)") === "number";
const oklchok = typeof norm("oklch(0.795 0.184 86.047)") === "number";
console.log("\n" + (p3ok || oklchok
  ? "**O caminho de gamute largo EXISTE por string de estilo.** Reabra a ADR-0027: a decisão dela\n"
    + "supunha que não existia, e passa a valer o caminho medido aqui."
  : "**O gamute largo NÃO é alcançável por string de estilo nesta versão.** Então `hex` não é o\n"
    + "*fallback* do alvo nativo: é o ÚNICO caminho vivo hoje. Os campos `p3` e `oklch` do\n"
    + "`aurea.tokens.native.js` são intenção registrada para quando isto mudar, não API consumível.\n"
    + "E a pergunta que estava marcada como \"de aparelho\" some: a cor não chega à tela para ser\n"
    + "comparada."));
