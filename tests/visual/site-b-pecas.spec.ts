import {test, expect, type Page} from "@playwright/test";
import {createElement as h} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import * as A from "../../packages/react/dist/index.js";

// O SITE B (31/10/2026) · as cinco mudanças de peça, medidas no navegador a 1440 × 900 contra o desenho aprovado:
//   • o `AppShell` com a pílula no arranjo de documentação: a cápsula de 64 a 14 do alto; a lateral, o conteúdo e o
//     índice começam a 96 (14 + 64 + 18); o índice tem 236 e a altura do que mostra; a lateral vai até 16 do pé da tela;
//   • o `TableOfContents` com o anel e a cápsula: os itens de 40, o anel de 36;
//   • o grupo que dobra da `Sidebar`: os itens um passo (28) para dentro da lista, a seta na ponta;
//   • o `Accordion` `plus` e `lg`: a pergunta de 60, a 22 da borda, e a bolinha de 32.
// Provado contra o defeito: com a folha da 0.51.0 a pílula ficava a 16 e o conteúdo a 96 + 2 da lateral, o índice com 240,
// a lateral parava a 32 do pé, a lista do grupo encostava no nome e a pergunta tinha 20 de recheio.
const GRUPOS = Array.from({length: 4}, (_, g) => ({id: `g${g}`, label: `Grupo ${g + 1}`, collapsible: true,
  items: Array.from({length: 6}, (_, i) => ({id: `g${g}i${i}`, label: `Item ${g + 1}.${i + 1}`, href: "#"}))}));
const SECOES = [{id: "a", label: "Primeira"}, {id: "b", label: "Segunda"}, {id: "c", label: "Terceira"}];
const pagina = () => renderToStaticMarkup(h(A.AppShell, {brand: h("strong", null, "Acme"), layout: "docs", topbarVariant: "pill",
  topbarBlurred: true, contentVariant: "plain", sidebarIndicator: "segment-dot", navItems: GRUPOS as never, currentNavId: "g0i0",
  navLabel: "Contents", asideLabel: "On this page",
  aside: h(A.TableOfContents, {items: SECOES, current: "a", progress: true, indicator: "segment"})},
  h("h1", {id: "titulo", style: {margin: 0}}, "Introduction"),
  h("div", {id: "pergunta"}, h(A.Accordion, {variant: "surface", indicator: "plus", size: "lg", items: [{id: "q", title: "Is Aurea free?", content: "Yes."}]})),
  ...SECOES.map((s) => h("section", {key: s.id, id: s.id, style: {minHeight: "900px"}}, h("h2", null, s.label)))));

async function abrir(p: Page, baseURL: string | undefined, largura = 1440) {
  await p.setViewportSize({width: largura, height: 900});
  const url = `${baseURL}/__site-b-pecas`;
  await p.route(url, (r) => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="dark"><head><meta charset="utf-8">
      <link rel="stylesheet" href="/packages/fonts/dist/fonts.css"><link rel="stylesheet" href="/packages/core/dist/aurea.css"></head>
      <body style="margin:0">${pagina()}<script src="/packages/core/dist/aurea.js"></script></body></html>`}));
  await p.goto(url, {waitUntil: "networkidle"});
  await p.evaluate(() => document.fonts.ready);
}
const medir = (p: Page) => p.evaluate(() => {
  const r = (s: string) => { const e = document.querySelector(s); if (!e || !e.getClientRects().length) return null; const b = e.getBoundingClientRect();
    return {x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height), dir: Math.round(b.right), pe: Math.round(b.bottom)}; };
  return {capsula: r(".topbar-pill > .topbar-inner"), lateral: r(".app-shell > .sidebar:not(.app-shell-aside)"), titulo: r("#titulo"),
    indice: r(".app-shell > .app-shell-aside"), itemDoIndice: r(".toc a"), anel: r(".toc-progress svg"),
    nomeDoGrupo: r(".sidebar-group-toggle"), listaDoGrupo: r(".sidebar-group-list"), itemDoGrupo: r(".sidebar-group-list .sidebar-item"), seta: r(".sidebar-group-caret"),
    pergunta: r("#pergunta summary"), tituloDaPergunta: r("#pergunta .accordion-title"), bolinha: r("#pergunta .accordion-chevron"),
    ladoRola: document.documentElement.scrollWidth > document.documentElement.clientWidth};
});

test("site B · a pílula, a lateral, o índice e a pergunta nas medidas do desenho, a 1440", async ({page: p, baseURL}) => {
  await abrir(p, baseURL);
  const m = await medir(p);
  const t = JSON.stringify(m);
  expect(m.capsula, t).toMatchObject({y: 14, h: 64});
  expect(m.lateral!.y, "a lateral a 96").toBe(96);
  expect(m.titulo!.y, "o conteúdo a 96, na linha da lateral").toBe(96);
  expect(m.indice!.y, "o índice a 96").toBe(96);
  expect(m.indice!.w, "o índice com 236").toBe(236);
  expect(m.indice!.dir, "o índice na ponta da cápsula").toBe(m.capsula!.dir);
  expect(m.indice!.h, "o índice tem a altura do que mostra").toBeLessThan(400);
  expect(m.lateral!.pe, "a lateral vai até 16 do pé da tela").toBe(900 - 16);
  expect(m.titulo!.x - m.lateral!.dir, "o texto a 28 da lateral").toBe(28);
  expect(m.indice!.x - (m.titulo!.x + m.titulo!.w), "e o índice depois do texto").toBeGreaterThanOrEqual(0);
  expect(m.itemDoIndice!.h, "o item do índice com 40").toBe(40);
  expect(m.anel, "o anel de 36").toMatchObject({w: 36, h: 36});
  expect(m.itemDoGrupo!.x - m.listaDoGrupo!.x, "os itens do grupo 28 para dentro").toBe(28);
  expect(m.nomeDoGrupo!.dir - m.seta!.dir, "a seta na ponta do nome do grupo").toBeLessThan(16);
  expect(m.pergunta!.h, "a pergunta de 60").toBe(60);
  expect(m.tituloDaPergunta!.x - m.pergunta!.x, "a 22 da borda").toBe(22);
  expect(m.bolinha, "a bolinha de 32").toMatchObject({w: 32, h: 32});
  expect(m.ladoRola, "nada rola de lado").toBe(false);
});

test("site B · o anel acompanha a leitura e o grupo dobra, no HTML puro", async ({page: p, baseURL}) => {
  await abrir(p, baseURL);
  const valor = () => p.locator(".toc-progress-value").textContent();
  expect(await valor()).toBe("0%");
  await p.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) / 2));
  await expect.poll(valor).toBe("50%");
  const grupo = p.locator(".sidebar-group-toggle").first();
  await grupo.click();
  await expect(grupo).toHaveAttribute("aria-expanded", "false");
  await expect(p.locator(".sidebar-group-list").first()).toBeHidden();
});

// A 0.52.1 · `SegmentedControl` `lg` e `xl`: a escada das alturas de controle — a cápsula de 44 (a chave Web | Native do site
// B) e a de 48 (as áreas no topo). O `sm` (34) e o `md` (40) continuam.
// Provado contra o defeito: sem as classes `segmented-lg` e `segmented-xl` (ou sem as regras delas), os dois saem com 40, e o
// teste reprova.
test("site B · a SegmentedControl em quatro tamanhos: sm 34, md 40, lg 44 e xl 48", async ({page: p, baseURL}) => {
  const itens = [{value: "a", label: "Getting Started"}, {value: "b", label: "Components"}];
  const html = ["sm", "md", "lg", "xl"].map((size) => `<div id="t-${size}">${renderToStaticMarkup(h(A.AureaProvider, null,
    h(A.SegmentedControl, {size: size as never, label: size, value: "a", items: itens.map((i) => ({...i, href: `#${i.value}`}))})))}</div>`).join("");
  const url = `${baseURL}/__site-b-segmentos`;
  await p.route(url, (r) => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="dark"><head><meta charset="utf-8">
      <link rel="stylesheet" href="/packages/fonts/dist/fonts.css"><link rel="stylesheet" href="/packages/core/dist/aurea.css"></head>
      <body style="margin:0">${html}</body></html>`}));
  await p.goto(url, {waitUntil: "networkidle"});
  const alturas = await p.evaluate(() => Object.fromEntries(["sm", "md", "lg", "xl"].map((s) => {
    const cap = document.querySelector(`#t-${s} .segmented`)!.getBoundingClientRect();
    const seg = document.querySelector(`#t-${s} .segmented a`)!.getBoundingClientRect();
    return [s, {capsula: Math.round(cap.height), segmento: Math.round(seg.height)}];
  })));
  expect(alturas).toEqual({sm: {capsula: 34, segmento: 26}, md: {capsula: 40, segmento: 32}, lg: {capsula: 44, segmento: 36},
    xl: {capsula: 48, segmento: 40}});
});

// A 0.52.1 · de 768 a 1023 a lateral do arranjo com a pílula fica a 16 da borda, alinhada com a cápsula (aprovado pela imagem,
// 01/11/2026). Provado contra o defeito: com a regra só de 1024 para cima (a 0.52.0), a lateral fica em 0 e o teste reprova.
test("site B · a 768, a lateral a 16 da borda, como a cápsula", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, 768);
  const m = await medir(p);
  expect(m.capsula!.x, "a cápsula a 16").toBe(16);
  expect(m.lateral!.x, "a lateral também a 16").toBe(16);
  expect(m.titulo!.x - m.lateral!.dir, "o texto a 28 da lateral").toBe(28);
  expect(m.ladoRola, "nada rola de lado").toBe(false);
});

// A 0.52.1 · na `DataList`, a palavra que não cabe quebra dentro da célula (aprovado pela imagem, 01/11/2026). Provado contra o
// defeito: sem o `overflow-wrap`, o nome de código longo sai da célula e a lista fica mais larga que a caixa.
test("site B · a DataList numa coluna estreita: a palavra longa quebra dentro da célula", async ({page: p, baseURL}) => {
  const lista = renderToStaticMarkup(h(A.AureaProvider, null, h(A.DataList, {items: [
    {term: "Theme", value: h("code", null, "window.Aurea.setTheme.withAVeryLongName")},
    {term: "AureaToastType", value: "info · success · warning · danger"}]})));
  const url = `${baseURL}/__site-b-datalist`;
  await p.route(url, (r) => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="dark"><head><meta charset="utf-8">
      <link rel="stylesheet" href="/packages/fonts/dist/fonts.css"><link rel="stylesheet" href="/packages/core/dist/aurea.css"></head>
      <body style="margin:0"><div id="caixa" style="inline-size:220px">${lista}</div></body></html>`}));
  await p.goto(url, {waitUntil: "networkidle"});
  const m = await p.evaluate(() => {
    const dl = document.querySelector("#caixa .data-list")!;
    return {dl: [dl.scrollWidth, dl.clientWidth], dd: [...dl.querySelectorAll("dd")].map((d) => d.scrollWidth - d.clientWidth)};
  });
  expect(m.dl[0], "a lista não passa da caixa").toBeLessThanOrEqual(m.dl[1]);
  expect(m.dd, "nenhuma célula transborda").toEqual([0, 0]);
});
