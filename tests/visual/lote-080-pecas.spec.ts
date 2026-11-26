import {test, expect, type Page} from "@playwright/test";
import {cantoContinuo} from "./canto";
import {createElement as h} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import * as A from "../../packages/react/dist/index.js";

// O lote 080 (0.70.0), as peças da web que o Victor aprovou olhando em 14/11/2026, medidas no navegador:
//   • PV-08 (*"Pode, os dois"*): `Stepper orientation="vertical"` — numa coluna de 150 ele cabe (deitado, pedia 295);
//     uma etapa embaixo da outra; a linha desce entre as bolinhas, amarela até a etapa atual.
//   • A tabela do `Prose` (*"Pode, como a proposta"*): numa tela de 375 a página não rola de lado; a tabela rola por dentro.
//   • A busca 38 × 36 (*"Pode, os três"*): o `SearchField` tem a altura do `Input` ao lado, nos três tamanhos.
//   • O separador da `Toolbar` (*"Pode (Recomendado)"*): metade da altura do botão, no meio, sem margem a mais.
//   • O canto do item da `ListBox` (*"B (igual à referência)"*): o do item do menu, 18 — também no item de duas linhas.
//   • O "sem linha" 1a (*"B, ponta a ponta"*) e 1b (*"Sim, volta"*): a linha clara embaixo da fila das abas `secondary`,
//     que ocupa a linha inteira, e entre os grupos da lista; também na Ember (a regra de 14/11/2026).
// Provado contra o defeito: com o core e o pacote da 0.69.0 cada um destes reprova (o `Stepper` passa da coluna, a página
// fica com 768, a busca com 38, o separador com 36 e margem 4, o item com canto 24,5, as duas linhas transparentes e a
// fila das abas do tamanho das abas).

async function abrir(p: Page, baseURL: string | undefined, nome: string, corpo: string, {largura = 1280, marca = ""} = {}) {
  const url = `${baseURL}/__lote080-${nome}`;
  await p.setViewportSize({width: largura, height: 800});
  await p.route(url, (r) => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="light"${marca ? ` data-brand="${marca}"` : ""}><head><meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <link rel="stylesheet" href="/packages/fonts/dist/fonts.css"><link rel="stylesheet" href="/packages/core/dist/aurea.css"></head>
      <body style="margin:0;padding:24px">${corpo}</body></html>`}));
  await p.goto(url, {waitUntil: "networkidle"});
}
/** O alfa da cor (0 a 255), pelo canvas: `color-mix` e `oklch` saem em formatos diferentes em cada navegador. */
const alfa = (p: Page, js: string) => p.evaluate((codigo) => {
  const cor = new Function(codigo)() as string;
  const cv = document.createElement("canvas").getContext("2d")!; cv.fillStyle = "#000"; cv.fillStyle = cor; cv.fillRect(0, 0, 1, 1);
  return cv.getImageData(0, 0, 1, 1).data[3];
}, js);

const PASSOS = [{label: "Conta", state: "done"}, {label: "Perfil", state: "done"}, {label: "Conteúdo", state: "active"},
  {label: "Agendamento"}, {label: "Revisão", optional: "Opcional"}];

test("PV-08 · Stepper em pé: cabe na coluna de 150, uma etapa embaixo da outra, a linha amarela até a atual", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, "stepper", renderToStaticMarkup(h("div", {id: "col", style: {inlineSize: "150px"}},
    h(A.Stepper, {label: "Publicar", orientation: "vertical", items: PASSOS as never}))));
  const m = await p.evaluate(() => {
    const s = document.querySelector<HTMLElement>("#col .stepper")!;
    const passos = [...s.querySelectorAll<HTMLElement>(".step")];
    const linha = (el: Element) => { const g = getComputedStyle(el, "::after"); return {tem: g.content !== "none", cor: g.backgroundColor}; };
    return {classe: s.className, largura: s.scrollWidth, topos: passos.map((e) => Math.round(e.getBoundingClientRect().top)),
      linhas: passos.map(linha), primary: getComputedStyle(document.documentElement).getPropertyValue("--primary").trim()};
  });
  expect(m.classe).toContain("stepper-vertical");
  expect(m.largura, JSON.stringify(m)).toBeLessThanOrEqual(150);
  for (let i = 1; i < m.topos.length; i++) expect(m.topos[i], JSON.stringify(m.topos)).toBeGreaterThan(m.topos[i - 1]);
  // a linha existe entre as etapas e não depois da última
  expect(m.linhas.map((l) => l.tem)).toEqual([true, true, true, true, false]);
  // amarela da primeira até a que leva à atual (o próximo feito ou atual); cinza depois
  expect(m.linhas[0].cor).toBe(m.linhas[1].cor);
  expect(m.linhas[1].cor).not.toBe(m.linhas[2].cor);
  // o padrão não muda: sem `orientation`, o deitado de sempre
  await abrir(p, baseURL, "stepper-deitado", renderToStaticMarkup(h(A.Stepper, {label: "P", items: PASSOS as never})));
  expect(await p.evaluate(() => document.querySelector(".stepper")!.className)).not.toContain("stepper-vertical");
});

test("Prose · a tabela larga rola por dentro e a página não rola de lado no celular", async ({page: p, baseURL}) => {
  const colunas = Array.from({length: 8}, (_, i) => h("th", {key: i}, `Coluna ${i + 1}`));
  const fileira = Array.from({length: 8}, (_, i) => h("td", {key: i}, "um valor comprido"));
  await abrir(p, baseURL, "prose", renderToStaticMarkup(h(A.Prose, null,
    h("p", null, "Texto."), h("table", null, h("thead", null, h("tr", null, ...colunas)), h("tbody", null, h("tr", null, ...fileira))))), {largura: 375});
  const m = await p.evaluate(() => {
    const t = document.querySelector<HTMLElement>(".prose table")!;
    return {pagina: document.documentElement.scrollWidth, caixa: t.clientWidth, conteudo: t.scrollWidth, rola: getComputedStyle(t).overflowX};
  });
  expect(m.pagina, JSON.stringify(m)).toBe(375);
  expect(m.conteudo, JSON.stringify(m)).toBeGreaterThan(m.caixa);
  expect(m.rola).toBe("auto");
});

test("Busca 38 × 36 · o SearchField tem a altura do Input ao lado, nos três tamanhos", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, "busca", renderToStaticMarkup(h("div", null,
    ...(["sm", "md", "lg"] as const).map((t) => h("div", {key: t, "data-t": t, style: {display: "flex", gap: "8px", marginBottom: "8px"}},
      h(A.Input, {"aria-label": "a", size: t}), h(A.SearchField, {"aria-label": "b", size: t} as never))))));
  const m = await p.evaluate(() => [...document.querySelectorAll<HTMLElement>("[data-t]")].map((l) => ({
    t: l.dataset.t, input: Math.round(l.querySelector<HTMLElement>(":scope > .input")!.getBoundingClientRect().height),
    busca: Math.round(l.querySelector<HTMLElement>(".search-field")!.getBoundingClientRect().height)})));
  for (const l of m) expect(l.busca, JSON.stringify(m)).toBe(l.input);
});

test("Toolbar · o separador é metade da altura do botão, no meio, sem margem a mais", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, "toolbar", renderToStaticMarkup(h(A.Toolbar, {label: "Texto"},
    h(A.ToolbarButton, null, "A"), h(A.ToolbarSeparator, null), h(A.ToolbarButton, null, "B"))));
  const m = await p.evaluate(() => {
    const sep = document.querySelector<HTMLElement>(".toolbar-sep")!.getBoundingClientRect();
    const btn = document.querySelector<HTMLElement>(".toolbar .btn")!.getBoundingClientRect();
    const g = getComputedStyle(document.querySelector(".toolbar-sep")!);
    return {sep: Math.round(sep.height), btn: Math.round(btn.height), meioSep: Math.round(sep.top + sep.height / 2),
      meioBtn: Math.round(btn.top + btn.height / 2), margem: g.marginInlineStart};
  });
  expect(m.sep, JSON.stringify(m)).toBe(m.btn / 2);
  expect(m.meioSep).toBe(m.meioBtn);
  expect(m.margem).toBe("0px");
});

const LISTA = `<div class="list-box" role="listbox" aria-label="L">
  <div class="list-box-section" role="group"><div class="list-box-section-title">Grupo A</div>
    <div class="list-box-item" role="option" id="um"><span>Um</span></div>
    <div class="list-box-item" role="option" id="dois"><span style="display:grid">Dois<small>Com uma descrição embaixo</small></span></div></div>
  <div class="list-box-section" role="group" id="b"><div class="list-box-section-title">Grupo B</div>
    <div class="list-box-item" role="option"><span>Três</span></div></div></div>`;

test("ListBox · o canto do item é o do menu (18), também no item de duas linhas; a linha clara entre os grupos", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, "listbox", `<div style="inline-size:280px">${LISTA}</div>`);
  const cantos = await p.evaluate(() => ["#um", "#dois"].map((s) => getComputedStyle(document.querySelector(s)!).borderTopLeftRadius));
  const dezoito = await cantoContinuo(p, 18);
  expect(cantos).toEqual([dezoito, dezoito]);
  expect(await alfa(p, `return getComputedStyle(document.querySelector("#b"), "::before").borderTopColor`)).toBeGreaterThan(0);
  await abrir(p, baseURL, "listbox-ember", `<div style="inline-size:280px">${LISTA}</div>`, {marca: "ember"});
  expect(await alfa(p, `return getComputedStyle(document.querySelector("#b"), "::before").borderTopColor`), "na Ember também").toBeGreaterThan(0);
});

const ABAS = `<div style="inline-size:600px" id="caixa"><div class="tabs tabs-secondary" role="tablist" data-orientation="horizontal">
  <button class="tab" role="tab" data-active>Visão geral</button><button class="tab" role="tab">Detalhes</button></div></div>`;

test("Tabs secondary · a fila ocupa a linha inteira e ganha a linha clara embaixo (também na Ember)", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, "abas", ABAS);
  const m = await p.evaluate(() => ({fila: Math.round(document.querySelector(".tabs")!.getBoundingClientRect().width),
    caixa: Math.round(document.querySelector("#caixa")!.getBoundingClientRect().width),
    primeira: Math.round(document.querySelector(".tab")!.getBoundingClientRect().left - document.querySelector("#caixa")!.getBoundingClientRect().left)}));
  expect(m.fila, JSON.stringify(m)).toBe(m.caixa);
  expect(m.primeira, "as abas continuam no começo").toBe(0);
  expect(await alfa(p, `return getComputedStyle(document.querySelector(".tabs")).borderBottomColor`)).toBeGreaterThan(0);
  await abrir(p, baseURL, "abas-ember", ABAS, {marca: "ember"});
  expect(await alfa(p, `return getComputedStyle(document.querySelector(".tabs")).borderBottomColor`), "na Ember também").toBeGreaterThan(0);
});

test("2-B · o item-link do BottomNav não pega a cor de link ao passar o mouse", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, "2b", renderToStaticMarkup(h("div", null,
    h(A.BottomNav, {label: "Principal", current: "inicio", items: [
      {id: "inicio", label: "Início", icon: "house", href: "#inicio"}, {id: "busca", label: "Busca", icon: "magnifying-glass", href: "#busca"}] as never}))));
  const link = p.locator("a.bottom-nav-item:not([aria-current])").first();
  const antes = await link.evaluate((e) => getComputedStyle(e).color);
  await link.hover();
  await p.waitForTimeout(300);
  expect(await link.evaluate((e) => getComputedStyle(e).color), "a cor do item não muda").toBe(antes);
});

test("2-B · os +/− do NumberField somente leitura não acendem ao passar o mouse", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, "2b-numero", renderToStaticMarkup(h(A.NumberField, {label: "Quantidade", defaultValue: 3, readOnly: true})));
  const mais = p.locator(".number-field-button").last();
  await mais.hover();
  await p.waitForTimeout(300);
  expect(await alfa(p, `return getComputedStyle(document.querySelectorAll(".number-field-button")[1]).backgroundColor`), "somente leitura não acende").toBe(0);
});

test("D16 (a primeira parte) · cada tema declara o esquema de cor, também num pedaço com tema próprio", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, "d16", `<div id="escuro" data-theme="dark"><div id="claro" data-theme="light">x</div></div>`);
  const m = await p.evaluate(() => ({pagina: getComputedStyle(document.documentElement).colorScheme,
    escuro: getComputedStyle(document.querySelector("#escuro")!).colorScheme, claro: getComputedStyle(document.querySelector("#claro")!).colorScheme}));
  expect(m).toEqual({pagina: "light", escuro: "dark", claro: "light"});
});

const D4 = `<div class="menu" role="listbox" style="inline-size:240px;position:static">
  <div class="menu-item combobox-item" role="option" aria-selected="true" id="op"><span class="combobox-check" aria-hidden="true"><svg class="icon icon-sm" id="vop"></svg></span><span id="rop">Brasil</span></div></div>
  <div class="menu" role="menu" style="inline-size:240px;position:static;margin-top:16px">
  <div class="menu-item" role="menuitemcheckbox" aria-checked="true"><span class="menu-mark" aria-hidden="true" id="vmenu"><svg class="icon icon-sm"></svg></span><span id="rmenu">Mostrar grade</span></div></div>`;

test("D4 · a marca do escolhido no fim e cinza, no Select/Combobox e nos menus (também na Ember)", async ({page: p, baseURL}) => {
  const medir = () => p.evaluate(() => {
    const r = (s: string) => document.querySelector(s)!.getBoundingClientRect();
    return {opFim: r("#vop").left > r("#rop").right, menuFim: r("#vmenu").left > r("#rmenu").right,
      corOp: getComputedStyle(document.querySelector(".combobox-check")!).color, corMenu: getComputedStyle(document.querySelector(".menu-mark")!).color,
      apoio: getComputedStyle(document.querySelector("#rop")!).color};
  });
  await abrir(p, baseURL, "d4", D4);
  const novo = await medir();
  expect(novo.opFim, JSON.stringify(novo)).toBe(true);
  expect(novo.menuFim, JSON.stringify(novo)).toBe(true);
  const apoio = await p.evaluate(() => { const e = document.createElement("span"); e.style.color = "var(--muted-foreground)"; document.body.append(e); return getComputedStyle(e).color; });
  expect(novo.corOp).toBe(apoio);
  expect(novo.corMenu).toBe(apoio);
  await abrir(p, baseURL, "d4-ember", D4, {marca: "ember"});
  const ember = await medir();
  expect(ember.opFim, "na Ember também").toBe(true);
  expect(ember.menuFim).toBe(true);
});
