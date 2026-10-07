import {test, expect} from "@playwright/test";
import {createElement as el} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import * as A from "../../packages/react/dist/index.js";

// GAR-08 (06/10/2026) · o cartão clicável na horizontal perdia a coluna da foto. Medido no CSS da
// 0.19.1: `.card-interactive { display:block }` vinha depois de `.card-horizontal { display:grid }`,
// com a mesma força, e ganhava — o cartão de notícia com miniatura virava uma pilha. Aqui se mede no
// navegador, com a folha publicada, o que a cascata decide: a grade, e a foto ao lado do texto.
// Provado contra o defeito: com o `display:block` de volta no `.card-interactive`, este teste
// reprova (o cartão sai `block`, e o título fica embaixo da foto).
test("Card clicável e horizontal: a foto fica ao lado do texto", async ({page: p, baseURL}) => {
  const cartao = (render: string) => renderToStaticMarkup(el(A.Card, {
    variant: "interactive", orientation: "horizontal",
    render: render === "a" ? el("a", {href: "#materia"}) : el("button", {type: "button"}),
  } as never,
    el(A.Card.Media, null, el("div", {style: {aspectRatio: "1", background: "gray"}})),
    el("h3", {className: "titulo"}, "Título da matéria"),
    el("p", null, "Resumo de uma linha.")));
  const url = `${baseURL}/__card-horizontal`;
  await p.route(url, r => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="dark"><head>
      <link rel="stylesheet" href="/packages/core/dist/aurea.css"></head>
      <body style="margin:0;width:600px"><div data-alvo="a">${cartao("a")}</div><div data-alvo="button">${cartao("button")}</div></body></html>`}));
  await p.setViewportSize({width: 600, height: 600});
  await p.goto(url, {waitUntil: "networkidle"});
  const medidas = await p.$$eval("[data-alvo]", (caixas) => caixas.map((c) => {
    const card = c.firstElementChild as HTMLElement;
    const foto = card.querySelector(".card-media")!.getBoundingClientRect();
    const titulo = card.querySelector(".titulo")!.getBoundingClientRect();
    return {alvo: (c as HTMLElement).dataset.alvo, tag: card.tagName, display: getComputedStyle(card).display,
      fotoDireita: Math.round(foto.right), tituloEsquerda: Math.round(titulo.left),
      fotoTopo: Math.round(foto.top), tituloTopo: Math.round(titulo.top), largura: Math.round(card.getBoundingClientRect().width)};
  }));
  expect(medidas.map((m) => m.tag)).toEqual(["A", "BUTTON"]);
  for (const m of medidas) {
    expect(m.display, JSON.stringify(m)).toBe("grid");
    // O título começa DEPOIS da foto, na mesma faixa de cima — não embaixo dela.
    expect(m.tituloEsquerda, JSON.stringify(m)).toBeGreaterThan(m.fotoDireita);
    expect(m.tituloTopo, JSON.stringify(m)).toBeLessThan(m.fotoTopo + 40);
    // E o alvo continua ocupando a linha (o `inline-size:100%` do clicável).
    expect(m.largura).toBe(600);
  }
});

// Quem mais: o cartão clicável na VERTICAL (o padrão) continua bloco, como sempre.
test("Card clicável vertical continua bloco", async ({page: p, baseURL}) => {
  const url = `${baseURL}/__card-vertical`;
  await p.route(url, r => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="dark"><head>
      <link rel="stylesheet" href="/packages/core/dist/aurea.css"></head>
      <body style="margin:0;width:600px">${renderToStaticMarkup(el(A.Card, {variant: "interactive", render: el("a", {href: "#x"})} as never, "Cartão"))}</body></html>`}));
  await p.goto(url, {waitUntil: "networkidle"});
  expect(await p.$eval(".card", (c) => getComputedStyle(c).display)).toBe("block");
});
