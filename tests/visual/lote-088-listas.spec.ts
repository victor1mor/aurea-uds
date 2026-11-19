import {test, expect, type Page} from "@playwright/test";
import {createElement as h} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import * as A from "../../packages/react/dist/index.js";

// O lote 088 — o achado 1 do 2-D (o Victor, 19/11/2026: *"Pode, proposta A"*). Os itens de lista começavam em quatro
// lugares (ListBox 8, Menu 10 escrito à mão, NavList 12, Sidebar 16), todos com o canto de 18; só a Sidebar começava no
// fim da curva. Em 8 de 12 referências o conteúdo começa no fim da curva ou depois; com o 18 da Aurea, isso é o 16.
// Aqui se mede, no navegador, onde começa o conteúdo (o ícone, ou o texto sem ícone) de cada lista, nos dois lados; o
// título da seção da ListBox e o rótulo de grupo do menu acompanham; e a Ember também.
// Provado contra o defeito: com o core da 0.73.0 reprova (8, 10 e 12 no começo; a marca do escolhido da ListBox a 8).

const ESPERADO = 16;

async function abrir(p: Page, baseURL: string | undefined, nome: string, corpo: string, marca = "") {
  const url = `${baseURL}/__lote088-${nome}`;
  await p.setViewportSize({width: 1280, height: 800});
  await p.route(url, (r) => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="light"${marca ? ` data-brand="${marca}"` : ""}><head><meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <link rel="stylesheet" href="/packages/fonts/dist/fonts.css"><link rel="stylesheet" href="/packages/core/dist/aurea.css"></head>
      <body style="margin:0;padding:24px"><div style="inline-size:320px">${corpo}</div></body></html>`}));
  await p.goto(url, {waitUntil: "networkidle"});
}

const ICONE = `<svg class="icon" aria-hidden="true" width="16" height="16"></svg>`;
const MENU = `<div class="menu" role="menu" style="position:static">
  <div class="menu-label">Grupo</div>
  <div class="menu-item" role="menuitem">${ICONE}Duplicar</div>
  <div class="menu-item" role="menuitem">Renomear</div></div>`;

/** Onde começa o conteúdo de cada item (o primeiro filho visível), a partir da borda do item, e o fim da curva. */
const medir = (p: Page, seletor: string) => p.evaluate((sel) => [...document.querySelectorAll<HTMLElement>(sel)].map((el) => {
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let inicio: number | null = null; let n: Node | null;
  while ((n = tw.nextNode())) {
    if (n.nodeType === 1) {
      const e = n as Element;
      if (e.matches("svg.icon, .avatar")) { const ir = e.getBoundingClientRect(); if (ir.width > 0) { inicio = ir.left; break; } }
      continue;
    }
    if (!n.textContent?.trim()) continue;
    const rg = document.createRange(); rg.selectNodeContents(n);
    const rr = [...rg.getClientRects()].find((x) => x.width > 0);
    if (rr) { inicio = rr.left; break; }
  }
  return {inicio: inicio === null ? null : Math.round(inicio - r.left), curva: Math.min(parseFloat(cs.borderTopLeftRadius), r.height / 2),
    fim: Math.round(parseFloat(cs.paddingInlineEnd))};
}), seletor);

for (const marca of ["", "ember"]) {
  const em = marca ? " (Ember)" : "";

  test(`ListBox${em} · o conteúdo começa a 16, no fim da curva; o título da seção e a marca do escolhido acompanham`, async ({page: p, baseURL}) => {
    await abrir(p, baseURL, `listbox${marca}`, renderToStaticMarkup(h(A.ListBox, {label: "Arquivo", defaultValue: ["b"], items: [
      {id: "a", label: "Renomear", icon: "pencil-simple"}, {id: "b", label: "Compartilhar"}]} as never)), marca);
    const itens = await medir(p, ".list-box-item");
    for (const m of itens) {
      expect(m.inicio, JSON.stringify(itens)).toBe(ESPERADO);
      expect(m.inicio!, "não começa dentro da curva").toBeGreaterThanOrEqual(m.curva - 2);
    }
    const marcaFim = await p.evaluate(() => {
      const i = document.querySelector(".list-box-item-indicator"); if (!i) return null;
      const it = i.closest(".list-box-item")!.getBoundingClientRect();
      return Math.round(it.right - i.getBoundingClientRect().right);
    });
    if (marcaFim !== null) expect(marcaFim, "a marca do escolhido a 16 do fim").toBe(ESPERADO);
  });

  test(`ListBox com seções${em} · o título da seção começa onde começam os itens`, async ({page: p, baseURL}) => {
    await abrir(p, baseURL, `listbox-sec${marca}`, `<div role="listbox" class="list-box"><div class="list-box-section">
      <div class="list-box-section-title">Recentes</div><div role="option" class="list-box-item">Relatório</div></div></div>`, marca);
    const m = await p.evaluate(() => {
      const t = document.querySelector(".list-box-section-title")!; const rg = document.createRange(); rg.selectNodeContents(t);
      const it = document.querySelector(".list-box-item")!; const rg2 = document.createRange(); rg2.selectNodeContents(it);
      return {titulo: Math.round(rg.getClientRects()[0].left), item: Math.round(rg2.getClientRects()[0].left)};
    });
    expect(m.titulo, JSON.stringify(m)).toBe(m.item);
  });

  test(`Menu${em} · o conteúdo começa a 16 (era o 10 escrito à mão); o rótulo de grupo alinha com o texto`, async ({page: p, baseURL}) => {
    await abrir(p, baseURL, `menu${marca}`, MENU, marca);
    const itens = await medir(p, ".menu-item");
    for (const m of itens) expect(m.inicio, JSON.stringify(itens)).toBe(ESPERADO);
    const m = await p.evaluate(() => {
      const l = document.querySelector(".menu-label")!; const rg = document.createRange(); rg.selectNodeContents(l);
      const it = document.querySelectorAll(".menu-item")[1]; const rg2 = document.createRange(); rg2.selectNodeContents(it);
      return {rotulo: Math.round(rg.getClientRects()[0].left), texto: Math.round(rg2.getClientRects()[0].left)};
    });
    expect(m.rotulo, JSON.stringify(m)).toBe(m.texto);
  });

  test(`NavList${em} · o conteúdo começa a 16, como a Sidebar`, async ({page: p, baseURL}) => {
    await abrir(p, baseURL, `navlist${marca}`, renderToStaticMarkup(h(A.NavList, {items: [
      {id: "a", label: "Começar", icon: "book-open", href: "#a"}, {id: "b", label: "Peças", href: "#b"}]} as never)), marca);
    const itens = await medir(p, ".nav-list-row");
    for (const m of itens) {
      expect(m.inicio, JSON.stringify(itens)).toBe(ESPERADO);
      expect(m.fim, "e termina a 16 do outro lado").toBe(ESPERADO);
    }
  });
}
