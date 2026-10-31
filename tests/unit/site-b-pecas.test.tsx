// O SITE B (31/10/2026) · as cinco mudanças de peça que a página Introduction pediu, aprovadas pelo Victor ("pode"):
//   1. o `AppShell` aceita a pílula (`topbarVariant="pill"`) e repassa `topbarBlurred`;
//   2. o `Header` `pill` com `maxWidth` é a cápsula da largura do bloco, e o `blurred` vale na `pill`;
//   3. o `TableOfContents` ganha o anel de leitura (`progress`) e o item atual na cápsula (`indicator="segment"`);
//   4. o grupo que dobra da `Sidebar` tem a lista marcada (`sidebar-group-list`) e abre e fecha também sem React;
//   5. o `Accordion` com o "+" numa bolinha (`indicator="plus"`) e a linha de 60 (`size="lg"`).
// O que o React desenha e o que o `aurea.js` faz; as medidas (a pílula a 14 do alto, as colunas a 28, o índice de 236, a
// pergunta de 60) são do `tests/visual/site-b-pecas.spec.ts`.
// Provado contra o defeito: com as peças da 0.51.0, o tipo do `AppShell` recusava a `pill` e o shell não marcava o
// arranjo; o `blurred` só valia na `flush`; o `TableOfContents` não tinha anel nem `toc-segment`; a lista do grupo não
// tinha classe e o `aurea.js` não abria o grupo; o `Accordion` ignorava `indicator` e `size` — reprovam todos.
import {render} from "@testing-library/react";
import {readFileSync} from "node:fs";
import {afterEach, describe, expect, it, vi} from "vitest";
import * as React from "react";
import {Accordion, AppShell, AureaProvider, Header, Sidebar, TableOfContents} from "../../packages/react/src/index";

function janela(largura: number) {
  vi.stubGlobal("matchMedia", (q: string) => {
    const min = /min-width:\s*(\d+)px/.exec(q), max = /max-width:\s*(\d+)px/.exec(q);
    const casa = (!min || largura >= +min[1]) && (!max || largura <= +max[1]);
    return {matches: casa, media: q, addEventListener: () => {}, removeEventListener: () => {}};
  });
}
afterEach(() => { vi.unstubAllGlobals(); });
const comProvedor = (ui: React.ReactNode) => render(<AureaProvider>{ui}</AureaProvider>);

describe("1 · o AppShell com a pílula", () => {
  it("`topbarVariant=\"pill\"` marca o shell e a barra é a cápsula contida", () => {
    janela(1440);
    const {container} = comProvedor(<AppShell brand={<strong>Acme</strong>} layout="docs" topbarVariant="pill" aside={<p>Índice</p>}>conteúdo</AppShell>);
    const shell = container.querySelector(".app-shell")!;
    expect(shell).toHaveClass("app-shell-pill");
    const barra = shell.querySelector(":scope > header.topbar")!;
    expect(barra).toHaveClass("topbar-pill", "topbar-contained");
    expect(barra, "a pílula não é a barra pequena do arranjo").not.toHaveClass("topbar-sm");
    expect(barra.querySelector(":scope > .topbar-inner")).toHaveClass("container-docs");
  });

  it("fora do arranjo de documentação, a pílula vai de ponta a ponta (`maxWidth=\"full\"`)", () => {
    janela(1440);
    const {container} = comProvedor(<AppShell brand={<strong>Acme</strong>} topbarVariant="pill">conteúdo</AppShell>);
    expect(container.querySelector(".app-shell > header.topbar > .topbar-inner")).toHaveClass("container-full");
  });

  it("`topbarBlurred` chega ao `Header`; sem ele, a barra não embaça", () => {
    janela(1440);
    const com = comProvedor(<AppShell brand={<strong>Acme</strong>} layout="docs" topbarVariant="pill" topbarBlurred>x</AppShell>);
    expect(com.container.querySelector("header.topbar")).toHaveClass("topbar-blurred");
    com.unmount();
    const sem = comProvedor(<AppShell brand={<strong>Acme</strong>} layout="docs" topbarVariant="pill">x</AppShell>);
    expect(sem.container.querySelector("header.topbar")).not.toHaveClass("topbar-blurred");
  });
});

describe("2 · o Header pill", () => {
  it("o `blurred` vale na `pill` (e continua valendo na `flush`, e não na `floating`)", () => {
    const {container} = render(<>
      <Header variant="pill" blurred maxWidth="full" brand={<strong>A</strong>} data-v="pill" />
      <Header variant="flush" blurred brand={<strong>B</strong>} data-v="flush" />
      <Header variant="floating" blurred brand={<strong>C</strong>} data-v="floating" />
    </>);
    expect(container.querySelector('[data-v="pill"]')).toHaveClass("topbar-blurred", "topbar-contained");
    expect(container.querySelector('[data-v="flush"]')).toHaveClass("topbar-blurred");
    expect(container.querySelector('[data-v="floating"]')).not.toHaveClass("topbar-blurred");
  });
});

const SECOES = [{id: "a", label: "Primeira"}, {id: "b", label: "Segunda"}];
describe("3 · o TableOfContents com o anel e a cápsula", () => {
  it("`progress`: o anel e o número na linha do nome, fora do leitor de tela; a linha é um <div>", () => {
    const {container} = comProvedor(<TableOfContents items={SECOES} current="a" progress />);
    const nome = container.querySelector(".toc-label")!;
    expect(nome.tagName, "um <div> dentro de <p> quebra a linha").toBe("DIV");
    expect(nome).toHaveClass("toc-label-progress");
    expect(nome.querySelector(".toc-progress[aria-hidden=\"true\"] [role=\"progressbar\"]")).not.toBeNull();
    expect(nome.querySelector(".toc-progress-value[aria-hidden=\"true\"]")).toHaveTextContent(/^\d+%$/);
    expect(nome.querySelector(".toc-label-icon"), "o anel fica no lugar do ícone").toBeNull();
  });

  it("sem `progress`, a linha de sempre: o <p> com o ícone", () => {
    const {container} = comProvedor(<TableOfContents items={SECOES} current="a" />);
    const nome = container.querySelector(".toc-label")!;
    expect(nome.tagName).toBe("P");
    expect(nome.querySelector(".toc-label-icon")).not.toBeNull();
    expect(container.querySelector(".toc")).not.toHaveClass("toc-segment");
  });

  it("`indicator=\"segment\"` marca o índice; o atual continua com `aria-current`", () => {
    const {container} = comProvedor(<TableOfContents items={SECOES} current="b" indicator="segment" />);
    expect(container.querySelector(".toc")).toHaveClass("toc-segment");
    expect(container.querySelector('a[aria-current="true"]')).toHaveTextContent("Segunda");
  });

});

describe("4 · o grupo que dobra da Sidebar", () => {
  const ITENS = [{id: "g", label: "Overview", collapsible: true, items: [{id: "i", label: "Introduction", href: "#i"}]}];
  it("a lista do grupo leva a classe `sidebar-group-list` (a do recuo)", () => {
    const {container} = comProvedor(<Sidebar items={ITENS as never} label="Contents" />);
    const botao = container.querySelector(".sidebar-group-toggle")!;
    const lista = document.getElementById(botao.getAttribute("aria-controls")!)!;
    expect(lista).toHaveClass("sidebar-group-list");
  });

});

describe("5 · o Accordion com o \"+\" e a linha de 60", () => {
  const ITENS = [{id: "a", title: "Is Aurea free?", content: "Yes."}];
  it("`indicator=\"plus\"` e `size=\"lg\"` marcam o acordeão", () => {
    const {container} = render(<Accordion variant="surface" indicator="plus" size="lg" items={ITENS} />);
    expect(container.querySelector(".accordion")).toHaveClass("accordion-surface", "accordion-plus", "accordion-lg");
  });
  it("sem eles, o de sempre: a setinha e a linha média", () => {
    const {container} = render(<Accordion items={ITENS} />);
    const a = container.querySelector(".accordion")!;
    expect(a).not.toHaveClass("accordion-plus");
    expect(a).not.toHaveClass("accordion-lg");
  });
});

// O `aurea.js` se registra UMA vez por página (o clique é delegado no `document`): rodá-lo duas vezes no mesmo documento
// abriria e fecharia o grupo no mesmo clique. Por isso um teste só, com o índice e o grupo na mesma página.
describe("3 e 4 no HTML puro · o aurea.js", () => {
  it("escreve quanto da página rolou, e abre e fecha o grupo virando a seta", () => {
    document.body.innerHTML = `<nav class="toc"><div class="toc-label toc-label-progress"><span class="toc-progress">
      <div role="progressbar" class="progress-circle" aria-valuenow="0"><svg><circle class="progress-circle-fill" stroke-dashoffset="100"/></svg></div>
      </span>On this page<span class="toc-progress-value">0%</span></div><a href="#x">X</a></nav><section id="x"></section>
      <button type="button" class="sidebar-group-toggle" aria-expanded="true" aria-controls="lista">
      <span>Overview</span><svg class="sidebar-group-caret"><use href="#i-caret-down"></use></svg></button>
      <div id="lista" class="sidebar-group-list"><a href="#i">Introduction</a></div>`;
    Object.defineProperty(document.documentElement, "scrollHeight", {configurable: true, value: 3000});
    Object.defineProperty(window, "innerHeight", {configurable: true, value: 1000});
    Object.defineProperty(window, "scrollY", {configurable: true, writable: true, value: 500});
    new Function(readFileSync("packages/core/src/aurea.js", "utf8"))();
    expect(document.querySelector(".toc-progress-value")).toHaveTextContent("25%");
    (window as unknown as {scrollY: number}).scrollY = 1500;
    window.dispatchEvent(new Event("scroll"));
    expect(document.querySelector(".toc-progress-value")).toHaveTextContent("75%");
    expect(document.querySelector("[role=\"progressbar\"]")).toHaveAttribute("aria-valuenow", "75");
    expect(document.querySelector(".progress-circle-fill")).toHaveAttribute("stroke-dashoffset", "25");

    const botao = document.querySelector<HTMLButtonElement>(".sidebar-group-toggle")!;
    const lista = document.getElementById("lista")!;
    botao.click();
    expect(botao).toHaveAttribute("aria-expanded", "false");
    expect(lista.hidden).toBe(true);
    expect(botao.querySelector("use")).toHaveAttribute("href", "#i-caret-right");
    botao.click();
    expect(botao).toHaveAttribute("aria-expanded", "true");
    expect(lista.hidden).toBe(false);
    expect(botao.querySelector("use")).toHaveAttribute("href", "#i-caret-down");
    document.body.innerHTML = "";
  });
});
