// A medição da Etapa 1 do [`NATIVE.md`](../docs/NATIVE.md) — "medir a cor antes de prometer qualquer
// coisa". Autorizada pelo Victor em 15/08/2026.
//
//   node scripts/measure-color-native.mjs
//
// A PERGUNTA: os 152 tokens de cor da Aurea são `oklch`. O amarelo primário
// `oklch(0.795 0.184 86.047)` é declarado INTOCÁVEL no CLAUDE.md. Nenhuma fonte confiável diz que
// o `StyleSheet` do React Native aceita `oklch()`, então o alvo nativo provavelmente recebe hex —
// e converter oklch → sRGB é mapeamento de gamute, que pode ter PERDA. Se tiver, a marca muda no
// aparelho e o gate de pixel desta casa não vê, porque ele mede o navegador.
//
// POR QUE A CONTA É CONFERIDA CONTRA O NAVEGADOR, e não só escrita: as matrizes de OKLab→sRGB são
// constantes de especificação, e eu as escreveria de memória. Memória é exatamente o que este
// repositório não aceita como fonte. Então o script pinta cada cor no Chromium com `oklch()`,
// lê o pixel composto de volta e compara com a minha conta. Se as duas divergirem, o número que
// vale é o do navegador e a conta está errada — não o contrário.
//
// O QUE ESTA MEDIÇÃO NÃO FAZ, e está declarado no NATIVE.md §5: ela NÃO roda em aparelho. Esta
// máquina é Windows, sem SDK Android, e simulador iOS exige macOS. O que ela responde é se existe
// perda NA CONVERSÃO — que é o que decide se a viagem ao aparelho é uma decisão ou uma
// confirmação.
import {chromium} from "@playwright/test";
import {readFileSync} from "node:fs";

// ── A conta (CSS Color 4 / OKLab de Björn Ottosson) ──────────────────────────────────────────
const oklabParaLinearSrgb = (L, a, b) => {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
};
const linearSrgbParaOklab = (r, g, b) => {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ];
};
const gama = (c) => c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
const desgama = (c) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
const oklchParaOklab = (L, C, H) => [L, C * Math.cos(H * Math.PI / 180), C * Math.sin(H * Math.PI / 180)];
const dEok = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const hex2 = (n) => n.toString(16).padStart(2, "0");

// ── Os tokens ────────────────────────────────────────────────────────────────────────────────
const tokens = JSON.parse(readFileSync(new URL("../packages/tokens/src/aurea.tokens.json", import.meta.url), "utf8"));
const cores = [];
(function anda(no, caminho) {
  if (!no || typeof no !== "object") return;
  if (no.$value !== undefined) {
    const v = no.$value;
    if (v && v.colorSpace === "oklch") cores.push({nome: caminho, L: v.components[0], C: v.components[1], H: v.components[2], A: v.alpha});
    return;
  }
  for (const [k, filho] of Object.entries(no)) if (!k.startsWith("$")) anda(filho, caminho ? `${caminho}.${k}` : k);
})(tokens, "");

// ── Medição 1: cabe no sRGB? ─────────────────────────────────────────────────────────────────
const FORA = 1e-6; // tolerância: canal a 1.0000001 é arredondamento, não gamute estourado
for (const c of cores) {
  const [L, a, b] = oklchParaOklab(c.L, c.C, c.H);
  const lin = oklabParaLinearSrgb(L, a, b);
  c.foraDoGamute = lin.some(x => x < -FORA || x > 1 + FORA);
  c.excesso = Math.max(0, ...lin.map(x => Math.max(-x, x - 1)));
  const cortado = lin.map(x => Math.min(1, Math.max(0, x)));
  c.hex = "#" + cortado.map(x => hex2(Math.round(gama(x) * 255))).join("");
  // O que o hex de 8 bits REALMENTE devolve quando lido de volta — inclui o corte de gamute E o
  // arredondamento para 255 níveis. É o erro que o aparelho veria.
  const devolta = [0, 1, 2].map(i => desgama(parseInt(c.hex.slice(1 + i * 2, 3 + i * 2), 16) / 255));
  c.dE = dEok([L, a, b], linearSrgbParaOklab(...devolta));
}

const foraDoGamute = cores.filter(c => c.foraDoGamute);
const amarelo = cores.find(c => Math.abs(c.L - 0.795) < 1e-9 && Math.abs(c.C - 0.184) < 1e-9);

console.log(`## Os ${cores.length} tokens de cor, convertidos para sRGB\n`);
console.log(`- **fora do gamute sRGB:** ${foraDoGamute.length} de ${cores.length}`);
const pior = [...cores].sort((a, b) => b.dE - a.dE)[0];
console.log(`- **maior erro de ida e volta (ΔEok):** ${pior.dE.toFixed(5)} — \`${pior.nome}\``);
console.log(`- **erro do amarelo primário:** ${amarelo ? amarelo.dE.toFixed(5) + " → `" + amarelo.hex + "`" : "(não encontrado)"}`);
if (foraDoGamute.length) {
  console.log("\n| token fora do gamute | excesso no canal | ΔEok após o corte | hex |");
  console.log("|---|---:|---:|---|");
  for (const c of foraDoGamute.sort((a, b) => b.excesso - a.excesso))
    console.log(`| \`${c.nome}\` | ${c.excesso.toFixed(4)} | ${c.dE.toFixed(5)} | \`${c.hex}\` |`);
}

// ── Medição 2: a conta acima bate com o que o NAVEGADOR pinta? ───────────────────────────────
// Sem esta parte o relatório seria a minha memória das matrizes com cara de número.
// LÊ O PIXEL RASTERIZADO, e não `getComputedStyle`. A primeira versão desta parte usava o estilo
// computado e imprimiu "0 de divergência" tendo comparado ZERO cores: o Chromium devolve
// `oklch(...)` sem resolver, e o filtro de `rgb(` pulava todas — verde que não era, o defeito que
// este repositório mais paga. O canvas obriga o motor a RASTERIZAR em bytes sRGB, que é
// exatamente o que a tela recebe.
const navegador = await chromium.launch();
const pagina = await navegador.newPage();
await pagina.setContent("<canvas id=c width=1 height=1></canvas>");
const lidos = await pagina.evaluate((lista) => {
  const ctx = document.getElementById("c").getContext("2d", {colorSpace: "srgb", willReadFrequently: true});
  return lista.map(c => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 1, 1);
    ctx.fillStyle = `oklch(${c.L} ${c.C} ${c.H})`;
    // Se o motor NÃO entendeu a sintaxe, `fillStyle` fica com o valor anterior — daí o preto
    // proposital acima: cor que volta preta é sinal de sintaxe não suportada, não de medição.
    const aceitou = ctx.fillStyle !== "#000000";
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return {nome: c.nome, rgb: [r, g, b], aceitou};
  });
}, cores.map(({nome, L, C, H}) => ({nome, L, C, H})));
await navegador.close();

let comparados = 0, divergentes = 0, maiorDiff = 0, exemplo = null;
const naoAceitos = lidos.filter(l => !l.aceitou).length;
for (const l of lidos) {
  const meu = cores.find(c => c.nome === l.nome);
  meu.navegador = `rgb(${l.rgb.join(", ")})`;
  if (!l.aceitou) continue;
  comparados++;
  const rgbMeu = [1, 3, 5].map(i => parseInt(meu.hex.slice(i, i + 2), 16));
  const diff = Math.max(...l.rgb.map((v, i) => Math.abs(v - rgbMeu[i])));
  if (diff > maiorDiff) { maiorDiff = diff; exemplo = {nome: l.nome, nav: meu.navegador, meu: meu.hex}; }
  if (diff > 1) divergentes++;
}

console.log("\n## A conta contra o que o navegador RASTERIZA (Chromium, canvas 2D)\n");
console.log(`- **cores efetivamente comparadas:** ${comparados} de ${cores.length}` +
            (naoAceitos ? ` (${naoAceitos} não aceitas pelo motor — não entram na conta)` : ""));
console.log(`- **maior diferença por canal (0–255):** ${maiorDiff}`);
console.log(`- **tokens divergindo mais de 1/255:** ${divergentes}`);
if (exemplo) console.log(`- **onde mais diverge:** \`${exemplo.nome}\` — rasterizado ${exemplo.nav}, conta \`${exemplo.meu}\``);
if (amarelo) console.log(`- **amarelo primário:** rasterizado \`${amarelo.navegador}\`, conta \`${amarelo.hex}\``);
console.log(comparados === 0
  ? "\n**⚠ NADA foi comparado. A validação não vale — não afirme que a conta está provada.**"
  : maiorDiff <= 1
    ? "\n**A conta está provada contra o motor.** Diferença dentro do arredondamento de 8 bits."
    : "\n**⚠ A conta DIVERGE do que o navegador pinta. O número que vale é o do navegador.**");

// ── Medição 3: A PERGUNTA QUE DECIDE ─────────────────────────────────────────────────────────
// O corte de gamute acima é o que acontece numa tela sRGB — e o navegador faz o MESMO corte lá.
// Se ele corta igual, então mandar hex para o nativo não perde nada numa tela comum: o usuário já
// via a cor cortada na web. A perda só existe onde o navegador consegue pintar MAIS: numa tela de
// gamute largo (P3). Então o que se mede aqui é quanto o P3 recupera — porque é exatamente isso
// que um app nativo alimentado por hex deixaria na mesa.
const nav2 = await chromium.launch();
const p2 = await nav2.newPage();
await p2.setContent("<canvas id=c width=1 height=1></canvas>");
const p3 = await p2.evaluate((lista) => {
  const cv = document.getElementById("c");
  const srgb = cv.getContext("2d", {colorSpace: "srgb", willReadFrequently: true});
  let ctx = null;
  try { ctx = document.createElement("canvas").getContext("2d", {colorSpace: "display-p3", willReadFrequently: true}); } catch { /* sem suporte */ }
  const suportaP3 = !!ctx && ctx.getContextAttributes?.().colorSpace === "display-p3";
  if (!suportaP3) return {suportaP3: false, itens: []};
  ctx.canvas.width = ctx.canvas.height = 1;
  return {suportaP3: true, itens: lista.map(c => {
    srgb.fillStyle = `oklch(${c.L} ${c.C} ${c.H})`;
    srgb.fillRect(0, 0, 1, 1);
    ctx.fillStyle = `oklch(${c.L} ${c.C} ${c.H})`;
    ctx.fillRect(0, 0, 1, 1);
    return {nome: c.nome,
            emSrgb: [...srgb.getImageData(0, 0, 1, 1).data].slice(0, 3),
            emP3: [...ctx.getImageData(0, 0, 1, 1, {colorSpace: "display-p3"}).data].slice(0, 3)};
  })};
}, cores.map(({nome, L, C, H}) => ({nome, L, C, H})));

console.log("\n## O que o gamute largo (Display P3) recupera — a perda REAL do hex\n");
if (!p3.suportaP3) {
  console.log("- **o Chromium desta máquina não expõe canvas em `display-p3`** — esta metade não foi medida.");
} else {
  // Os bytes vêm em espaços diferentes; o que interessa é se o P3 pinta ALGO diferente do sRGB
  // para os que estouram o gamute. Igualdade byte a byte significaria que não há o que recuperar.
  const foraNome = new Set(foraDoGamute.map(c => c.nome));
  const difs = p3.itens.filter(i => foraNome.has(i.nome))
    .map(i => ({nome: i.nome, delta: Math.max(...i.emP3.map((v, n) => Math.abs(v - i.emSrgb[n])))}))
    .sort((a, b) => b.delta - a.delta);
  const am = p3.itens.find(i => i.nome === "base.brand-yellow");
  console.log(`- **tokens fora do gamute que o P3 pinta diferente:** ${difs.filter(d => d.delta > 1).length} de ${difs.length}`);
  if (difs[0]) console.log(`- **maior diferença sRGB→P3 (byte):** ${difs[0].delta} — \`${difs[0].nome}\``);
  if (am) console.log(`- **amarelo primário:** sRGB \`rgb(${am.emSrgb.join(", ")})\` · P3 \`rgb(${am.emP3.join(", ")})\``);
}

// ── Medição 4: o `p3` que o ADAPTER emite é a mesma cor? ─────────────────────────────────────
// A Etapa 2 gera `color(display-p3 …)` para cada token, e as matrizes sRGB→XYZ→P3 do gerador são
// constante de especificação que eu escrevi de memória — de novo. Então a mesma disciplina da
// Medição 2 se aplica: pinta-se o `oklch()` da fonte e o `color(display-p3 …)` gerado NO MESMO
// canvas P3 e compara-se byte a byte. Se divergirem, o gerador está errado.
const nativo = await import(new URL("../packages/tokens/dist/aurea.tokens.native.js", import.meta.url));
const camel = s => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const paraChecar = cores.map(c => {
  const partes = c.nome.split(".");
  const chave = camel(partes.at(-1));
  const grupo = partes[0] === "base" ? nativo.base
    : partes[0] === "theme" ? nativo.themes[partes[1]]
    : nativo.densities[partes[1]];
  const tok = grupo?.[chave];
  return tok && tok.p3 ? {nome: c.nome, L: c.L, C: c.C, H: c.H, A: c.A, p3: tok.p3, hex: tok.hex} : null;
}).filter(Boolean);

const prova = await p2.evaluate((lista) => {
  let ctx;
  try { ctx = document.createElement("canvas").getContext("2d", {colorSpace: "display-p3", willReadFrequently: true}); } catch { return null; }
  if (!ctx || ctx.getContextAttributes?.().colorSpace !== "display-p3") return null;
  ctx.canvas.width = ctx.canvas.height = 1;
  const pinta = (cor) => { ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 1, 1); ctx.fillStyle = cor;
    const ok = ctx.fillStyle !== "#000000"; ctx.fillRect(0, 0, 1, 1);
    return {rgb: [...ctx.getImageData(0, 0, 1, 1, {colorSpace: "display-p3"}).data].slice(0, 3), ok}; };
  // O ALFA VAI JUNTO. A primeira versao desta prova reconstruia a cor de origem sem ele e
  // acusou `theme.dark.border` (oklch(1 0 0 / 0.1)) divergindo 229 de 255 — era o harness
  // pintando branco opaco contra um gerado translucido, nao o gerador errado.
  const fonteDe = c => `oklch(${c.L} ${c.C} ${c.H}${c.A === undefined ? "" : ` / ${c.A}`})`;
  return lista.map(c => ({nome: c.nome, fonte: pinta(fonteDe(c)), gerado: pinta(c.p3)}));
}, paraChecar);
await nav2.close();

console.log("\n## O `p3` do adapter contra a fonte `oklch`, no mesmo canvas P3\n");
if (!prova) {
  console.log("- **canvas `display-p3` indisponível** — esta prova não rodou.");
} else {
  const validos = prova.filter(p => p.fonte.ok && p.gerado.ok);
  let pior = 0, ondePior = null;
  for (const p of validos) {
    const d = Math.max(...p.fonte.rgb.map((v, i) => Math.abs(v - p.gerado.rgb[i])));
    if (d > pior) { pior = d; ondePior = p; }
  }
  console.log(`- **cores comparadas:** ${validos.length} de ${paraChecar.length}`);
  console.log(`- **maior diferença por canal (0–255):** ${pior}`);
  if (ondePior) console.log(`- **onde mais diverge:** \`${ondePior.nome}\` — fonte rgb(${ondePior.fonte.rgb}), gerado rgb(${ondePior.gerado.rgb})`);
  console.log(validos.length === 0
    ? "\n**⚠ NADA foi comparado — a prova não vale.**"
    : pior <= 1
      ? "\n**As matrizes do adapter estão provadas.** O `p3` emitido é a mesma cor que o `oklch` da fonte."
      : "\n**⚠ O `p3` emitido NÃO é a mesma cor da fonte. O gerador está errado.**");
}
