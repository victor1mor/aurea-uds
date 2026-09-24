// A medição que fecha o item F11 do PLANO-1.0 — "virtualização, se e somente se medida".
//
// Existe porque o item diz, por escrito, que a virtualização "entra com o número que a
// justifica, não por hábito". Número precisa de comando atrás; este é o comando.
//
//   node scripts/measure-grid.mjs
//
// Mede três coisas por tamanho de conjunto: o custo de RENDERIZAR no servidor, o custo de
// o navegador fazer o LAYOUT do que saiu, e quantos nós de DOM isso deixa na página.
import {chromium} from "@playwright/test";
import {createElement as h} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {readFileSync} from "node:fs";
import * as A from "../packages/react/dist/index.js";
import * as A3 from "../packages/react/dist/data-grid.js";

const css = readFileSync(new URL("../packages/core/dist/aurea.css", import.meta.url), "utf8");
const COLUNAS = [
  {accessorKey: "n", header: "Name"}, {accessorKey: "v", header: "Value"},
  {accessorKey: "s", header: "Status"}, {accessorKey: "d", header: "Updated"},
];
const dados = (N) => Array.from({length: N}, (_, i) => ({n: "row " + i, v: i, s: i % 3 ? "open" : "done", d: "2026-08-08"}));

const navegador = await chromium.launch();
const pagina = await navegador.newPage();
const linhas = [];
for (const N of [100, 1000, 5000, 10000]) {
  const t0 = performance.now();
  const html = renderToStaticMarkup(h(A.AureaProvider, null, h(A3.DataGrid, {data: dados(N), columns: COLUNAS, label: "Perf"})));
  const servidor = performance.now() - t0;

  await pagina.setContent(`<style>${css}</style><div id="alvo"></div>`);
  const medido = await pagina.evaluate((markup) => {
    const alvo = document.getElementById("alvo");
    const t = performance.now();
    alvo.innerHTML = markup;
    document.body.offsetHeight; // força o layout antes de parar o cronômetro
    return {layout: performance.now() - t, nos: document.querySelectorAll("*").length};
  }, html);

  linhas.push({N, servidor: Math.round(servidor), layout: Math.round(medido.layout), nos: medido.nos, kb: Math.round(html.length / 1024)});
}
await navegador.close();

console.log("| linhas | render no servidor | layout no navegador | nós de DOM | HTML |");
console.log("|---:|---:|---:|---:|---:|");
for (const l of linhas) console.log(`| ${l.N} | ${l.servidor} ms | ${l.layout} ms | ${l.nos} | ${l.kb} KB |`);
