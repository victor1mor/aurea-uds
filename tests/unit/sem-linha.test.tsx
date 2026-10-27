// SEM LINHA (16/10/2026). O Victor marcou na vitrine o segmentado, as abas e o aviso — "não tem borda, não tem linha
// ao redor, e isso acho bonito" — e, depois de comparar a Aurea de hoje com a proposta lado a lado em todas as
// páginas: "quero tudo sem borda, sem exceções". A referência principal faz o mesmo nos campos (a borda existe, com
// cor transparente) — ADR-0072.
//
// Este arquivo lê o CÓDIGO, e por isso pega todo estado — o mouse, o inválido, o escolhido, o arrastar —, o que a
// varredura do navegador (que mede a página parada) não alcança. Ele reprova:
//   · no CSS do core, no do site e no tema do editor de código: borda com cor que não seja transparente, e o anel
//     fino de `box-shadow` (deslocamento 0, desfoque 0, até 2 de espessura) — que desenha a mesma linha por outro
//     caminho;
//   · no nativo: `borderColor` (e os dos lados) com cor que não seja transparente. A ÚNICA cor permitida é a do
//     FOCO: no React Native o anel de foco é borda, e ele mostra onde o teclado está (não é contorno da peça).
// A espessura da borda fica (transparente): nenhuma medida muda.
//
// Provado contra o defeito (16/10/2026, medido): com os arquivos da 0.33.0, reprova 168 linhas no CSS do core, 15 no
// do site, 7 no tema do editor de código e 59 no nativo; com os de hoje, nenhuma.
import {describe, expect, it} from "vitest";
import {readFileSync, readdirSync} from "node:fs";
import {join} from "node:path";

const RAIZ = join(__dirname, "../..");
const ler = (p: string) => readFileSync(join(RAIZ, p), "utf8");
const semComentarioCss = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
const semComentarioJs = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " ")).replace(/(^|[^:"'`])\/\/[^\n]*/g, "$1");

/** Divide em espaços (ou vírgulas) de nível 0, fora de parênteses. */
function partir(v: string, sep: RegExp): string[] {
  const out: string[] = [];
  let nivel = 0, atual = "";
  for (const ch of v) {
    if (ch === "(") nivel++;
    else if (ch === ")") nivel--;
    if (nivel === 0 && sep.test(ch)) { if (atual.trim()) out.push(atual.trim()); atual = ""; }
    else atual += ch;
  }
  if (atual.trim()) out.push(atual.trim());
  return out;
}

const INVISIVEL = /^(transparent|none|0|0px|hidden|inherit|initial|unset|revert)$/i;
const ESTILO = /^(solid|dashed|dotted|double|groove|ridge|inset|outset|none|hidden)$/i;
const MEDIDA = /^(-?[\d.]+(px|em|rem)?|thin|medium|thick|calc\(.*\)|var\(--[\w-]*(width|size|space|spread|offset|bw|bi)[\w-]*\))$/i;

/** A borda desenha linha? (`border`, `border-<lado>`, `border-color`, `border-<lado>-color`) */
function bordaVisivel(prop: string, valor: string): boolean {
  const v = valor.replace(/\s*!important\s*$/i, "").trim();
  if (/-color$/i.test(prop)) return !INVISIVEL.test(v);
  const ps = partir(v, /\s/);
  if (ps.length === 1 && INVISIVEL.test(ps[0])) return false;
  const estilo = ps.find((p) => ESTILO.test(p));
  if (estilo && /^(none|hidden)$/i.test(estilo)) return false;
  const larguras = ps.filter((p) => MEDIDA.test(p));
  const cores = ps.filter((p) => !MEDIDA.test(p) && !ESTILO.test(p));
  if (cores.length === 0) return !larguras.every((l) => /^-?0(px)?$/.test(l)); // sem cor = currentColor
  return !cores.every((c) => INVISIVEL.test(c));
}

/** O `box-shadow` tem um anel fino (a mesma linha, por outro caminho)? */
function anelFino(valor: string): boolean {
  return partir(valor.replace(/\s*!important\s*$/i, ""), /,/).some((camada) => {
    const partes = partir(camada, /\s/);
    const nums = partes.filter((p) => MEDIDA.test(p));
    if (nums.length !== 4) return false;
    const [x, y, desfoque, espalha] = nums;
    const zero = (s: string) => /^-?0(px)?$/.test(s);
    if (!zero(x) || !zero(y) || !zero(desfoque) || zero(espalha)) return false;
    const n = /^([\d.]+)px$/.exec(espalha);
    return n ? Number(n[1]) <= 2 : /border-width|space-05|calc\(/.test(espalha);
  });
}

const PROP_CSS = /(?<![\w-])(border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?(?:-color)?|box-shadow)\s*:\s*([^;{}]+?)\s*(?=;|})/gi;

// A ÚNICA linha que fica (o Victor, 16/10/2026: "caixa B, o resto tudo B"): o cartão de contorno — a caixa da
// vitrine — com a linha clara, o texto a 10%. Só ela, só a cor da borda, só com esse seletor sozinho.
// E a que só ACENDE quando o sistema pede mais contraste (ADR-0083, 26/10/2026): o contorno de 3:1 dos campos, na cor
// `--input-strong`, só dentro de `@media (prefers-contrast:more)` — sem linha nenhuma, um campo branco nunca chega aos
// 3:1 da WCAG 1.4.11. Fora dessa preferência, o mesmo contorno reprova.
const LINHA_PERMITIDA_CSS: {seletor: string; prop: string; valor?: string; media?: string}[] = [
  {seletor: ".card-outline", prop: "border-color"},
  {seletor: ':is(.input,.textarea,.select,.input-group,.combobox-multi,.input-secondary,.textarea-secondary):where(:not([data-brand="lory"],[data-brand="lory"] *))',
    prop: "border-color", valor: "var(--input-strong)", media: "@media (prefers-contrast:more)"},
];

/** O seletor da regra em que a declaração está (o texto entre a última `}` ou `{` e a `{` dela). */
function seletorDe(css: string, pos: number): string {
  const abre = css.lastIndexOf("{", pos);
  const antes = Math.max(css.lastIndexOf("}", abre), css.lastIndexOf("{", abre - 1));
  return css.slice(antes + 1, abre).trim();
}

/** O `@media` que contém a posição (o mais de dentro), ou "" — lido pelas chaves, não pela distância. */
function mediaDe(css: string, pos: number): string {
  const pilha: string[] = [];
  let inicio = 0;
  for (let i = 0; i < pos; i++) {
    const c = css[i];
    if (c === "{") { pilha.push(css.slice(inicio, i).trim()); inicio = i + 1; }
    else if (c === "}") { pilha.pop(); inicio = i + 1; }
    else if (c === ";") inicio = i + 1;
  }
  return [...pilha].reverse().find((h) => h.startsWith("@media")) ?? "";
}

export function linhasNoCss(css: string, origem: string): string[] {
  const achadas: string[] = [];
  const limpo = semComentarioCss(css);
  for (const m of limpo.matchAll(PROP_CSS)) {
    const [, prop, valor] = m;
    const linha = limpo.slice(0, m.index).split("\n").length;
    const sel = seletorDe(limpo, m.index!);
    if (LINHA_PERMITIDA_CSS.some((p) => p.seletor === sel && p.prop === prop.toLowerCase()
      && (p.valor === undefined || p.valor === valor.trim())
      && (p.media === undefined || p.media === mediaDe(limpo, m.index!)))) continue;
    const ruim = prop.toLowerCase() === "box-shadow" ? anelFino(valor) : bordaVisivel(prop, valor);
    if (ruim) achadas.push(`${origem}:${linha} — ${prop}: ${valor.trim().slice(0, 80)}`);
  }
  return achadas;
}

const cssDoSite = () => {
  const fonte = ler("scripts/build-catalog.mjs");
  const ini = fonte.indexOf("const chrome = `") + "const chrome = `".length;
  return fonte.slice(ini, fonte.indexOf("`;", ini));
};

// No JS, o estilo é objeto: `border:"…"`, `borderRight:"…"`, `borderLeftColor:"…"`.
const PROP_JS = /\b(border(?:Top|Right|Bottom|Left|Inline|Block)?(?:Start|End)?(?:Color)?)\s*:\s*"([^"]*)"/g;
export function linhasNoJs(fonte: string, origem: string): string[] {
  const limpo = semComentarioJs(fonte);
  const achadas: string[] = [];
  for (const m of limpo.matchAll(PROP_JS)) {
    const [, prop, valor] = m;
    const css = prop.replace(/[A-Z]/g, (l) => "-" + l.toLowerCase());
    if (bordaVisivel(css, valor)) achadas.push(`${origem}:${limpo.slice(0, m.index).split("\n").length} — ${prop}: ${valor}`);
  }
  return achadas;
}

// Nativo: `borderColor: <expressão>`. Só passa o transparente e a cor do FOCO.
const COR_NATIVA = /\b(border(?:Top|Bottom|Left|Right|Start|End|Block|BlockStart|BlockEnd)?Color)\s*:\s*([^,}\n]+)/g;
export function linhasNoNativo(fonte: string, origem: string): string[] {
  const limpo = semComentarioJs(fonte);
  const achadas: string[] = [];
  for (const m of limpo.matchAll(COR_NATIVA)) {
    const valor = m[2].trim();
    // O foco do CAMPO passa por `focoDoCampo(` (ADR-0083: o amarelo, ou o `focusStrong` com "aumentar contraste").
    if (/^["']transparent["']$/.test(valor) || /focus/i.test(valor) || /^focoDoCampo\(/.test(valor) || /^string\b/.test(valor)) continue;
    // E o contorno de 3:1 que SÓ o "aumentar contraste" acende (ADR-0083, a mesma exceção da web): só no `estilos.ts`, só
    // com o `inputStrong`, e só dentro da condição `maisContraste` do `fundoDeCampo`.
    const linhaInteira = limpo.slice(limpo.lastIndexOf("\n", m.index!) + 1, limpo.indexOf("\n", m.index!));
    if (origem === "estilos.ts" && valor === "t.color.inputStrong" && /maisContraste \? \{borderColor: t\.color\.inputStrong\}/.test(linhaInteira)) continue;
    // A única linha que fica no nativo: o cartão de contorno (a mesma da web, o texto a 10%).
    const linhaDoFonte = limpo.slice(limpo.lastIndexOf("\n", m.index!) + 1, limpo.indexOf("\n", m.index!));
    if (origem === "layout.tsx" && /^\s*card_outline:/.test(linhaDoFonte) && /comOpacidade\(t\.color\.foreground, 0\.1\)/.test(linhaDoFonte)) continue;
    achadas.push(`${origem}:${limpo.slice(0, m.index).split("\n").length} — ${m[1]}: ${valor}`);
  }
  return achadas;
}

describe("sem linha — nenhuma peça da Aurea desenha borda (ADR-0072)", () => {
  it("o CSS do core, em todo estado", () => {
    expect(linhasNoCss(ler("packages/core/src/aurea.css"), "aurea.css")).toEqual([]);
  });

  it("o CSS do site", () => {
    expect(linhasNoCss(cssDoSite(), "build-catalog.mjs (chrome)")).toEqual([]);
  });

  it("o estilo escrito no código das peças da web (o editor de código, e qualquer outra)", () => {
    const dir = join(RAIZ, "packages/react/src");
    const achadas = readdirSync(dir).filter((f) => /\.tsx?$/.test(f))
      .flatMap((f) => linhasNoJs(readFileSync(join(dir, f), "utf8"), f));
    expect(achadas).toEqual([]);
  });

  // A varredura do navegador achou, na primeira rodada, a caixa tracejada dos exemplos de contêiner: estilo escrito no
  // exemplo, não no core. Os exemplos e as partes vivas do site também são lidos.
  it("os exemplos e as partes vivas do site", () => {
    const ler_dir = (rel: string): string[] => readdirSync(join(RAIZ, rel), {withFileTypes: true}).flatMap((d) =>
      d.isDirectory() ? ler_dir(`${rel}/${d.name}`) : /\.(mjs|tsx?)$/.test(d.name) ? [`${rel}/${d.name}`] : []);
    const achadas = [...ler_dir("apps/catalog/content"), ...ler_dir("apps/catalog/live")]
      .flatMap((f) => linhasNoJs(ler(f), f));
    expect(achadas).toEqual([]);
  }, 60_000);

  it("o nativo — só o foco pinta a borda", () => {
    const dir = join(RAIZ, "packages/native/src");
    const achadas = readdirSync(dir).filter((f) => /\.tsx?$/.test(f))
      .flatMap((f) => linhasNoNativo(readFileSync(join(dir, f), "utf8"), f));
    expect(achadas).toEqual([]);
  });

  // O leitor tem de enxergar o que reprova: se ele parasse de achar bordas, os quatro testes acima passariam vazios.
  it("o leitor acha a linha em cada forma em que ela se escreve", () => {
    const amostra = [
      ".a { border:1px solid var(--border); }",
      ".b { border-top:var(--border-width) solid var(--primary); }",
      ".c { border-color:var(--danger-400); }",
      ".d { border-inline-start-color:var(--primary); }",
      ".e { border:2px solid; }",
      ".f { box-shadow:inset 0 0 0 1px var(--primary-outline); }",
      ".g { box-shadow:0 0 0 var(--border-width) rgba(0,0,0,.1), var(--shadow-sm); }",
      ".h { box-shadow:0 0 0 var(--space-05) var(--badge-ring); }",
    ].join("\n");
    expect(linhasNoCss(amostra, "amostra")).toHaveLength(8);
    const transparente = [
      ".a { border:1px solid transparent; }", ".b { border:0; }", ".c { border-color:transparent; }",
      ".d { box-shadow:var(--shadow-md); }", ".e { box-shadow:inset 0 var(--accent-width) 0 0 var(--card-accent); }",
      ".f { box-shadow:0 0 0 4px color-mix(in srgb,var(--primary) 14%,transparent); }",
    ].join("\n");
    expect(linhasNoCss(transparente, "amostra")).toEqual([]);
    expect(linhasNoJs('{border:"var(--border-width) solid var(--border)", borderLeftColor:"var(--foreground)"}', "x")).toHaveLength(2);
    expect(linhasNoNativo("{borderColor: t.color.border, borderTopColor: cor, borderColor: t.color.focusStrong, borderColor: \"transparent\"}", "x")).toHaveLength(2);
    // O contorno do "aumentar contraste" no nativo vale SÓ no `fundoDeCampo` do `estilos.ts`, sob a condição.
    expect(linhasNoNativo("  ...(maisContraste ? {borderColor: t.color.inputStrong} : null),", "estilos.ts")).toEqual([]);
    expect(linhasNoNativo("  {borderColor: t.color.inputStrong},", "estilos.ts")).toHaveLength(1);
    expect(linhasNoNativo("  ...(maisContraste ? {borderColor: t.color.inputStrong} : null),", "inputs.tsx")).toHaveLength(1);
    expect(linhasNoNativo("focado && {borderColor: focoDoCampo(t, maisContraste)},", "x")).toEqual([]);
    // A exceção vale SÓ para o seletor sozinho: o mesmo valor em outra regra, ou outra propriedade nele, reprova.
    expect(linhasNoCss(".card-outline { border-color:color-mix(in oklab,var(--foreground) 10%,transparent); }", "x")).toEqual([]);
    expect(linhasNoCss(".card-outline:hover { border-color:var(--primary); }", "x")).toHaveLength(1);
    expect(linhasNoCss(".card-outline { box-shadow:inset 0 0 0 1px var(--border); }", "x")).toHaveLength(1);
    expect(linhasNoCss(".card { border-color:color-mix(in oklab,var(--foreground) 10%,transparent); }", "x")).toHaveLength(1);
    // O contorno do "aumentar contraste" (ADR-0083) vale SÓ dentro do `@media (prefers-contrast:more)`, só com a cor dele.
    const campos = ':is(.input,.textarea,.select,.input-group,.combobox-multi,.input-secondary,.textarea-secondary):where(:not([data-brand="lory"],[data-brand="lory"] *))';
    expect(linhasNoCss(`@media (prefers-contrast:more) { ${campos} { border-color:var(--input-strong); } }`, "x")).toEqual([]);
    expect(linhasNoCss(`${campos} { border-color:var(--input-strong); }`, "x")).toHaveLength(1);
    expect(linhasNoCss(`@media (min-width:600px) { ${campos} { border-color:var(--input-strong); } }`, "x")).toHaveLength(1);
    expect(linhasNoCss(`@media (prefers-contrast:more) { ${campos} { border-color:var(--border); } }`, "x")).toHaveLength(1);
    expect(linhasNoCss(`@media (prefers-contrast:more) { .input { border-color:var(--input-strong); } }`, "x")).toHaveLength(1);
  });
});
