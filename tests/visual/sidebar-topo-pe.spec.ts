import {test, expect, type Page} from "@playwright/test";
import {createElement as h, Fragment} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import * as A from "../../packages/react/dist/index.js";

// 4-C (23/10/2026) — a lateral com o topo e o pé fixos, medida no navegador contra a bancada das quinze laterais
// aprovadas pelo Victor (item 107; a variação 11 é a régua: o quadrinho de 36 a 16 da esquerda e 20 do topo, o primeiro
// item a 76, a pessoa numa caixinha de 56 a 12 do fim, a foto de 40 e o sair de 32 a 215).
//   • só o meio rola: com a lista longa, a caixa não rola, o meio sim, e o topo e o pé não saem do lugar;
//   • recolhida, a marca e a pessoa ficam centradas na trilha, a pessoa empilhada e sem a caixinha;
//   • sem topo e pé, a caixa rola inteira, como sempre.
// Provado contra o defeito: com o CSS da 0.40.1 a caixa inteira rola (o topo e o pé saem junto) e não há medida de marca
// nem de pessoa.
const MUITOS = Array.from({length: 24}, (_, n) => ({id: `i${n}`, label: `Item ${n + 1}`, icon: "house" as const}));
const PE = [{id: "s", label: "Support", icon: "lifebuoy" as const}];
const lateral = (id: string, props: Record<string, unknown>) => h(A.Sidebar, {id, items: MUITOS, current: "i0", ...props});
const marca = h(A.Sidebar.Brand, {logo: "P", name: "Acme Plans", description: "Workspace · Action plans"});
const pessoa = h(A.Sidebar.User, {avatar: h(A.Avatar, {fallback: "KM", alt: ""}), name: "Kate Moore", description: "Admin",
  action: h(A.IconButton, {icon: "sign-out", label: "Log out", size: "sm"})});
const CORPO = renderToStaticMarkup(h(Fragment, null,
  h("div", {className: "quadro"}, lateral("onze", {variant: "flush", header: marca, footer: pessoa})),
  h("div", {className: "quadro"}, lateral("onze-recolhida", {variant: "flush", collapsed: true, header: marca, footer: pessoa})),
  h("div", {className: "quadro"}, lateral("com-lista-no-pe", {variant: "flush", header: marca, footer: h(A.Sidebar.Nav, {items: PE, label: "More"})})),
  h("div", {className: "quadro"}, lateral("sem-partes", {variant: "flush"}))));

async function abrir(p: Page, baseURL: string | undefined) {
  const url = `${baseURL}/__sidebar-topo-pe`;
  await p.route(url, (r) => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="light"><head><meta charset="utf-8">
      <link rel="stylesheet" href="/packages/fonts/dist/fonts.css"><link rel="stylesheet" href="/packages/core/dist/aurea.css">
      <style>.quadro { --topbar-height:0px; display:inline-block; vertical-align:top; margin:0 8px 8px 0; }
      .quadro > .sidebar { position:static; width:var(--sidebar-width); height:600px; max-height:none; margin:0; }
      .quadro > .sidebar.sidebar-collapsed { width:var(--sidebar-rail); }</style></head>
      <body style="margin:0;background:var(--background)">${CORPO}</body></html>`}));
  await p.goto(url, {waitUntil: "networkidle"});
  await p.evaluate(() => document.fonts.ready);
}
const medir = (p: Page, id: string) => p.evaluate((id) => {
  const aside = document.getElementById(id)!, base = aside.getBoundingClientRect();
  const r = (s: string) => { const e = aside.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect();
    return {x: b.left - base.left, y: b.top - base.top, w: b.width, h: b.height, deBaixo: base.bottom - b.bottom, centroX: b.left + b.width / 2 - base.left}; };
  const meio = aside.querySelector<HTMLElement>(".sidebar-body");
  return {largura: base.width, centro: base.width / 2, caixaRola: aside.scrollHeight > aside.clientHeight + 1,
    meioRola: meio ? meio.scrollHeight > meio.clientHeight + 1 : null,
    logo: r(".sidebar-brand-logo"), item: r(".sidebar-body .sidebar-item"), pessoa: r(".sidebar-user"), foto: r(".sidebar-user .avatar"),
    sair: r(".sidebar-user .btn"), pe: r(".sidebar-footer"), topo: r(".sidebar-header")};
}, id);

test("4-C · a variação 11: as medidas da bancada das quinze", async ({page: p, baseURL}) => {
  await abrir(p, baseURL);
  const m = await medir(p, "onze");
  expect(m.logo, JSON.stringify(m)).toMatchObject({x: 16, y: 20, w: 36, h: 36});
  expect(m.item!.y, "o primeiro item, 56 abaixo do topo do quadrinho").toBe(76);
  expect(m.pessoa, JSON.stringify(m)).toMatchObject({x: 4, h: 56, deBaixo: 12});
  expect(m.foto, JSON.stringify(m)).toMatchObject({x: 16, w: 40, h: 40});
  expect(m.sair, JSON.stringify(m)).toMatchObject({x: 215, w: 32, h: 32});
});

test("4-C · só o meio rola: o topo e o pé ficam no lugar", async ({page: p, baseURL}) => {
  await abrir(p, baseURL);
  for (const id of ["onze", "com-lista-no-pe"]) {
    const antes = await medir(p, id);
    expect(antes.caixaRola, `${id}: a caixa não rola`).toBe(false);
    expect(antes.meioRola, `${id}: o meio rola`).toBe(true);
    await p.evaluate((id) => { document.querySelector(`#${id} .sidebar-body`)!.scrollTop = 200; }, id);
    const depois = await medir(p, id);
    expect(depois.topo, `${id}: o topo não sai do lugar`).toEqual(antes.topo);
    expect(depois.pe, `${id}: o pé não sai do lugar`).toEqual(antes.pe);
    expect(depois.item!.y, `${id}: a lista andou`).toBeLessThan(antes.item!.y);
  }
});

test("4-C · recolhida: a marca e a pessoa centradas na trilha, a pessoa empilhada e sem a caixinha", async ({page: p, baseURL}) => {
  await abrir(p, baseURL);
  const m = await medir(p, "onze-recolhida");
  for (const [nome, peca] of [["o quadrinho", m.logo], ["a foto", m.foto], ["o sair", m.sair]] as const)
    expect(Math.abs(peca!.centroX - m.centro), `${nome} no centro: ${JSON.stringify(m)}`).toBeLessThanOrEqual(0.5);
  expect(m.sair!.y, "o sair embaixo da foto").toBeGreaterThan(m.foto!.y + m.foto!.h - 1);
  const fundo = await p.evaluate(() => getComputedStyle(document.querySelector("#onze-recolhida .sidebar-user")!).backgroundColor);
  expect(fundo, "sem a caixinha").toBe("rgba(0, 0, 0, 0)");
});

test("4-C · sem topo e pé, a caixa rola inteira, como sempre", async ({page: p, baseURL}) => {
  await abrir(p, baseURL);
  const m = await medir(p, "sem-partes");
  expect(m.caixaRola).toBe(true);
  expect(m.meioRola).toBeNull();
});
