import {test, expect, type Page} from "@playwright/test";
import {createElement as h, Fragment} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import * as A from "../../packages/react/dist/index.js";

// Lote M (0.28.0), medido no navegador, nos três motores:
//   • GAR-14: o aviso "Link copiado" tem a MEDIDA do botão — a altura, a letra, o peso, o recheio e
//     a cápsula —, pedido do Victor olhando a bancada ("quero mesma largura dos outros botões"). E
//     fica logo abaixo dele, alinhado no começo. A cópia que falha deixa o link selecionado.
//   • GAR-15: a moldura tem o canto da folha (32) por fora e o de dentro acompanha (32 − 8); a
//     captura é a do tema da página.
//   • GAR-16: na tabela, "11.111" e "88.888" ocupam a MESMA largura.
// Aqui roda o caminho do HTML puro (o `aurea.js`); o do React, com o motor posicionando, é coberto
// em `tests/unit/lote-m.test.tsx` — e a pele é a mesma classe nos dois.
// Provado contra o defeito: com o CSS e o `aurea.js` da 0.27.0 o clique não faz nada (não há
// `.toast-anchored`), a moldura não existe e os dois números da tabela têm larguras diferentes.
const LINK = "https://exemplo.com.br/noticias/moto-do-ano";
const TELA = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="180" height="390"><rect width="180" height="390" fill="#f5f5f5"/></svg>');
const TELA_ESCURA = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="180" height="390"><rect width="180" height="390" fill="#1f1f1f"/></svg>');
const CORPO = renderToStaticMarkup(h(Fragment, null,
  h("div", {style: {display: "flex", gap: "8px", alignItems: "center"}},
    h(A.Button, {id: "com-texto", share: {url: LINK}}, "Compartilhar"),
    h(A.IconButton, {id: "so-icone", icon: "share-network", label: "Compartilhar link", variant: "secondary", share: {url: LINK}})),
  h("div", {style: {width: "160px", marginTop: "96px"}},
    h(A.Image, {src: TELA, srcDark: TELA_ESCURA, alt: "Tela do app", frame: "phone", loading: "eager"})),
  h(A.Table, {caption: "Preços", fit: true},
    h("tbody", null,
      h("tr", null, h("td", null, h("span", {id: "uns"}, "11.111"))),
      h("tr", null, h("td", null, h("span", {id: "oitos"}, "88.888")))))));

async function abrir(p: Page, baseURL: string | undefined, tema: string, copiar: "ok" | "falha" = "ok") {
  // Sem o compartilhar do sistema: o caminho que se mede é o de copiar (o do Chrome no Windows, por
  // exemplo, abriria a janela do sistema e a medida não teria o que medir).
  await p.addInitScript((modo) => {
    delete (Navigator.prototype as unknown as Record<string, unknown>).share;
    delete (Navigator.prototype as unknown as Record<string, unknown>).canShare;
    Object.defineProperty(navigator, "clipboard", {configurable: true,
      value: {writeText: () => modo === "ok" ? Promise.resolve() : Promise.reject(new Error("negado"))}});
  }, copiar);
  const url = `${baseURL}/__compartilhar`;
  await p.route(url, (r) => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html lang="pt-BR" data-theme="${tema}"><head><meta charset="utf-8">
      <link rel="stylesheet" href="/packages/fonts/dist/fonts.css">
      <link rel="stylesheet" href="/packages/core/dist/aurea.css"></head>
      <body style="margin:0;padding:16px;background:var(--background)">${CORPO}
      <script src="/packages/core/dist/aurea.js"></script></body></html>`}));
  await p.goto(url, {waitUntil: "networkidle"});
  await p.evaluate(() => document.fonts.ready);
}

for (const tema of ["light", "dark"]) {
  test.describe(`GAR-14 · o aviso do compartilhar · ${tema}`, () => {
    for (const id of ["com-texto", "so-icone"]) {
      test(`${id}: o aviso tem a medida do botão e fica logo abaixo dele`, async ({page, baseURL}) => {
        await abrir(page, baseURL, tema);
        await page.click(`#${id}`);
        const aviso = page.locator(".toast-anchored");
        await expect(aviso).toBeVisible();
        // O texto é o que a marcação leva (o padrão do React, em inglês), e vence a língua da página.
        await expect(aviso).toHaveText("Link copied");
        const m = await page.evaluate((sel) => {
          const b = document.querySelector(sel)!, a = document.querySelector(".toast-anchored")!;
          const cb = getComputedStyle(b), ca = getComputedStyle(a), rb = b.getBoundingClientRect(), ra = a.getBoundingClientRect();
          const espaco = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--space-2")) * parseFloat(getComputedStyle(document.documentElement).fontSize);
          return {hb: rb.height, ha: ra.height, fb: cb.fontSize, fa: ca.fontSize, pb: cb.fontWeight, pa: ca.fontWeight,
            rec: [getComputedStyle(document.querySelector("#com-texto")!).paddingInlineStart, ca.paddingInlineStart],
            canto: parseFloat(ca.borderTopLeftRadius), topo: ra.top - rb.bottom, espaco, esq: [rb.left, ra.left]};
        }, `#${id}`);
        expect(m.ha, "a altura do aviso é a do botão").toBeCloseTo(m.hb, 0);
        expect(m.fa).toBe(m.fb);
        expect(m.pa).toBe(m.pb);
        expect(m.rec[1], "o recheio do aviso é o do botão com texto").toBe(m.rec[0]);
        expect(m.canto, "cápsula").toBeGreaterThanOrEqual(m.ha / 2);
        expect(m.topo, "logo abaixo do botão, a um --space-2").toBeCloseTo(m.espaco, 0);
        expect(m.esq[1], "alinhado no começo do botão").toBeCloseTo(m.esq[0], 0);
        await expect(page.locator("[data-aurea-status]")).toHaveText("Link copied");
      });
    }

    test("a cópia que falha deixa o link selecionado, e Esc devolve o foco", async ({page, baseURL}) => {
      await abrir(page, baseURL, tema, "falha");
      await page.click("#com-texto");
      const campo = page.locator(".toast-anchored-stack .toast-anchored-link");
      await expect(campo).toBeFocused();
      await expect(campo).toHaveValue(LINK);
      const sel = await campo.evaluate((c: HTMLInputElement) => [c.selectionStart, c.selectionEnd]);
      expect(sel).toEqual([0, LINK.length]);
      await page.keyboard.press("Escape");
      await expect(page.locator(".toast-anchored-stack")).toHaveCount(0);
      await expect(page.locator("#com-texto")).toBeFocused();
    });

    test("GAR-15 · a moldura: 32 por fora, 32 − 8 por dentro, a proporção e a captura do tema", async ({page, baseURL}) => {
      await abrir(page, baseURL, tema);
      const m = await page.evaluate(() => {
        const f = document.querySelector(".image-frame-phone")!;
        const visivel = [...f.querySelectorAll("img")].filter((i) => getComputedStyle(i).display !== "none");
        const r = visivel[0].getBoundingClientRect();
        return {fora: getComputedStyle(f).borderTopLeftRadius, dentro: getComputedStyle(visivel[0]).borderTopLeftRadius,
          quantas: visivel.length, src: visivel[0].getAttribute("src"), razao: r.height / r.width};
      });
      expect(m.fora).toBe("32px");
      expect(m.dentro).toBe("24px");
      expect(m.quantas).toBe(1);
      expect(m.src).toBe(tema === "dark" ? TELA_ESCURA : TELA);
      expect(m.razao).toBeCloseTo(19.5 / 9, 1);
    });

    test("GAR-16 · na tabela, \"11.111\" e \"88.888\" ocupam a mesma largura", async ({page, baseURL}) => {
      await abrir(page, baseURL, tema);
      const [uns, oitos] = await page.evaluate(() => ["#uns", "#oitos"].map((s) => document.querySelector(s)!.getBoundingClientRect().width));
      expect(uns).toBeCloseTo(oitos, 1);
    });
  });
}
