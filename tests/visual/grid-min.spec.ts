import {test, expect} from "@playwright/test";
import {createElement as el} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import * as A from "../../packages/react/dist/index.js";

// AN-08 · o `Grid` com `min` por nome — 03/10/2026. Medido no app de um consumidor: `min="sm"`
// passou pelo tipo e a grade virou UMA coluna, sem aviso. Aqui se conta a coluna de verdade, no
// navegador, com a folha publicada: numa linha de 1200 com vão de 16, cabem ⌊(1200 + 16) / (mínimo
// + 16)⌋. A folha de antes dá uma coluna para todo nome.
const LINHA = 1200, VAO = 16;
const MINIMO: Record<string, number> = {xs: 128, sm: 192, md: 240, lg: 320};

test("Grid: cada nome dá o número de colunas da sua medida", async ({page: p, baseURL}) => {
  const grades = Object.keys(MINIMO).map((min) => `<div data-min="${min}">${renderToStaticMarkup(el(A.Grid, {min} as never,
    ...Array.from({length: 10}, (_, i) => el(A.Card, {key: i}, `Item ${i + 1}`))))}</div>`).join("");
  const url = `${baseURL}/__grid-min`;
  await p.route(url, r => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="dark"><head>
      <link rel="stylesheet" href="/packages/core/dist/aurea.css"></head>
      <body style="margin:0;width:${LINHA}px">${grades}</body></html>`}));
  await p.setViewportSize({width: LINHA, height: 900});
  await p.goto(url, {waitUntil: "networkidle"});
  const medidas = await p.$$eval("[data-min]", (caixas) => caixas.map((c) => {
    const g = c.firstElementChild!;
    const colunas = getComputedStyle(g).gridTemplateColumns.split(" ").map(parseFloat);
    return {min: (c as HTMLElement).dataset.min!, colunas: colunas.length, menor: Math.min(...colunas), linha: g.getBoundingClientRect().width};
  }));
  for (const m of medidas) {
    expect(m.linha).toBe(LINHA);
    const cabem = Math.floor((LINHA + VAO) / (MINIMO[m.min] + VAO));
    expect(m.colunas, `${m.min}: ${JSON.stringify(m)}`).toBe(cabem);
    expect(m.menor).toBeGreaterThanOrEqual(MINIMO[m.min]);
  }
  // E os quatro são diferentes: 8, 5, 4 e 3.
  expect(medidas.map((m) => m.colunas)).toEqual([8, 5, 4, 3]);
});
