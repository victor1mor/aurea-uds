import {test, expect} from "@playwright/test";
import {createElement as el} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import * as A from "../../packages/react/dist/index.js";

// AN-04 · a foto e os sinais na linha do `NavList` — 03/10/2026. Mede no Chromium, com a folha
// publicada, o que o jsdom não sabe: o NOME que o leitor de tela ouve (os espaços entre as partes
// vêm do leiaute) e o retângulo de cada peça. A folha de antes reprova: não havia foto nem sinal.
const FOTO = "data:image/svg+xml," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#52525b"/></svg>');

test("NavList: a foto no começo, os sinais antes do valor, e o nome inteiro para o leitor de tela", async ({page: p, baseURL}) => {
  const lista = renderToStaticMarkup(el(A.AureaProvider, {spriteUrl: "/packages/icons/dist/aurea-icons.svg"}, el(A.NavList, {items: [
    {id: "ana", label: "Ana", description: "Até amanhã", value: "3", href: "#ana", avatar: {src: FOTO, fallback: "AN"},
      indicators: [{icon: "push-pin", label: "Fixada"}, {icon: "bell-slash", label: "Silenciada"}]},
    {id: "bia", label: "Bia", description: "Tudo certo", href: "#bia", avatar: {fallback: "BI"}}]})));
  const url = `${baseURL}/__navlist-an04`;
  await p.route(url, r => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="dark"><head>
      <link rel="stylesheet" href="/packages/fonts/dist/fonts.css">
      <link rel="stylesheet" href="/packages/core/dist/aurea.css"></head>
      <body style="width:360px">${lista}</body></html>`}));
  await p.goto(url, {waitUntil: "networkidle"});
  await p.evaluate(() => document.fonts.ready);

  // O nome, como o Chromium o calcula para a árvore de acessibilidade.
  await expect(p.getByRole("link").first()).toHaveAccessibleName("Ana Até amanhã Fixada Silenciada 3");

  const m = await p.$eval(".nav-list-row", (linha) => {
    const r = (s: string) => linha.querySelector(s)!.getBoundingClientRect();
    const l = linha.getBoundingClientRect(), foto = r(".avatar"), texto = r(".nav-list-text"),
      sinais = r(".nav-list-indicators"), valor = r(".nav-list-value");
    const icones = [...linha.querySelectorAll(".nav-list-indicators svg")].map((s) => s.getBoundingClientRect());
    return {
      fotoNoComeco: foto.left - l.left, centroFoto: foto.top + foto.height / 2 - (l.top + l.height / 2),
      fotoLado: [foto.width, foto.height], ordem: [texto.right <= sinais.left, sinais.right <= valor.left],
      icones: icones.map((i) => [i.width, i.height]),
      vaoEntreSinais: icones[1].left - icones[0].right,
      corSinal: getComputedStyle(linha.querySelector(".nav-list-indicators")!).color,
      corValor: getComputedStyle(linha.querySelector(".nav-list-value")!).color,
    };
  });
  expect(m.fotoNoComeco, "a foto encosta no recheio da linha (space-3)").toBe(12);
  expect(Math.abs(m.centroFoto)).toBeLessThanOrEqual(0.5);
  expect(m.fotoLado).toEqual([36, 36]);
  expect(m.ordem).toEqual([true, true]);
  expect(m.icones).toEqual([[16, 16], [16, 16]]);
  expect(m.vaoEntreSinais).toBe(4);
  expect(m.corSinal, "o sinal é apagado como o valor").toBe(m.corValor);
});
