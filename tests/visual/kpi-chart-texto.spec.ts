import {test, expect, type Page} from "@playwright/test";
import {createElement as h} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import * as A from "../../packages/react/dist/index.js";

// O KPI e o texto do gráfico (08/10/2026), pedido de um consumidor da web com baixa visão, medido
// no navegador, nos três motores:
//   • o NÚMERO do KPI tem o `--text-3xl` que a ficha promete — antes saía com 14, igual ao rótulo;
//   • a tendência tem o `--text-sm` — antes, 11,7 (o `small` do navegador encolhia a letra);
//   • o texto dos eixos e da legenda do gráfico segue `--chart-text`, com o padrão de sempre
//     (`--text-xs`) quando ninguém pede outro.
// Este teste existe para a ficha e o CSS não se separarem de novo: ele lê o tamanho CALCULADO.
// Provado contra o defeito: com o CSS da 0.24.0, o número mede 14 e a válvula é ignorada.
const KPI = renderToStaticMarkup(h(A.KPI, {id: "kpi", label: "Receita", value: "R$ 12.400", trend: "+8% no mês"}));
// O gráfico real é do motor (Recharts) e precisa de tamanho na tela; aqui vale a regra da Aurea
// sobre o `<text>` do SVG e a legenda, que é o que o pedido acusou.
const GRAFICO = (estilo: string) => `<div class="chart" style="${estilo}"><svg width="200" height="40"><text id="eixo" x="0" y="20">Jan</text></svg>
  <div class="chart-key" id="legenda"><i></i>Receita</div></div>`;

async function abrir(p: Page, baseURL: string | undefined, corpo: string) {
  const url = `${baseURL}/__kpi-chart-texto`;
  await p.route(url, (r) => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="dark"><head><meta charset="utf-8">
      <link rel="stylesheet" href="/packages/core/dist/aurea.css"></head><body style="margin:0;padding:16px">${corpo}
      <span id="s3xl" style="font-size:var(--text-3xl)">x</span><span id="ssm" style="font-size:var(--text-sm)">x</span>
      <span id="sxs" style="font-size:var(--text-xs)">x</span><span id="sbase" style="font-size:var(--text-base)">x</span></body></html>`}));
  await p.goto(url, {waitUntil: "networkidle"});
}
const tam = (p: Page, sel: string) => p.locator(sel).first().evaluate((e) => getComputedStyle(e).fontSize);

test("KPI · o número tem o --text-3xl da ficha, e a tendência o --text-sm", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, KPI);
  const valor = await tam(p, "#kpi > strong");
  const rotulo = await tam(p, "#kpi > span");
  expect(valor, "o número com o --text-3xl").toBe(await tam(p, "#s3xl"));
  expect(parseFloat(valor), "o número maior que o rótulo").toBeGreaterThan(parseFloat(rotulo));
  expect(await tam(p, "#kpi > small"), "a tendência com o --text-sm").toBe(await tam(p, "#ssm"));
  expect(await p.locator("#kpi > strong").evaluate((e) => getComputedStyle(e).fontVariantNumeric)).toBe("tabular-nums");
});

test("Chart · sem pedido, o texto continua no --text-xs; com --chart-text, segue o pedido", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, GRAFICO("") + `<div id="maior">${GRAFICO("--chart-text:var(--text-base)").replace(/id="eixo"/, 'id="eixo2"').replace(/id="legenda"/, 'id="legenda2"')}</div>`);
  expect(await tam(p, "#eixo")).toBe(await tam(p, "#sxs"));
  expect(await tam(p, "#legenda")).toBe(await tam(p, "#sxs"));
  expect(await tam(p, "#eixo2"), "o eixo segue o --chart-text").toBe(await tam(p, "#sbase"));
  expect(await tam(p, "#legenda2"), "a legenda segue o --chart-text").toBe(await tam(p, "#sbase"));
});
