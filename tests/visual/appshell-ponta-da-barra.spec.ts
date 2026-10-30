import {test, expect, type Page} from "@playwright/test";
import {createElement as h} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import * as A from "../../packages/react/dist/index.js";

// MNT-37 (30/10/2026) — a ponta da barra de cima do `AppShell` (`topbarActions`), medida no navegador na tela do Victor
// (1280 × 663) e a 800 × 450 (a mesma a 200%):
//   • `layout="sidebar"`: a ponta encosta no FIM da barra do conteúdo, a 20 da borda (o recheio da barra rente), e fica na
//     linha do título; o botão de recolher continua o primeiro, a 12 do título;
//   • só com a ponta, a barra do conteúdo existe (56) e a ponta vai para o fim dela;
//   • da direita para a esquerda, a ponta vai para a ESQUERDA;
//   • o arranjo de sempre: a ponta no fim da barra;
//   • a 800: a barra com o botão da gaveta no começo e a ponta no fim; nada rola para o lado.
// Provado contra o defeito: com o `AppShell` da 0.50.0 a prop não existia — a ponta não aparecia; e pô-la no `topbar` a
// deixava colada no botão de recolher (x 415–451 a 1280, medido no banco `contraste.html`).
const ITENS = [{id: "a", label: "Dispositivos", icon: "desktop-tower" as const, href: "#"}, {id: "b", label: "Ajustes", icon: "gear" as const, href: "#"}];
const marca = h(A.Sidebar.Brand, {logo: "R", name: "Rede", description: "Gestão da rede"});
const tema = h(A.IconButton, {id: "tema", icon: "sun", label: "Tema", variant: "ghost"});
const FORMAS: Record<string, Record<string, unknown>> = {
  "canto-titulo": {layout: "sidebar", sidebarVariant: "flush", brand: marca, topbar: h("strong", {id: "titulo"}, "Dispositivos"), topbarActions: tema},
  "so-ponta": {layout: "sidebar", sidebarVariant: "flush", brand: marca, topbarActions: tema},
  "de-sempre": {brand: h("strong", null, "Rede"), topbar: h("span", {id: "titulo"}, "Seções"), topbarActions: tema},
};
const pagina = (forma: string) => renderToStaticMarkup(h(A.AppShell, {navItems: ITENS, currentNavId: "a", sidebarCollapsible: true, ...FORMAS[forma]},
  h("h1", null, "Dispositivos"), h("div", {style: {height: "1600px"}})));

async function abrir(p: Page, baseURL: string | undefined, forma: string, {largura = 1280, altura = 663, dir = "ltr"} = {}) {
  await p.setViewportSize({width: largura, height: altura});
  const url = `${baseURL}/__ponta-${forma}-${dir}`;
  await p.route(url, (r) => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="light" dir="${dir}"><head><meta charset="utf-8">
      <link rel="stylesheet" href="/packages/fonts/dist/fonts.css"><link rel="stylesheet" href="/packages/core/dist/aurea.css"></head>
      <body style="margin:0">${pagina(forma)}</body></html>`}));
  await p.goto(url, {waitUntil: "networkidle"});
  await p.evaluate(() => document.fonts.ready);
}
const medir = (p: Page) => p.evaluate(() => {
  const r = (s: string) => { const e = document.querySelector(s); if (!e || !e.getClientRects().length) return null; const b = e.getBoundingClientRect();
    return {x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height), meio: b.top + b.height / 2, dir: Math.round(b.right)}; };
  return {barra: r(".app-shell .topbar"), tema: r("#tema"), titulo: r("#titulo"), botao: r(".sidebar-collapse-trigger"), gaveta: r(".topbar .nav-toggle"),
    ladoRola: document.documentElement.scrollWidth > document.documentElement.clientWidth};
});

test("MNT-37 · `layout=\"sidebar\"`: a ponta no fim da barra do conteúdo, a 20 da borda, na linha do título", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, "canto-titulo");
  const m = await medir(p);
  expect(m.barra, JSON.stringify(m)).toMatchObject({h: 56});
  expect(m.barra!.dir - m.tema!.dir, "a ponta a 20 do fim da barra").toBe(20);
  expect(Math.abs(m.tema!.meio - m.titulo!.meio), "na linha do título").toBeLessThan(1);
  expect(m.titulo!.x - m.botao!.dir, "o botão de recolher continua a 12 do título").toBe(12);
  expect(m.ladoRola).toBe(false);
});

test("MNT-37 · só com a ponta: a barra do conteúdo existe, com 56, e a ponta vai para o fim", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, "so-ponta");
  const m = await medir(p);
  expect(m.barra, JSON.stringify(m)).toMatchObject({y: 0, h: 56});
  expect(m.barra!.dir - m.tema!.dir).toBe(20);
  expect(m.tema!.x - m.botao!.dir, "longe do botão de recolher").toBeGreaterThan(600);
});

test("MNT-37 · da direita para a esquerda, a ponta vai para a esquerda", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, "canto-titulo", {dir: "rtl"});
  const m = await medir(p);
  expect(m.tema!.x - m.barra!.x, JSON.stringify(m)).toBe(20);
});

test("MNT-37 · o arranjo de sempre: a ponta no fim da barra, depois do `topbar`", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, "de-sempre");
  const m = await medir(p);
  // A barra flutuante tem a borda transparente do sem linha (ADR-0072): a espessura dela soma ao recheio.
  const recheio = await p.evaluate(() => { const c = getComputedStyle(document.querySelector(".app-shell .topbar")!);
    return parseFloat(c.paddingInlineEnd) + parseFloat(c.borderInlineEndWidth); });
  expect(m.barra!.dir - m.tema!.dir, JSON.stringify(m)).toBe(Math.round(recheio));
  expect(m.tema!.x, "depois do `topbar`").toBeGreaterThan(m.titulo!.dir);
});

test("MNT-37 · a 800 × 450: a gaveta no começo da barra, a ponta no fim; nada rola para o lado", async ({page: p, baseURL}) => {
  for (const forma of ["canto-titulo", "so-ponta"]) {
    await abrir(p, baseURL, forma, {largura: 800, altura: 450});
    const m = await medir(p);
    expect(m.gaveta, `${forma}: ${JSON.stringify(m)}`).not.toBeNull();
    expect(m.botao, `${forma}: o de recolher some`).toBeNull();
    expect(m.barra!.dir - m.tema!.dir, forma).toBe(20);
    expect(m.ladoRola, forma).toBe(false);
  }
});
