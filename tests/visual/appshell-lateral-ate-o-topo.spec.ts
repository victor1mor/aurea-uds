import {test, expect, type Page} from "@playwright/test";
import {createElement as h} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import * as A from "../../packages/react/dist/index.js";

// MNT-34 (23/10/2026) — o `AppShell` com a lateral até o topo, medido no navegador nas medidas da bancada aprovada pelo
// Victor (a tela dele, 1280 × 663; e 800 × 450, a mesma a 200%):
//   • de canto: a lateral de 0 ao fim da janela, o conteúdo a 16 dela (o respiro que o app pediu) e a 16 do topo;
//   • flutuante: a lateral de 16 a 16 do fim; o conteúdo a 16 do topo;
//   • com a barra: ela fica só sobre a coluna do conteúdo, com 56, e o conteúdo começa a 16 dela;
//   • o botão aprovado (o de ícone de lateral, 36, sem fundo) a 12 do título, alinhado — o das quinze laterais;
//   • a 800: sem barra, a faixa com o botão da gaveta; o botão de recolher não aparece; nada rola para o lado;
//   • o arranjo de sempre (sem `layout`) continua com a barra atravessando a tela e a lateral a 96.
// Provado contra o defeito: com o CSS e o React da 0.41.0 não havia `layout="sidebar"` — a barra atravessava a tela, a
// lateral começava a 96 e não havia faixa nem botão ao lado do título.
const ITENS = [{id: "a", label: "Dispositivos", icon: "desktop-tower" as const, href: "#"}, {id: "b", label: "Ajustes", icon: "gear" as const, href: "#"}];
const marca = h(A.Sidebar.Brand, {logo: "R", name: "Rede", description: "Gestão da rede"});
const titulo = h("div", {style: {display: "flex", alignItems: "center", gap: "var(--space-3)"}},
  h(A.AppShell.SidebarToggle, null), h("h1", {id: "titulo", style: {margin: 0}}, "Dispositivos"));
const FORMAS: Record<string, Record<string, unknown>> = {
  hoje: {brand: h("strong", null, "Rede"), topbar: h("span", null, "ações")},
  canto: {layout: "sidebar", sidebarVariant: "flush", brand: marca},
  flutuante: {layout: "sidebar", brand: marca},
  "canto-barra": {layout: "sidebar", sidebarVariant: "flush", brand: marca, topbar: h("strong", {id: "titulo"}, "Dispositivos")},
};
const pagina = (forma: string) => renderToStaticMarkup(h(A.AppShell, {navItems: ITENS, currentNavId: "a", sidebarCollapsible: true, ...FORMAS[forma]},
  forma === "canto" || forma === "flutuante" ? titulo : h("h1", null, "Dispositivos"), h("div", {style: {height: "1600px"}})));

async function abrir(p: Page, baseURL: string | undefined, forma: string, largura = 1280, altura = 663) {
  await p.setViewportSize({width: largura, height: altura});
  const url = `${baseURL}/__lateral-${forma}`;
  await p.route(url, (r) => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="light"><head><meta charset="utf-8">
      <link rel="stylesheet" href="/packages/fonts/dist/fonts.css"><link rel="stylesheet" href="/packages/core/dist/aurea.css"></head>
      <body style="margin:0">${pagina(forma)}</body></html>`}));
  await p.goto(url, {waitUntil: "networkidle"});
  await p.evaluate(() => document.fonts.ready);
}
const medir = (p: Page) => p.evaluate(() => {
  const r = (s: string) => { const e = document.querySelector(s); if (!e || !e.getClientRects().length) return null; const b = e.getBoundingClientRect();
    return {x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height), meio: b.top + b.height / 2, dir: Math.round(b.right)}; };
  return {janela: {w: document.documentElement.clientWidth, h: innerHeight}, lateral: r(".app-shell > .sidebar"), barra: r(".app-shell .topbar"),
    conteudo: r("main.content"), botao: r(".sidebar-collapse-trigger"), titulo: r("#titulo"), faixa: r(".app-shell-narrow-bar"),
    gaveta: r(".nav-toggle"), bolinha: r(".sidebar-toggle-slot .sidebar-toggle"), ladoRola: document.documentElement.scrollWidth > document.documentElement.clientWidth};
});

test("MNT-34 · de canto, sem barra: a lateral de 0 ao fim, o conteúdo a 16, o botão aprovado a 12 do título", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, "canto");
  const m = await medir(p);
  expect(m.lateral, JSON.stringify(m)).toMatchObject({x: 0, y: 0, h: m.janela.h});
  expect(m.barra, "sem barra de cima").toBeNull();
  expect(m.conteudo!.x - m.lateral!.dir, "o respiro de 16").toBe(16);
  expect(m.conteudo!.y, "o conteúdo a 16 do topo").toBe(16);
  expect(m.botao, JSON.stringify(m)).toMatchObject({w: 36, h: 36});
  expect(m.titulo!.x - m.botao!.dir, "o botão a 12 do título").toBe(12);
  expect(Math.abs(m.titulo!.meio - m.botao!.meio), "alinhados").toBeLessThan(1);
  expect(m.bolinha, "sem a bolinha da junção").toBeNull();
  expect(m.ladoRola).toBe(false);
  const fundo = await p.evaluate(() => getComputedStyle(document.querySelector(".sidebar-collapse-trigger")!).backgroundColor);
  expect(fundo, "o botão sem fundo, como nas quinze").toBe("rgba(0, 0, 0, 0)");
});

test("MNT-34 · flutuante, sem barra: a lateral de 16 a 16 do fim; o conteúdo a 16 do topo", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, "flutuante");
  const m = await medir(p);
  expect(m.lateral, JSON.stringify(m)).toMatchObject({x: 16, y: 16, h: m.janela.h - 32});
  expect(m.conteudo!.y).toBe(16);
});

test("MNT-34 · de canto, com a barra: ela fica só sobre o conteúdo, com 56; o botão é o primeiro dela", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, "canto-barra");
  const m = await medir(p);
  expect(m.barra, JSON.stringify(m)).toMatchObject({x: m.lateral!.dir, y: 0, h: 56});
  expect(m.conteudo!.y - (m.barra!.y + m.barra!.h), "o conteúdo a 16 da barra").toBe(16);
  expect(m.titulo!.x - m.botao!.dir, "o botão a 12 do título").toBe(12);
});

test("MNT-34 · a 800 × 450: a faixa (ou a barra) com o botão da gaveta; o de recolher some; nada rola para o lado", async ({page: p, baseURL}) => {
  for (const forma of ["canto", "canto-barra"]) {
    await abrir(p, baseURL, forma, 800, 450);
    const m = await medir(p);
    expect(m.gaveta, `${forma}: o botão da gaveta`).not.toBeNull();
    expect(m.botao, `${forma}: o de recolher some`).toBeNull();
    expect(m.lateral, `${forma}: a lateral é gaveta, fechada`).toBeNull();
    if (forma === "canto") expect(m.faixa, JSON.stringify(m)).toMatchObject({y: 0, h: 56});
    expect(m.ladoRola, forma).toBe(false);
  }
});

test("MNT-34 · o arranjo de sempre não muda: a barra atravessa a tela, a lateral a 96, a bolinha da junção", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, "hoje");
  const m = await medir(p);
  expect(m.barra, JSON.stringify(m)).toMatchObject({x: 16, y: 16, h: 64});
  expect(m.lateral!.y).toBe(96);
  expect(m.bolinha).not.toBeNull();
  expect(m.botao).toBeNull();
});
