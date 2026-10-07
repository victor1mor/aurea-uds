import {test, expect} from "@playwright/test";
import {createElement as h} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import * as A from "../../packages/react/dist/index.js";

// GAR-05 (06/10/2026) · uma faixa escura dentro de uma página clara. O `aurea.css` tinha 22
// seletores `[data-theme="light"] X`, que continuavam valendo dentro de `<section
// data-theme="dark">`: o botão de contorno, o rótulo de seção (`eyebrow`) e o escolhido saíam com a
// tinta escurecida do claro sobre o fundo escuro, e o campo com a seta e o `color-scheme` do claro.
//
// A mesma amostra é medida em quatro lugares, e a regra é de igualdade:
//   faixa escura dentro da página clara  ==  página escura
//   ilha clara dentro dessa faixa         ==  página clara
// Provado contra o defeito: sem a guarda nas regras de tema claro, a faixa escura mede igual à
// página CLARA, e o teste reprova.
const AMOSTRA = renderToStaticMarkup(h("div", {className: "amostra"},
  h("span", {className: "eyebrow"}, "Novidades"),
  h(A.Button, {variant: "primary-outline"}, "Ver ficha"),
  h(A.Button, {appearance: "ghost", tone: "danger"} as never, "Remover"),
  h("button", {type: "button", className: "btn", "aria-pressed": "true"}, "Ligado"),
  h("select", {className: "select", "aria-label": "Ano"}, h("option", null, "2026")),
  h("input", {className: "input", "aria-label": "Modelo"})));

const medirAmostra = (raiz: Element) => {
  const est = (sel: string) => getComputedStyle(raiz.querySelector(sel)!);
  const botoes = [...raiz.querySelectorAll("button")].map((b) => {
    const e = getComputedStyle(b);
    return `${e.color} ${e.borderTopColor}`;
  });
  return {eyebrow: est(".eyebrow").color, botoes, seta: est(".select").backgroundImage,
    esquema: est(".input").colorScheme};
};

test("faixa escura dentro de página clara mede igual à página escura, e a ilha clara igual à clara", async ({page: p, baseURL}) => {
  const secao = (theme: string, dentro: string) =>
    renderToStaticMarkup(h(A.Section, {theme} as never, h("div", {dangerouslySetInnerHTML: {__html: dentro}})));
  // ⚠ As duas REFERÊNCIAS são documentos próprios, com o tema no `<html>`. A primeira versão deste
  // teste pôs a página escura num `div` dentro da página clara — e ela vazava igual à faixa, as
  // duas batiam, e o teste passava com o defeito dentro. A prova contra o defeito foi o que pegou.
  const abrir = async (nome: string, tema: string, corpo: string) => {
    const url = `${baseURL}/__tema-na-secao-${nome}`;
    await p.route(url, r => r.fulfill({contentType: "text/html; charset=utf-8",
      body: `<!doctype html><html data-theme="${tema}"><head>
        <link rel="stylesheet" href="/packages/core/dist/aurea.css"></head><body>${corpo}</body></html>`}));
    await p.goto(url, {waitUntil: "networkidle"});
  };
  const medirAqui = (ids: string[]) => p.evaluate(({fn, ids}) => {
    const medir = new Function(`return (${fn})`)() as (r: Element) => unknown;
    return ids.map((id) => medir(document.querySelector(`#${id} .amostra`)!));
  }, {fn: medirAmostra.toString(), ids});

  await abrir("escura", "dark", `<div id="pagina-escura">${AMOSTRA}</div>`);
  const [escura] = await medirAqui(["pagina-escura"]);
  await abrir("clara", "light", `<div id="pagina-clara">${AMOSTRA}</div>
    <div id="faixa-escura">${secao("dark", AMOSTRA + `<div id="ilha-clara">${secao("light", AMOSTRA)}</div>`)}</div>`);
  const [clara, faixa, ilha] = await medirAqui(["pagina-clara", "faixa-escura", "ilha-clara"]);
  const m = {clara, escura, faixa, ilha};
  // A entrada exercita o código: claro e escuro TÊM de medir diferente, senão a igualdade
  // abaixo passaria por vacuidade.
  expect(m.clara).not.toEqual(m.escura);
  expect(m.faixa, "a faixa escura dentro da página clara").toEqual(m.escura);
  expect(m.ilha, "a ilha clara dentro da faixa escura").toEqual(m.clara);
});

// A seção pinta o próprio fundo com os tokens do próprio tema.
test("a Section com tema pinta o fundo e a letra do tema dela", async ({page: p, baseURL}) => {
  const url = `${baseURL}/__tema-na-secao-fundo`;
  await p.route(url, r => r.fulfill({contentType: "text/html; charset=utf-8",
    body: `<!doctype html><html data-theme="light"><head>
      <link rel="stylesheet" href="/packages/core/dist/aurea.css"></head><body>
      <div id="ref" data-theme="dark" style="background:var(--background);color:var(--foreground)">x</div>
      ${renderToStaticMarkup(h(A.Section, {id: "faixa", theme: "dark"} as never, "y"))}
      </body></html>`}));
  await p.goto(url, {waitUntil: "networkidle"});
  const [ref, faixa] = await p.$$eval("#ref, #faixa", (els) => els.map((e) => {
    const s = getComputedStyle(e); return `${s.backgroundColor} ${s.color}`;
  }));
  expect(faixa).toBe(ref);
});
