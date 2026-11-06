import {test, expect} from "@playwright/test";
import {createElement as h} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import * as A from "../../packages/react/dist/index.js";

// O ESCOLHIDO NO ALTO CONTRASTE DO SISTEMA (06/11/2026, a auditoria externa A-015, a forma "B" aprovada pelo Victor no
// FigCraft). Com o modo ligado, o navegador troca todo fundo pela cor da tela — o segmento e a aba escolhidos, que se
// distinguiam só pelo fundo, ficavam iguais aos outros; e o ponto do selo (que é fundo) sumia. Aqui, só o core, o modo
// ligado, e a medida do que o navegador PINTOU: o escolhido no destaque do sistema, diferente do irmão; o ponto na cor do
// texto. A Ember também ("Ember entra").
// Provado contra o defeito: contra o `aurea.css` de antes, os três primeiros reprovam.
const P = (k: unknown) => h(A.AureaProvider, {spriteUrl: ""}, k as never);
const PECAS = renderToStaticMarkup(P(h("div", null,
  h(A.SegmentedControl, {key: "s", label: "View", value: "b", onChange: () => {}, items: [{value: "a", label: "List"}, {value: "b", label: "Board"}]}),
  h(A.Tabs, {key: "t", label: "Sections", value: "o", onChange: () => {}, tabs: [{id: "o", label: "Overview", content: "x"}, {id: "d", label: "Detail", content: "y"}]}),
  h(A.Badge, {key: "b", tone: "success", dot: true}, "Stable"))));

async function abrir(page: import("@playwright/test").Page, baseURL: string | undefined, marca = "") {
  const url = `${baseURL}/__alto-contraste${marca}`;
  await page.route(url, (r) => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="light"${marca ? ` data-brand="${marca}"` : ""}><head>
      <link rel="stylesheet" href="/packages/core/dist/aurea.css"></head><body style="width:600px">${PECAS}</body></html>`}));
  await page.emulateMedia({forcedColors: "active"});
  await page.goto(url, {waitUntil: "networkidle"});
  return page.evaluate(() => {
    const cs = (e: Element | null) => (e ? getComputedStyle(e) : null)!;
    const sonda = (cor: string) => { const s = document.createElement("i"); s.style.color = cor; document.body.append(s); const v = getComputedStyle(s).color; s.remove(); return v; };
    const seg = [...document.querySelectorAll(".segmented :is(button,a)")].filter((e) => e.getClientRects().length);
    const tabs = [...document.querySelectorAll(".tab")];
    const escolhido = (l: Element[], sel: string) => l.find((e) => e.matches(sel))!, outro = (l: Element[], sel: string) => l.find((e) => !e.matches(sel))!;
    return {destaque: sonda("Highlight"), textoDestaque: sonda("HighlightText"), texto: sonda("CanvasText"), tela: sonda("Canvas"),
      seg: {esc: cs(escolhido(seg, ".active")).backgroundColor, cor: cs(escolhido(seg, ".active")).color, outro: cs(outro(seg, ".active")).backgroundColor},
      aba: {esc: cs(escolhido(tabs, "[data-active]")).backgroundColor, cor: cs(escolhido(tabs, "[data-active]")).color, outro: cs(outro(tabs, "[data-active]")).backgroundColor},
      ponto: cs(document.querySelector(".badge-dot")).backgroundColor};
  });
}

test("alto contraste: o segmento escolhido no destaque do sistema", async ({page, baseURL}) => {
  const m = await abrir(page, baseURL);
  expect([m.seg.esc, m.seg.cor]).toEqual([m.destaque, m.textoDestaque]);
  expect(m.seg.outro).not.toBe(m.destaque);
});
test("alto contraste: a aba escolhida no destaque do sistema", async ({page, baseURL}) => {
  const m = await abrir(page, baseURL);
  expect([m.aba.esc, m.aba.cor]).toEqual([m.destaque, m.textoDestaque]);
  expect(m.aba.outro).not.toBe(m.destaque);
});
test("alto contraste: o ponto do selo na cor do texto, e não na da tela", async ({page, baseURL}) => {
  const m = await abrir(page, baseURL);
  expect(m.ponto).toBe(m.texto);
});
// A Ember recebe também (o Victor, 06/11/2026: "Ember entra"): no alto contraste o sistema troca as cores de toda marca.
test("alto contraste: a Ember também — o segmento no destaque e o ponto na cor do texto", async ({page, baseURL}) => {
  const m = await abrir(page, baseURL, "ember");
  expect([m.seg.esc, m.seg.cor, m.ponto]).toEqual([m.destaque, m.textoDestaque, m.texto]);
});

// AS OUTRAS SETE (06/11/2026, "vamos fazer logo todas agora"): a mesma forma B no dia escolhido do calendário, na linha
// escolhida da tabela e no botão ligado; e o ponto do carrossel, que é fundo e sumia inteiro — o atual no destaque, os
// outros na cor do texto. Medido nas páginas do site, onde a peça está viva.
// Provado contra o defeito: contra o CSS de antes, os quatro reprovam (o fundo saía na cor da tela).
for (const [pag, sel, ps, cor] of [
  ["calendar.html", ".calendar td[data-selected] button", null, "Highlight"],
  ["table.html", "tr[data-selected] > td", null, "Highlight"],
  ["pattern-button-pinned-filter.html", '.demo .btn[aria-pressed="true"]', null, "Highlight"],
  ["carousel.html", '.carousel-dot[aria-current="true"]', "::before", "Highlight"],
  ["carousel.html", '.carousel-dot:not([aria-current="true"])', "::before", "CanvasText"],
] as const) {
  test(`alto contraste: ${pag} — ${sel}${ps ?? ""} em ${cor}`, async ({page}) => {
    await page.emulateMedia({forcedColors: "active"});
    await page.goto(`/apps/catalog/${pag}`);
    await page.evaluate(() => document.querySelectorAll("details").forEach((d) => { d.open = true; }));
    await expect(page.locator(sel).first()).toBeAttached();
    const m = await page.evaluate(([sel, ps, cor]) => {
      const s = document.createElement("i"); s.style.color = cor; document.body.append(s); const alvo = getComputedStyle(s).color; s.remove();
      return {alvo, pintado: getComputedStyle(document.querySelector(sel)!, ps).backgroundColor};
    }, [sel, ps, cor] as const);
    expect(m.pintado).toBe(m.alvo);
  });
}
