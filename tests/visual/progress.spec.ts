import {test, expect, type Page} from "@playwright/test";
import {createElement as el} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import * as A from "../../packages/react/dist/index.js";

// AN-07 · o `Progress` sem total, com apoio e com tom — 03/10/2026. Um consumidor novo mediu:
// trabalho que ainda está contando os arquivos aparecia como 0%, como se estivesse parado.
//
// Mede o RETÂNGULO de cada peça, no navegador, com a folha publicada. A animação é parada em
// pontos escolhidos (a API de animações da web), para a posição não depender do relógio.
// A folha de antes reprova todos: sem `value` o preenchimento pedia `NaN%` e não corria.

async function abrir(p: Page, baseURL: string | undefined, nome: string, corpo: string, dir = "ltr") {
  const url = `${baseURL}/__progress-${nome}`;
  await p.route(url, r => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="dark" dir="${dir}"><head>
      <link rel="stylesheet" href="/packages/fonts/dist/fonts.css">
      <link rel="stylesheet" href="/packages/core/dist/aurea.css"></head>
      <body style="width:400px;padding:0 40px">${corpo}</body></html>`}));
  await p.goto(url, {waitUntil: "networkidle"});
  await p.evaluate(() => document.fonts.ready);
}
const barra = (props: Record<string, unknown>) =>
  renderToStaticMarkup(el(A.AureaProvider, {spriteUrl: ""}, el(A.Progress, props as never)));

// Onde está o pedaço, em frações do trilho, no instante `t` da volta. O fim é 0,9999: em 1 a
// animação sem fim já está no começo da volta seguinte.
const posicao = (p: Page, t: number) => p.evaluate((t) => {
  const pedaco = document.querySelector(".progress-indeterminate > span")!;
  const [a] = pedaco.getAnimations();
  a.pause();
  a.currentTime = 1500 * t;
  const tr = pedaco.parentElement!.getBoundingClientRect(), pe = pedaco.getBoundingClientRect();
  return {de: (pe.left - tr.left) / tr.width, ate: (pe.right - tr.left) / tr.width,
    nome: a instanceof CSSAnimation ? a.animationName : "", corta: getComputedStyle(pedaco.parentElement!).overflow};
}, t);

test("Progress sem total: um pedaço de 2/5 atravessa o trilho, de fora a fora", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, "corre", barra({label: "Contando arquivos"}));
  const inicio = await posicao(p, 0), meio = await posicao(p, 0.5), fim = await posicao(p, 0.9999);
  expect(inicio.nome).toBe("progress-indeterminate");
  expect(inicio.corta, "sem overflow:hidden o pedaço vaza da pílula").toBe("hidden");
  // Começa inteiro antes da borda, termina inteiro depois: -100% e 350% da própria largura (como na referência).
  expect([inicio.de, inicio.ate].map((x) => +x.toFixed(2))).toEqual([-0.4, 0]);
  expect([fim.de, fim.ate].map((x) => +x.toFixed(2))).toEqual([1.4, 1.8]);
  // E no meio da volta ele está DENTRO do trilho, à vista.
  expect(meio.ate).toBeGreaterThan(0);
  expect(meio.de).toBeLessThan(1);
});

test("Progress sem total, da direita para a esquerda: o pedaço corre ao contrário", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, "rtl", barra({label: "Contando arquivos"}), "rtl");
  const inicio = await posicao(p, 0), fim = await posicao(p, 0.9999);
  expect([inicio.de, inicio.ate].map((x) => +x.toFixed(2))).toEqual([1, 1.4]);
  expect([fim.de, fim.ate].map((x) => +x.toFixed(2))).toEqual([-0.8, -0.4]);
});

test("Progress sem total, com menos movimento: a barra inteira, apagada, parada", async ({page: p, baseURL}) => {
  await p.emulateMedia({reducedMotion: "reduce"});
  await abrir(p, baseURL, "parada", barra({label: "Contando arquivos"}));
  const m = await p.$eval(".progress-indeterminate > span", (pedaco) => ({
    largura: pedaco.getBoundingClientRect().width, trilho: pedaco.parentElement!.getBoundingClientRect().width,
    opacidade: getComputedStyle(pedaco).opacity, animacoes: pedaco.getAnimations().length,
  }));
  // Um pedaço parado leria como "40% feito", que é a mentira que este pedido veio tirar.
  expect(m.largura).toBe(m.trilho);
  expect(m.opacidade).toBe("0.5");
  expect(m.animacoes).toBe(0);
});

test("Progress: o apoio no alto à direita, a 4 do trilho, em algarismos de largura igual", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, "apoio", barra({value: 64, label: "Enviando", detail: "2,3 MB/s · 12 s"}));
  const m = await p.evaluate(() => {
    const apoio = document.querySelector(".progress-detail")!, trilho = document.querySelector(".progress")!;
    const a = apoio.getBoundingClientRect(), t = trilho.getBoundingClientRect(), s = getComputedStyle(apoio);
    return {direita: [a.right, t.right], vao: t.top - a.bottom, letra: s.fontSize, numeros: s.fontVariantNumeric,
      trilho: t.height, preenchido: document.querySelector(".progress > span")!.getBoundingClientRect().width / t.width};
  });
  expect(m.direita[0]).toBe(m.direita[1]);
  expect(m.vao).toBe(4);
  expect(m.letra).toBe("14px");
  expect(m.numeros).toBe("tabular-nums");
  // E o trilho continua o de antes.
  expect(m.trilho).toBe(8);
  expect(m.preenchido).toBeCloseTo(0.64, 2);
});
