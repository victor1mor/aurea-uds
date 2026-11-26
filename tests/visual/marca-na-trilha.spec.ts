import {test, expect, type Page} from "@playwright/test";
import {createElement as h, Fragment} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import * as A from "../../packages/react/dist/index.js";

// A MARCA NA TRILHA (0.82.1, aprovado na bancada pelo Victor em 26/11/2026). Na lateral com painel (`panel`), a marca
// (`Sidebar.Brand`) e a pessoa (`Sidebar.User`) moram na trilha de ícones (`.sidebar-rail-box`), mas a regra que as centra só
// existia para a lateral recolhida (`.sidebar-collapsed`) — e, com o painel aberto ou por cima, a lateral não é recolhida.
// O app mediu a 1440: o centro dos ícones a 34 da borda e o do "L" a 42. Aqui, em cada trilha, o centro do quadrinho, da ação
// da marca, da foto e do sair é o centro dos ícones (1 px de folga), e a pessoa fica sem a caixinha, como na recolhida.
// Provado contra o defeito: com o CSS da 0.82.0 o quadrinho fica a +8, a ação a +47, a foto a +6 e o sair a +54.
const SECOES = [
  {id: "s-home", label: "Home", icon: "house" as const, items: [{id: "overview", label: "Overview", href: "#o"}]},
  {id: "s-map", label: "Map", icon: "map-trifold" as const, items: [{id: "regions", label: "Regions", href: "#r"}]},
];
const marca = h(A.Sidebar.Brand, {logo: "L", name: "Production", description: "Workspace"});
const marcaComAcao = h(A.Sidebar.Brand, {logo: "L", name: "Production", action: h(A.IconButton, {icon: "bell", label: "Notifications", size: "sm"})});
const marcaSolta = h(A.Sidebar.Brand, {variant: "plain", logo: "L", name: "Production"});
const pessoa = h(A.Sidebar.User, {avatar: h(A.Avatar, {fallback: "KM", alt: ""}), name: "Kate Moore", description: "Admin",
  action: h(A.IconButton, {icon: "sign-out", label: "Log out", size: "sm"})});
const lateral = (id: string, props: Record<string, unknown>) =>
  h("div", {className: "quadro"}, h(A.Sidebar, {id, items: SECOES, current: "overview", header: marca, footer: pessoa, ...props}));
const CASOS = {
  "painel-ao-lado": {panel: "docked"},
  "painel-por-cima": {panel: "overlay"},
  "painel-recolhido": {panel: "docked", collapsed: true},
  "escura": {panel: "docked", contrast: true},
  "marca-com-acao": {panel: "docked", header: marcaComAcao},
  "marca-solta": {panel: "overlay", header: marcaSolta},
} as const;
const CORPO = renderToStaticMarkup(h(Fragment, null, ...Object.entries(CASOS).map(([id, p]) => lateral(id, p))));

async function abrir(p: Page, baseURL: string | undefined, tema: string) {
  const url = `${baseURL}/__marca-na-trilha-${tema}`;
  await p.route(url, (r) => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="${tema}"><head><meta charset="utf-8">
      <link rel="stylesheet" href="/packages/fonts/dist/fonts.css"><link rel="stylesheet" href="/packages/core/dist/aurea.css">
      <style>.quadro { --topbar-height:0px; display:inline-block; vertical-align:top; margin:0 8px 8px 0; }
      .quadro > .sidebar { position:static; height:600px; max-height:none; margin:0; }</style></head>
      <body style="margin:0;background:var(--background)">${CORPO}</body></html>`}));
  await p.goto(url, {waitUntil: "networkidle"});
  await p.evaluate(() => document.fonts.ready);
}
const medir = (p: Page, id: string) => p.evaluate((id) => {
  const trilha = document.querySelector(`#${id} .sidebar-rail-box`)!;
  const centro = (s: string) => { const e = trilha.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return b.left + b.width / 2; };
  const pessoa = trilha.querySelector(".sidebar-user");
  return {icones: centro(".sidebar-nav .sidebar-item")!, logo: centro(".sidebar-brand-logo"), acao: centro(".sidebar-brand .btn"),
    foto: centro(".sidebar-user .avatar"), sair: centro(".sidebar-user .btn"),
    caixinha: pessoa ? getComputedStyle(pessoa).backgroundColor : null};
}, id);

for (const tema of ["light", "dark"]) {
  test(`a marca e a pessoa no centro da trilha com painel (${tema})`, async ({page: p, baseURL}) => {
    await abrir(p, baseURL, tema);
    for (const id of Object.keys(CASOS)) {
      const m = await medir(p, id);
      for (const peca of ["logo", "acao", "foto", "sair"] as const) {
        if (m[peca] == null) continue;
        expect(Math.abs(m[peca]! - m.icones), `${id}: ${peca} no centro dos ícones — ${JSON.stringify(m)}`).toBeLessThanOrEqual(1);
      }
      expect(m.caixinha, `${id}: a pessoa sem a caixinha, como na recolhida`).toBe("rgba(0, 0, 0, 0)");
    }
  });
}
