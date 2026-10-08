import {test, expect, type Page} from "@playwright/test";
import {createElement as h} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import * as A from "../../packages/react/dist/index.js";

// GAR-12 e GAR-13 (08/10/2026) · a tabela de COMPARAÇÃO, medida no navegador, nos três motores. É a
// `Table` com quatro chaves (escolha do Victor: *"uma chave para cada coisa"*) e a pele do HTML de
// comparação. O que se cobra:
//   • `stickyFirstColumn`: ao rolar a caixa de lado, a primeira coluna fica parada e o resto anda,
//     com um fio no fim dela; o fundo dela é opaco (o que rola passa por baixo);
//   • `stickyHeader`: ao rolar a caixa para baixo, o cabeçalho fica no topo DELA, que tem o teto
//     `--table-max-h`; com as duas chaves, o canto fica por cima dos dois;
//   • `fit`: dois itens cabem em 360 sem rolar de lado (sem `fit`, rola — o de antes);
//   • `differencesOnly`: as linhas `data-same` somem, as outras ficam;
//   • o melhor valor (`data-best`) em negrito; o nome da linha (`th scope="row"`) como texto de
//     corpo; a faixa de grupo (`th scope="rowgroup"`) com a pele do cabeçalho.
// Provado contra o defeito: com a `Table` e o CSS da 0.23.0 as chaves não existem — nenhuma classe
// aparece, nada gruda, `fit` não tira o mínimo de 720, e as linhas iguais continuam na tela.
const ITENS = ["Alfa", "Beta", "Gama", "Delta"];
const GRUPOS: Array<{nome: string; linhas: Array<[string, string[], number | null]>}> = [
  {nome: "Motor", linhas: [["Potência", ["120 cv", "150 cv", "110 cv", "130 cv"], 1], ["Torque", ["16 kgfm", "19 kgfm", "15 kgfm", "17 kgfm"], 1], ["Combustível", ["Flex", "Flex", "Flex", "Flex"], -1]]},
  {nome: "Freios", linhas: [["Dianteiro", ["Disco", "Disco", "Disco", "Disco"], -1], ["Traseiro", ["Tambor", "Disco", "Tambor", "Disco"], null]]},
];
// -1 marca a linha igual em todos (`data-same`); um índice marca a célula do melhor (`data-best`).
function tabela(props: Record<string, unknown>, n = 4) {
  const cols = ITENS.slice(0, n);
  return h(A.Table, {caption: "Comparação", ...props},
    h("thead", null, h("tr", null, h("th", {scope: "col"}, "Item"), ...cols.map((c) => h("th", {scope: "col", key: c}, c)))),
    ...GRUPOS.map((g) => h("tbody", {key: g.nome},
      h("tr", null, h("th", {scope: "rowgroup", colSpan: n + 1}, g.nome)),
      ...g.linhas.map(([nome, vals, melhor]) => h("tr", {key: nome, "data-same": melhor === -1 ? "" : undefined},
        h("th", {scope: "row"}, nome),
        ...vals.slice(0, n).map((v, i) => h("td", {key: i, "data-best": melhor === i ? "" : undefined}, v)))))));
}

async function abrir(p: Page, baseURL: string | undefined, largura: number, el: ReturnType<typeof h>) {
  await p.setViewportSize({width: largura, height: 700});
  const url = `${baseURL}/__tabela-gar12-13`;
  const corpo = renderToStaticMarkup(el);
  await p.route(url, (r) => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
      <link rel="stylesheet" href="/packages/core/dist/aurea.css"></head><body style="margin:0;padding:16px">${corpo}<div style="height:1500px"></div></body></html>`}));
  await p.goto(url, {waitUntil: "networkidle"});
}

test("GAR-12 · a primeira coluna fica parada ao rolar de lado, com fio e fundo opaco", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, 360, tabela({stickyFirstColumn: true}));
  const m = await p.evaluate(() => {
    const reg = document.querySelector(".table-region")!;
    const x0 = reg.getBoundingClientRect().left + reg.clientLeft;
    const nome = document.querySelector('tbody th[scope="row"]')!;
    const outra = document.querySelector("tbody td")!;
    const antes = {nome: nome.getBoundingClientRect().left, outra: outra.getBoundingClientRect().left};
    reg.scrollLeft = 150;
    const fio = getComputedStyle(nome, "::after");
    return {rola: reg.scrollWidth > reg.clientWidth, nomeAntes: antes.nome - x0, nomeDepois: nome.getBoundingClientRect().left - x0,
      outraAndou: antes.outra - outra.getBoundingClientRect().left, fio: fio.content !== "none" ? fio.width : null,
      fundoNome: getComputedStyle(nome).backgroundColor, fundoCaixa: getComputedStyle(reg).backgroundColor};
  });
  expect(m.rola, "a 360, os quatro itens rolam de lado").toBe(true);
  expect(Math.round(m.nomeDepois)).toBe(Math.round(m.nomeAntes));
  expect(Math.round(m.outraAndou)).toBe(150);
  expect(m.fio).toBe("1px");
  expect(m.fundoNome, "fundo opaco, o de cartão: o que rola passa por baixo").toBe(m.fundoCaixa);
});

test("GAR-13 · o cabeçalho fica no topo da caixa, e o canto por cima dos dois", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, 360, h("div", {style: {"--table-max-h": "180px"}}, tabela({stickyHeader: true, stickyFirstColumn: true})));
  const m = await p.evaluate(async () => {
    const reg = document.querySelector(".table-region")!;
    const y0 = reg.getBoundingClientRect().top + reg.clientTop;
    const x0 = reg.getBoundingClientRect().left + reg.clientLeft;
    reg.scrollTop = 200; reg.scrollLeft = 120;
    await new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
    const ths = document.querySelectorAll("thead th");
    const canto = ths[0].getBoundingClientRect(); const outro = ths[2].getBoundingClientRect();
    // O MEIO do canto, e não a ponta: a caixa tem o raio de cartão e recorta o conteúdo na curva;
    // ali o Firefox devolve a própria caixa (medido em 08/10/2026), e isso não é o canto por baixo.
    const noMeio = document.elementFromPoint(canto.left + canto.width / 2, canto.top + canto.height / 2);
    return {altura: reg.getBoundingClientRect().height, cantoTopo: canto.top - y0, cantoEsq: canto.left - x0, outroTopo: outro.top - y0,
      cantoPorCima: noMeio?.closest("thead th") === ths[0]};
  });
  expect(Math.round(m.altura), "a caixa tem o teto do --table-max-h").toBe(180);
  expect(Math.round(m.cantoTopo)).toBe(0);
  expect(Math.round(m.outroTopo)).toBe(0);
  expect(Math.round(m.cantoEsq)).toBe(0);
  expect(m.cantoPorCima).toBe(true);
});

test("GAR-12 · com fit, dois itens cabem em 360 sem rolar de lado; sem fit, rola como antes", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, 360, tabela({fit: true}, 2));
  const comFit = await p.evaluate(() => { const r = document.querySelector(".table-region")!; return r.scrollWidth > r.clientWidth; });
  expect(comFit).toBe(false);
  await abrir(p, baseURL, 360, tabela({}, 2));
  const semFit = await p.evaluate(() => { const r = document.querySelector(".table-region")!; return r.scrollWidth > r.clientWidth; });
  expect(semFit, "sem fit, o mínimo de 720 continua").toBe(true);
});

test("GAR-12 · só diferenças, melhor valor, nome da linha e faixa de grupo", async ({page: p, baseURL}) => {
  await abrir(p, baseURL, 1280, tabela({differencesOnly: true}));
  const m = await p.evaluate(() => {
    const vis = (e: Element) => e.getClientRects().length > 0;
    const iguais = [...document.querySelectorAll("tr[data-same]")];
    const css = (s: string) => getComputedStyle(document.querySelector(s)!);
    return {iguais: iguais.length, iguaisVisiveis: iguais.filter(vis).length,
      outrasVisiveis: [...document.querySelectorAll("tbody tr:not([data-same])")].every(vis),
      pesoMelhor: css("td[data-best]").fontWeight, pesoComum: css("td:not([data-best])").fontWeight,
      nome: {caixa: css('tbody th[scope="row"]').textTransform, peso: css('tbody th[scope="row"]').fontWeight, cor: css('tbody th[scope="row"]').color},
      corTexto: css("td").color,
      faixa: {caixa: css('th[scope="rowgroup"]').textTransform, fundo: css('th[scope="rowgroup"]').backgroundColor},
      fundoCabecalho: css("thead th").backgroundColor};
  });
  expect(m.iguais).toBe(2);
  expect(m.iguaisVisiveis, "as linhas iguais somem").toBe(0);
  expect(m.outrasVisiveis).toBe(true);
  expect(m.pesoMelhor).toBe("600");
  expect(m.pesoComum).toBe("400");
  expect(m.nome).toEqual({caixa: "none", peso: "500", cor: m.corTexto});
  expect(m.faixa).toEqual({caixa: "uppercase", fundo: m.fundoCabecalho});
});
