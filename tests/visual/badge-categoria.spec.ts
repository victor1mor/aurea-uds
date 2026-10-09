import {test, expect, type Page} from "@playwright/test";
import {createElement as h, Fragment} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import * as A from "../../packages/react/dist/index.js";

// Lote L (09/10/2026, ADR-0060), medido no navegador, nos três motores:
//   • GAR-07: as oito cores de categoria do `Badge`, nas três ênfases, nos dois temas e nas duas
//     marcas, passam de 4,5:1 — contra o fundo da página E o do cartão (o fundo suave do escuro é
//     translúcido, então o que se lê depende do que está atrás). E cada uma tem cor própria.
//   • GAR-09: a seta do `KPI` existe (16 × 16, máscara do Phosphor), tem a cor da tendência, e fica
//     na PRIMEIRA linha quando o texto quebra.
// Provado contra o defeito: com o CSS da 0.25.0 as categorias saem com a cor do neutro (as oito
// iguais) e a seta não tem tamanho nem máscara.
const CATEGORIAS = ["red", "orange", "green", "teal", "cyan", "blue", "violet", "pink"];
const ENFASES = ["soft", "solid", "outline"] as const;
const selos = (onde: string) => CATEGORIAS.flatMap((c) => ENFASES.map((e) =>
  h(A.Badge, {key: `${onde}-${c}-${e}`, variant: c as A.BadgeVariant, emphasis: e, "data-cat": c, "data-enf": e}, "Grupo")));
const CORPO = renderToStaticMarkup(h(Fragment, null,
  h("div", {id: "pagina", style: {display: "flex", flexWrap: "wrap", gap: "4px"}}, ...selos("p")),
  h("div", {id: "cartao", className: "card", style: {display: "flex", flexWrap: "wrap", gap: "4px"}}, ...selos("c")),
  h("div", {id: "neutro"}, h(A.Badge, null, "Neutro")),
  h("div", {style: {width: "150px"}},
    h(A.KPI, {id: "kpi", label: "Assinantes", value: "148", trend: "igual ao mês passado, sem mudança", direction: "flat"})),
  h(A.KPI, {id: "kpi-alta", label: "Receita", value: "1", trend: "+8%", direction: "up"}),
  h(A.KPI, {id: "kpi-custo", label: "Custo", value: "1", trend: "+12%", direction: "up", tone: "danger"})));

async function abrir(p: Page, baseURL: string | undefined, tema: string, marca: string | null) {
  const url = `${baseURL}/__badge-categoria`;
  await p.route(url, (r) => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="${tema}"${marca ? ` data-brand="${marca}"` : ""}><head><meta charset="utf-8">
      <link rel="stylesheet" href="/packages/core/dist/aurea.css"></head>
      <body style="margin:0;padding:16px;background:var(--background)">${CORPO}
      <span id="success" style="color:var(--success-400)">x</span><span id="danger" style="color:var(--danger-400)">x</span>
      <span id="icon-sm" style="display:block;width:var(--icon-sm)"></span></body></html>`}));
  await p.goto(url, {waitUntil: "networkidle"});
}

// Cor → sRGB [0..1] e alfa. Os motores devolvem `oklch()`, `oklab()`, `color(srgb …)` ou `rgb()`
// conforme a origem (token, `color-mix`); a conversão é feita aqui, como no `tone-contrast.spec`.
function paraSrgb(css: string): [number, number, number, number] {
  const [corpo, a] = css.replace(/^[a-z-]+\(/, "").replace(/\)$/, "").split("/");
  const alfa = a ? (a.trim().endsWith("%") ? parseFloat(a) / 100 : parseFloat(a)) : (css.startsWith("rgba") ? Number(corpo.split(",")[3]) : 1);
  const n = (corpo.replace(/^srgb\s+/, "").match(/-?[\d.]+(e-?\d+)?%?/g) ?? []).map((v) => v.endsWith("%") ? parseFloat(v) / 100 : Number(v));
  if (css.startsWith("rgb")) return [n[0] / 255, n[1] / 255, n[2] / 255, alfa];
  if (css.startsWith("color(srgb")) return [n[0], n[1], n[2], alfa];
  let [L, A2, B] = n;
  if (css.startsWith("oklch")) { const r = (n[2] * Math.PI) / 180; A2 = n[1] * Math.cos(r); B = n[1] * Math.sin(r); }
  const l = (L + 0.3963377774 * A2 + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A2 - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A2 - 1.2914855480 * B) ** 3;
  const f = (x: number) => Math.min(1, Math.max(0, x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055));
  return [f(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    f(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    f(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s), alfa];
}
const sobre = (cima: string, baixo: [number, number, number]): [number, number, number] => {
  const [r, g, b, a] = paraSrgb(cima);
  return [r * a + baixo[0] * (1 - a), g * a + baixo[1] * (1 - a), b * a + baixo[2] * (1 - a)];
};
const lum = (c: [number, number, number]) => {
  const g = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * g(c[0]) + 0.7152 * g(c[1]) + 0.0722 * g(c[2]);
};
const razao = (a: [number, number, number], b: [number, number, number]) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

for (const [tema, marca] of [["dark", null], ["light", null], ["dark", "lory"], ["light", "lory"]] as const) {
  test(`categorias do selo · AA nas três ênfases · ${tema}${marca ? ` · ${marca}` : ""}`, async ({page: p, baseURL}) => {
    await abrir(p, baseURL, tema, marca);
    const medidas = await p.evaluate(() => [...document.querySelectorAll<HTMLElement>("[data-cat]")].map((e) => {
      const fundoDoLugar = getComputedStyle(e.closest("#cartao") ? e.closest("#cartao")! : document.body).backgroundColor;
      const cs = getComputedStyle(e);
      return {cat: e.dataset.cat!, enf: e.dataset.enf!, onde: e.closest("#cartao") ? "cartão" : "página",
        cor: cs.color, fundo: cs.backgroundColor, lugar: fundoDoLugar};
    }));
    expect(medidas).toHaveLength(CATEGORIAS.length * ENFASES.length * 2);
    const ruins: string[] = [];
    for (const m of medidas) {
      const lugar = sobre(m.lugar, [0, 0, 0]);
      const atras = sobre(m.fundo, lugar);
      const texto = sobre(m.cor, atras);
      const r = razao(texto, atras);
      if (r < 4.5) ruins.push(`${m.cat}/${m.enf} no ${m.onde}: ${r.toFixed(2)}`);
    }
    expect(ruins, "categorias abaixo de 4,5:1").toEqual([]);
    // Cor própria: oito cores de texto diferentes no soft, e nenhuma igual à do neutro.
    const neutro = await p.locator("#neutro .badge").evaluate((e) => getComputedStyle(e).color);
    const cores = new Set(medidas.filter((m) => m.enf === "soft" && m.onde === "página").map((m) => m.cor));
    expect(cores.size, "oito cores distintas").toBe(8);
    expect([...cores], "nenhuma categoria com a cor do neutro").not.toContain(neutro);
  });
}

for (const tema of ["dark", "light"]) {
  test(`KPI · a seta existe, tem a cor do tom e fica na primeira linha · ${tema}`, async ({page: p, baseURL}) => {
    await abrir(p, baseURL, tema, null);
    const icone = await p.locator("#icon-sm").evaluate((e) => e.getBoundingClientRect().width);
    const seta = p.locator("#kpi .kpi-trend-icon");
    const caixa = (await seta.boundingBox())!;
    expect(caixa.width, "a seta tem o --icon-sm").toBeCloseTo(icone, 0);
    expect(caixa.height).toBeCloseTo(icone, 0);
    expect(await seta.evaluate((e) => { const cs = getComputedStyle(e); return cs.maskImage || cs.webkitMaskImage; }), "o desenho por máscara").toMatch(/^url\(/);
    // Na primeira linha: a tendência quebrou (150 de largura), e o centro da seta fica dentro da
    // primeira linha do texto — com `center`, ficava entre as duas.
    // As linhas do TEXTO, pelo `Range` do nó de texto: a primeira caixa é a primeira linha.
    const linhas = await p.locator("#kpi .kpi-trend").evaluate((e) => {
      const no = [...e.childNodes].find((n) => n.nodeType === Node.TEXT_NODE)!;
      const r = document.createRange(); r.selectNodeContents(no);
      return [...r.getClientRects()].map((c) => ({top: c.top, bottom: c.bottom}));
    });
    const tops = [...new Set(linhas.map((l) => Math.round(l.top)))];
    expect(tops.length, "a tendência quebrou em mais de uma linha").toBeGreaterThan(1);
    const primeira = linhas[0];
    const centro = caixa.y + caixa.height / 2;
    expect(centro, "o centro da seta dentro da primeira linha").toBeGreaterThan(primeira.top);
    expect(centro, "o centro da seta dentro da primeira linha").toBeLessThan(primeira.bottom);
    // A cor: a seta é pintada com a cor do texto da tendência, e o tom manda nela.
    const corDe = (sel: string) => p.locator(sel).evaluate((e) => getComputedStyle(e).color);
    const fundoDe = (sel: string) => p.locator(sel).evaluate((e) => getComputedStyle(e).backgroundColor);
    expect(await fundoDe("#kpi-alta .kpi-trend-icon")).toBe(await corDe("#kpi-alta .kpi-trend"));
    expect(await corDe("#kpi-alta .kpi-trend")).toBe(await corDe("#success"));
    expect(await corDe("#kpi-custo .kpi-trend"), "tone=danger vence a direção").toBe(await corDe("#danger"));
  });
}
