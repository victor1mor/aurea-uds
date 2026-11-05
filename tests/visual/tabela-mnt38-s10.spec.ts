import {test, expect, type Page} from "@playwright/test";
import {createElement as h} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import * as A from "../../packages/react/dist/index.js";
import {DataGrid} from "../../packages/react/dist/data-grid.js";

// MNT-38 e S-10 (05/11/2026), medidos no navegador na tela do Victor (1280 × 663):
//   • MNT-38 (`dividers`): a borda de baixo das fileiras do corpo ganha cor — a linha clara, o texto a 10% —, menos a
//     última; sem a prop, nenhuma linha (ADR-0072); na Ember, nenhuma (*"Pode, sem a Ember"*); a altura da fileira não muda.
//   • S-10 (`stickyHeader="page"`): a caixa não rola de cima para baixo (uma rolagem só, a da página); rolando a página, o
//     cabeçalho encosta embaixo da barra do `AppShell`; no fim da página, para acima da última fileira.
// Provado contra o defeito: com o core e a `DataGrid` da 0.55.0, as fileiras não têm linha com `dividers` (a classe nem
// existia), e com `stickyHeader="page"` a caixa tinha teto de 60vh e rolagem própria (o cabeçalho preso no topo DELA, a
// 345 da tela depois de rolar 600, e não a 56).
const APP = process.env.AUREA_TABELAS ?? "/apps/keyboard-probe/out/tabelas.html";

const linhas = ["a", "b", "c"].map((n) => h("tr", {key: n}, h("td", null, n), h("td", null, "1")));
const tabela = (props: Record<string, unknown>) => h(A.Table, {caption: "T", ...props}, h("thead", null, h("tr", null, h("th", null, "N"), h("th", null, "V"))), h("tbody", null, ...linhas));

async function abrirEstatico(p: Page, baseURL: string | undefined, nome: string, corpo: string, marca = "") {
  const url = `${baseURL}/__mnt38-${nome}`;
  await p.setViewportSize({width: 1280, height: 663});
  await p.route(url, (r) => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="light"${marca ? ` data-brand="${marca}"` : ""}><head><meta charset="utf-8">
      <link rel="stylesheet" href="/packages/fonts/dist/fonts.css"><link rel="stylesheet" href="/packages/core/dist/aurea.css"></head>
      <body style="margin:0;padding:24px">${corpo}</body></html>`}));
  await p.goto(url, {waitUntil: "networkidle"});
}
/** A borda de baixo de cada fileira do corpo: [alfa da cor, espessura, altura da fileira]. */
const bordas = (p: Page) => p.evaluate(() => [...document.querySelectorAll("tbody tr")].map((tr) => {
  const td = tr.querySelector("td")!; const s = getComputedStyle(td);
  const cv = document.createElement("canvas").getContext("2d")!; cv.fillStyle = s.borderBottomColor; cv.fillRect(0, 0, 1, 1);
  // A linha só existe com espessura E cor: a última fileira tem `border-bottom:0`, e a cor dela é a do texto.
  return {alfa: parseFloat(s.borderBottomWidth) ? cv.getImageData(0, 0, 1, 1).data[3] : 0, largura: parseFloat(s.borderBottomWidth), altura: Math.round(tr.getBoundingClientRect().height)};
}));

test("MNT-38 · Table `dividers`: a linha clara entre as fileiras, menos depois da última", async ({page: p, baseURL}) => {
  await abrirEstatico(p, baseURL, "table", renderToStaticMarkup(h("div", null, h("div", {id: "sem"}, tabela({})), h("div", {id: "com"}, tabela({dividers: true})))));
  const [semLinha, comLinha] = await Promise.all(["#sem", "#com"].map((sel) => p.evaluate((s) => [...document.querySelectorAll(`${s} tbody tr`)].map((tr) => {
    const c = getComputedStyle(tr.querySelector("td")!); const cv = document.createElement("canvas").getContext("2d")!;
    cv.fillStyle = c.borderBottomColor; cv.fillRect(0, 0, 1, 1);
    return {alfa: parseFloat(c.borderBottomWidth) ? cv.getImageData(0, 0, 1, 1).data[3] : 0, largura: parseFloat(c.borderBottomWidth), altura: Math.round(tr.getBoundingClientRect().height)};
  }), sel)));
  expect(semLinha.every((b) => b.alfa === 0), JSON.stringify(semLinha)).toBe(true);
  expect(comLinha.slice(0, -1).every((b) => b.alfa > 0 && b.largura > 0), JSON.stringify(comLinha)).toBe(true);
  expect(comLinha.at(-1)!.alfa, "depois da última, nada").toBe(0);
  // A linha clara: o texto a 10% (alfa ≈ 26 de 255), não uma linha forte.
  expect(comLinha[0].alfa).toBeLessThan(40);
  expect(comLinha.map((b) => b.altura), "nenhuma medida muda").toEqual(semLinha.map((b) => b.altura));
});

test("MNT-38 · Table `dividers` na Ember: nenhuma linha", async ({page: p, baseURL}) => {
  await abrirEstatico(p, baseURL, "ember", renderToStaticMarkup(tabela({dividers: true})), "ember");
  const b = await bordas(p);
  expect(b.every((x) => x.alfa === 0), JSON.stringify(b)).toBe(true);
});

test("MNT-38 · DataGrid `dividers`: a mesma linha", async ({page: p, baseURL}) => {
  const grade = (dividers: boolean) => h(DataGrid, {label: "G", dividers, data: [{n: "a"}, {n: "b"}, {n: "c"}], columns: [{accessorKey: "n", header: "N"}]});
  await abrirEstatico(p, baseURL, "grade", renderToStaticMarkup(h(A.AureaProvider, null, grade(false), grade(true))));
  const grades = await p.evaluate(() => [...document.querySelectorAll(".datagrid")].map((g) => ({
    dividers: g.classList.contains("datagrid-dividers"),
    alfas: [...g.querySelectorAll("tbody tr")].map((tr) => { const c = getComputedStyle(tr.querySelector("td")!);
      const cv = document.createElement("canvas").getContext("2d")!; cv.fillStyle = c.borderBottomColor; cv.fillRect(0, 0, 1, 1);
      return parseFloat(c.borderBottomWidth) ? cv.getImageData(0, 0, 1, 1).data[3] : 0; }),
  })));
  expect(grades.map((g) => g.dividers)).toEqual([false, true]);
  expect(grades[0].alfas.every((a) => a === 0), JSON.stringify(grades)).toBe(true);
  expect(grades[1].alfas.slice(0, -1).every((a) => a > 0) && grades[1].alfas.at(-1) === 0, JSON.stringify(grades)).toBe(true);
});

const cabecalho = (p: Page) => p.evaluate(() => {
  const caixa = document.querySelector<HTMLElement>(".table-wrap")!; const th = caixa.querySelector("thead th")!.getBoundingClientRect();
  const ultima = caixa.querySelector("tbody tr:last-child")!.getBoundingClientRect();
  return {th: Math.round(th.top), fundoTh: Math.round(th.bottom), ultima: Math.round(ultima.top), barra: Math.round(document.querySelector(".app-shell .topbar")!.getBoundingClientRect().bottom),
    rolaPorDentro: caixa.scrollHeight > caixa.clientHeight + 1};
});

test("S-10 · `stickyHeader=\"page\"`: uma rolagem só, e o cabeçalho embaixo da barra", async ({page: p}) => {
  await p.setViewportSize({width: 1280, height: 663});
  await p.goto(`${APP}?caso=preso&forma=proposta`, {waitUntil: "networkidle"});
  expect((await cabecalho(p)).rolaPorDentro, "a caixa não rola por dentro").toBe(false);
  await p.evaluate(() => scrollTo(0, 600));
  await p.waitForFunction(() => document.querySelector<HTMLElement>("thead th")!.style.translate !== "");
  const meio = await cabecalho(p);
  expect(meio.th, JSON.stringify(meio)).toBe(meio.barra);
  // No fim da página, o cabeçalho para acima da última fileira — não a cobre.
  await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await p.waitForTimeout(100);
  const fim = await cabecalho(p);
  expect(fim.fundoTh, JSON.stringify(fim)).toBeLessThanOrEqual(fim.ultima);
  // E voltando ao topo, ele volta ao lugar dele.
  await p.evaluate(() => scrollTo(0, 0));
  await p.waitForFunction(() => document.querySelector<HTMLElement>("thead th")!.style.translate === "");
});

test("S-10 · o `stickyHeader` de sempre continua a caixa com teto", async ({page: p}) => {
  await p.setViewportSize({width: 1280, height: 663});
  await p.goto(`${APP}?caso=preso&forma=hoje`, {waitUntil: "networkidle"});
  expect((await cabecalho(p)).rolaPorDentro).toBe(true);
});
