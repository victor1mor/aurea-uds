// Aurea — emit CSS custom properties from the DTCG 2025.10 token file.
// No dependencies. Single source of truth: packages/tokens/src/aurea.tokens.json.
//
// DTCG 2025.10 has no stable theming module (Resolver/modes is a draft), so Aurea
// maps top-level groups to CSS selectors ($extensions.ui.aurea.selectors) and emits
// references as runtime CSS var() (leaf name), preserving theme/density switching.
import {readFileSync, writeFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname, join} from "node:path";
// A serialização de `$value` mora em `token-value.mjs` porque o catálogo também precisa dela —
// ver o cabeçalho de lá. Aqui ficou só o que é do ALVO CSS e do ALVO NATIVO.
import {num, serialize} from "./token-value.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "packages/tokens/src/aurea.tokens.json");
const OUT = join(root, "packages/tokens/dist/aurea.tokens.css");

function emitGroup(selector, group) {
  let out = `${selector}{\n`;
  for (const [name, tok] of Object.entries(group)) {
    if (name.startsWith("$")) continue;
    out += `  --${name}:${serialize(tok.$type, tok.$value)};\n`;
  }
  return out + "}\n";
}

const dtcg = JSON.parse(readFileSync(SRC, "utf8"));
const sel = dtcg.$extensions["ui.aurea"].selectors;

let css = "/* Aurea tokens — generated from aurea.tokens.json (DTCG 2025.10). Do not edit. */\n";
css += emitGroup(sel.base, dtcg.base);
css += emitGroup(sel["theme.dark"], dtcg.theme.dark);
css += emitGroup(sel["theme.light"], dtcg.theme.light);
// AS MARCAS vêm DEPOIS do tema e ANTES da densidade, e a ordem não é estética: o seletor de
// marca (`[data-brand][data-theme]`, duas classes de atributo) já ganha do seletor de tema por
// especificidade, mas emitir depois torna a intenção legível para quem lê a folha gerada.
// Uma marca redefine COR e nada mais — tipo, raio, densidade e ícone continuam da Aurea
// (ADR-0036). Sem `data-brand` no documento, nada disto se aplica e a Aurea é a de sempre.
for (const [nome, marca] of Object.entries(dtcg.brand ?? {})) {
  if (nome.startsWith("$")) continue;
  for (const tema of ["dark", "light"]) {
    const chave = `brand.${nome}.${tema}`;
    if (!sel[chave]) throw new Error(`marca sem seletor declarado: ${chave}`);
    css += emitGroup(sel[chave], marca[tema]);
  }
}
css += emitGroup(sel["density.compact"], dtcg.density.compact);
css += emitGroup(sel["density.comfortable"], dtcg.density.comfortable);
css += emitGroup(sel["density.spacious"], dtcg.density.spacious);

writeFileSync(OUT, css);
writeFileSync(join(root, "packages/tokens/dist/aurea.tokens.css.d.ts"),
  "// Gerado por scripts/build-tokens.mjs. A folha de estilo não exporta nada — este arquivo\n"
  + "// existe para a condição `types` do subpath ./css do mapa `exports`.\n"
  + "export {};\n");
console.log("build-tokens: wrote", OUT.replace(root + "\\", "").replace(root + "/", ""));

// ═══════════════════════════════════════════════════════════════════════════════════════════
// ALVO NATIVO — Etapa 2 do NATIVE.md, autorizada pelo Victor em 15/08/2026.
//
// Mora AQUI e não num script próprio: quem lê o DTCG é este arquivo, e duas cópias dele seriam
// duas verdades sobre a mesma fonte. (A SERIALIZAÇÃO de `$value` saiu para `token-value.mjs` numa
// sessão paralela, porque o gerador do catálogo também precisava dela — mesma regra, um dono só.)
//
// O que o alvo nativo NÃO pode fazer, e por isso ele não é "o mesmo CSS em JS":
//   • não há cascata — o alias `{brand-yellow}` vira `var(--brand-yellow)` no CSS e o navegador
//     resolve em tempo de execução. Aqui ele tem de ser RESOLVIDO no build, por grupo;
//   • não há `rem` — o React Native mede em dp. O multiplicador é 16 e foi MEDIDO no navegador
//     (raiz sem `font-size` declarado = 16px), não presumido;
//   • não há `em` — `letterSpacing` no React Native é ABSOLUTO. Os 5 tokens de `tracking` saem
//     como RAZÃO, num objeto separado, para o consumidor multiplicar pelo `fontSize`. Emiti-los
//     como dp daria um número certo num tamanho de fonte só e errado em todos os outros;
//   • `@media` não existe — os 5 breakpoints saem num objeto à parte, declarados como NÃO
//     sendo para `StyleSheet`.
//
// COR: cada uma sai em TRÊS formas — `hex`, `p3` e `oklch`. E é preciso ler a linha seguinte
// antes de usar qualquer uma delas:
//
//   HOJE SÓ O `hex` FUNCIONA. Medido em `node scripts/measure-color-rn-parser.mjs`: o
//   interpretador de cor do React Native RECUSA `color(display-p3 …)`, `color(srgb …)`, `oklch()`,
//   `oklab()`, `lab()`, `lch()` e `color-mix()` — nas versões 0.81.5 E 0.87.0, e ele é JavaScript
//   compartilhado entre iOS e Android. Passar `p3` ou `oklch` a um `style` faz a cor ser
//   DESCARTADA.
//
// Então por que emitir os três? Porque `p3` e `oklch` são **intenção registrada**, não API: a
// ADR-0027 mediu que 20 dos 95 `oklch` estouram o sRGB e que o amarelo da marca corta a ΔEok
// 0,0225 — em cima do limiar do perceptível. Essa perda é hoje TETO DA PLATAFORMA, não escolha
// nossa, e no dia em que o React Native aceitar gamute largo o valor já está aqui, medido e
// provado contra o rasterizador. Ver a §"A correção" da ADR-0027.
const P3_OUT = join(root, "packages/tokens/dist/aurea.tokens.native.js");
const REM_EM_DP = 16; // medido no Chromium: raiz sem font-size declarado = 16px

const oklabParaLinearSrgb = (L, a, b) => {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  return [+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
          -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
          -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s];
};
const linearSrgbParaLinearP3 = (r, g, b) => {
  // sRGB linear → XYZ (D65) → P3 linear. As matrizes são constante de especificação e estão
  // PROVADAS contra o rasterizador do Chromium em `scripts/measure-color-native.mjs`.
  const X = 0.4123907993 * r + 0.3575843394 * g + 0.1804807884 * b;
  const Y = 0.2126390059 * r + 0.7151686788 * g + 0.0721923154 * b;
  const Z = 0.0193308187 * r + 0.1191947798 * g + 0.9505321522 * b;
  return [ 2.4934969119 * X - 0.9313836179 * Y - 0.4027107845 * Z,
          -0.8294889696 * X + 1.7626640603 * Y + 0.0236246858 * Z,
           0.0358458302 * X - 0.0761723893 * Y + 0.9568845240 * Z];
};
const gama = c => c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
const corta = c => Math.min(1, Math.max(0, c));
const arred = (n, casas) => Number(n.toFixed(casas));

function corNativa(v) {
  if (v.colorSpace === "oklch") {
    const [L, C, H] = v.components;
    const rad = H * Math.PI / 180;
    const lin = oklabParaLinearSrgb(L, C * Math.cos(rad), C * Math.sin(rad));
    const hex = "#" + lin.map(x => Math.round(gama(corta(x)) * 255).toString(16).padStart(2, "0")).join("");
    const p3 = linearSrgbParaLinearP3(...lin).map(x => arred(gama(corta(x)), 4));
    const alfa = v.alpha === undefined ? "" : ` / ${num(v.alpha)}`;
    return {hex: v.alpha === undefined ? hex : hex + Math.round(v.alpha * 255).toString(16).padStart(2, "0"),
            p3: `color(display-p3 ${p3.join(" ")}${alfa})`,
            oklch: `oklch(${v.components.map(num).join(" ")}${alfa})`};
  }
  // srgb: já está no gamute por construção — as três formas são a mesma cor.
  const [r, g, b] = v.components;
  const hex = v.hex ?? "#" + [r, g, b].map(c => Math.round(c * 255).toString(16).padStart(2, "0")).join("");
  const a = v.alpha === undefined ? "" : ` / ${num(v.alpha)}`;
  return {hex: v.alpha === undefined ? hex : `rgba(${[r, g, b].map(c => Math.round(c * 255)).join(",")},${num(v.alpha)})`,
          p3: `color(display-p3 ${[r, g, b].map(c => arred(c, 4)).join(" ")}${a})`,
          oklch: null};
}

const camel = s => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const emDp = d => d.unit === "rem" ? arred(d.value * REM_EM_DP, 4) : d.value; // px e dp são 1:1

// Resolve `{alias}` pelo NOME DA FOLHA, olhando primeiro o próprio grupo e depois o base — que é
// a mesma precedência que a cascata do CSS dá ao seletor do tema/densidade sobre o `:root`.
// DEPENDE_DE_TEMA existe por um achado desta etapa, e ele é sobre o que a CASCATA ESCONDE.
// Seis tokens do `base` apontam para folhas que só existem por TEMA (`text-muted` →
// `{muted-foreground}`, e os cinco `chart-*`). No CSS isso funciona porque `var()` resolve no uso,
// já com o seletor do tema aplicado — a indireção é deliberada. Em JS não existe ligação tardia:
// um valor estático em `base` teria de escolher um tema, e escolheria errado na metade das vezes.
// Então eles NÃO saem no `base`: saem resolvidos DENTRO de cada tema, que é onde eles de fato
// pertencem. O `base` do alvo nativo é, por construção, o que não depende de tema.
const DEPENDE_DE_TEMA = Symbol("depende de tema");

function resolve(valor, grupo, base, tolerante = false) {
  let v = valor, voltas = 0;
  while (typeof v === "string" && /^\{.+\}$/.test(v)) {
    if (++voltas > 10) throw new Error("alias circular: " + valor);
    const folha = v.slice(1, -1).split(".").pop();
    const alvo = grupo[folha] ?? base[folha];
    if (!alvo) {
      if (tolerante) return DEPENDE_DE_TEMA;
      throw new Error(`alias não resolvido: ${v}`);
    }
    v = alvo.$value;
  }
  return v;
}

function grupoNativo(grupo, base, {tolerante = false, extras = {}} = {}) {
  const fora = {}, tracking = {}, breakpoints = {}, adiados = [];
  const vistos = new Map();
  for (const [nome, tok] of Object.entries({...grupo, ...extras})) {
    if (nome.startsWith("$")) continue;
    const chave = camel(nome);
    if (vistos.has(chave)) throw new Error(`colisão de nome em camelCase: ${nome} e ${vistos.get(chave)}`);
    vistos.set(chave, nome);
    const v = resolve(tok.$value, {...grupo, ...extras}, base, tolerante);
    if (v === DEPENDE_DE_TEMA) { adiados.push(nome); continue; }
    let destino = fora, saida;
    switch (tok.$type) {
      case "color": saida = corNativa(v); break;
      case "dimension":
        if (v.unit === "em") { destino = tracking; saida = v.value; break; }   // razão, não dp
        if (/^breakpoint/.test(nome)) { destino = breakpoints; saida = v.value; break; }
        saida = emDp(v); break;
      case "duration": saida = v.value; break;                                  // ms
      case "number": saida = v; break;
      case "cubicBezier": saida = v; break;
      case "fontFamily": saida = Array.isArray(v) ? v[0] : v; break;            // a família PEDIDA
      case "shadow": {
        // RN 0.76+ (Nova Arquitetura, obrigatória desde o Expo SDK 55) tem `boxShadow` com a
        // sintaxe do CSS, inclusive `spreadDistance` — então o mapeamento é 1:1 e NÃO há a perda
        // que o par shadowColor/elevation teria. As partes vão junto para quem preferir o objeto.
        const s = Array.isArray(v) ? v[0] : v;
        const rgba = `rgba(${s.color.components.map(c => Math.round(c * 255)).join(",")},${num(s.color.alpha ?? 1)})`;
        saida = {offsetX: emDp(s.offsetX), offsetY: emDp(s.offsetY), blurRadius: emDp(s.blur),
                 spreadDistance: emDp(s.spread ?? {value: 0, unit: "px"}), color: rgba};
        break;
      }
      default: throw new Error("unknown $type: " + tok.$type);
    }
    // MORRE em vez de emitir `undefined`, e isto é cicatriz. O `base.text-muted` estava declarado
    // `$type: "dimension"` apontando para uma COR, e o CSS nunca reclamou porque alias vira
    // `var()` antes de o tipo ser olhado. Aqui o ramo de `dimension` leu `.unit` de um objeto de
    // cor, devolveu `undefined`, e o `JSON.stringify` DESCARTA a chave — o token sumia do alvo
    // nativo em silêncio. Gerador que emite `undefined` é pior que gerador que quebra.
    if (saida === undefined || (typeof saida === "number" && Number.isNaN(saida)))
      throw new Error(`token "${nome}" ($type: ${tok.$type}) serializou para ${saida} — `
        + "quase sempre é o $type errado na fonte, não o valor");
    destino[chave] = saida;
  }
  return {fora, tracking, breakpoints, adiados};
}

const j = o => JSON.stringify(o, null, 2).replace(/\n/g, "\n");
const b = grupoNativo(dtcg.base, dtcg.base, {tolerante: true});
// Os adiados do `base` entram em CADA tema, resolvidos contra ele — ver DEPENDE_DE_TEMA.
const adiados = Object.fromEntries(b.adiados.map(n => [n, dtcg.base[n]]));
const temas = Object.fromEntries(Object.entries(dtcg.theme)
  .map(([k, g]) => [k, grupoNativo(g, dtcg.base, {extras: adiados}).fora]));
const dens = Object.fromEntries(Object.entries(dtcg.density).map(([k, g]) => [k, grupoNativo(g, dtcg.base).fora]));

let js = `// Aurea — alvo NATIVO, gerado de aurea.tokens.json (DTCG 2025.10). NÃO EDITAR À MÃO.
// Regravar: node scripts/build-tokens.mjs — e o check 36 do validador reprova se divergir.
//
// Etapa 2 do NATIVE.md. O que este arquivo é, e o que ele deliberadamente NÃO é, está escrito no
// gerador (scripts/build-tokens.mjs). Em resumo:
//   • dp, não rem: 1rem = ${REM_EM_DP}dp, MEDIDO no navegador (raiz sem font-size = 16px);
//   • cada cor em TRÊS formas — hex, p3 e oklch — mas HOJE SÓ O \`hex\` FUNCIONA: o interpretador
//     de cor do React Native recusa p3 e oklch (medido nas versões 0.81.5 e 0.87.0 por
//     \`node scripts/measure-color-rn-parser.mjs\`; é JS compartilhado entre iOS e Android). Passar
//     p3 ou oklch a um \`style\` faz a cor ser DESCARTADA. Os outros dois são intenção registrada
//     para quando isso mudar — ver a §"A correção" da ADR-0027;
//   • \`tracking\` é RAZÃO de em e não dp — letterSpacing no RN é absoluto, então o consumidor
//     multiplica pelo fontSize. Emitir dp daria certo num tamanho só;
//   • \`breakpoints\` NÃO é para StyleSheet — não há @media no RN. Vai para \`Dimensions\`;
//   • \`fontFamily\` é a família PEDIDA, não o nome que o RN aceita: o iOS quer o nome PostScript
//     e o Android o nome do arquivo, e o pacote @aurea-uds/fonts hoje só tem .woff2, que o RN não
//     lê. O nome final se decide quando os arquivos nativos entrarem;
//   • ${b.adiados.length} tokens que moram no \`base\` do DTCG saem DENTRO de cada tema, e não no
//     \`base\` daqui: ${b.adiados.join(", ")}. Eles apontam para folhas que só existem por tema, e no
//     CSS o \`var()\` resolve isso no uso. Em JS não há ligação tardia — pôr um valor estático no
//     base escolheria um tema e erraria no outro.
export const REM_EM_DP = ${REM_EM_DP};
export const base = ${j(b.fora)};
export const tracking = ${j(b.tracking)};
export const breakpoints = ${j(b.breakpoints)};
export const themes = ${j(temas)};
export const densities = ${j(dens)};
`;
writeFileSync(P3_OUT, js);
writeFileSync(P3_OUT.replace(/\.js$/, ".d.ts"),
  `// Gerado por scripts/build-tokens.mjs.
export type AureaColor = {hex: string; p3: string; oklch: string | null};
export type AureaShadow = {offsetX: number; offsetY: number; blurRadius: number; spreadDistance: number; color: string};
export declare const REM_EM_DP: number;
export declare const base: Record<string, number | string | number[] | AureaColor | AureaShadow>;
export declare const tracking: Record<string, number>;
export declare const breakpoints: Record<string, number>;
export declare const themes: Record<"dark" | "light", Record<string, AureaColor | number>>;
export declare const densities: Record<"compact" | "comfortable" | "spacious", Record<string, number>>;
`);
console.log("build-tokens: wrote", P3_OUT.replace(root + "\\", "").replace(root + "/", ""),
  `(${Object.keys(b.fora).length} base, ${Object.keys(b.tracking).length} tracking, ${Object.keys(b.breakpoints).length} breakpoints)`);
