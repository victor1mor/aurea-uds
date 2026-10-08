// GAR-11, GAR-12 e GAR-13 (08/10/2026) · a ficha técnica agrupada e a tabela de COMPARAÇÃO, como
// variações de peças que já existem (regra do Victor: peça nova entra como variação).
//   GAR-11: nenhum código novo — é o padrão `Card` + `DataList` do catálogo (decisão do Victor).
//   GAR-12 e GAR-13: a `Table` ganhou quatro chaves — `stickyHeader`, `stickyFirstColumn`, `fit` e
//           `differencesOnly` — e a pele do HTML de comparação (`th scope="row"`, `th
//           scope="rowgroup"`, `td data-best`, `tr data-same`), medida no
//           `tests/visual/tabela-gar12-13.spec.ts`.
// O que se cobra aqui: o que o React emite. Provado contra o defeito: na 0.23.0 a `Table` não
// conhece as chaves — elas caem na `<table>` como atributos soltos e nenhuma classe aparece.
import {render} from "@testing-library/react";
import {renderToStaticMarkup} from "react-dom/server";
import {describe, expect, test} from "vitest";
import {AureaProvider, Table} from "../../packages/react/src/index";

const wrap = (ui: React.ReactNode) => render(<AureaProvider>{ui}</AureaProvider>);

describe("GAR-12 · a Table sem as chaves novas continua igual", () => {
  // A marcação da 0.23.0, escrita aqui de propósito: quem já usa não pode ver diferença nenhuma.
  test("a marcação é a de antes, caractere por caractere", () => {
    const antes = '<div class="table-region" role="region" aria-label="Membros" tabindex="0">'
      + '<table class="table"><caption>Membros</caption><tbody><tr><td>x</td></tr></tbody></table></div>';
    expect(renderToStaticMarkup(<Table caption="Membros"><tbody><tr><td>x</td></tr></tbody></Table>)).toBe(antes);
  });
});

describe("GAR-12 e GAR-13 · as quatro chaves", () => {
  test("stickyHeader e stickyFirstColumn vão na caixa que rola", () => {
    const {container} = wrap(<Table caption="C" stickyHeader stickyFirstColumn><tbody /></Table>);
    const caixa = container.querySelector(".table-region")!;
    expect(caixa).toHaveClass("table-sticky-header");
    expect(caixa).toHaveClass("table-sticky-first");
    expect(container.querySelector("table")!.className).toBe("table");
  });
  test("cada chave liga só a sua", () => {
    const so = (el: HTMLElement) => ({caixa: el.querySelector(".table-region")!.className, tabela: el.querySelector("table")!.className});
    expect(so(wrap(<Table stickyHeader><tbody /></Table>).container)).toEqual({caixa: "table-region table-sticky-header", tabela: "table"});
    expect(so(wrap(<Table stickyFirstColumn><tbody /></Table>).container)).toEqual({caixa: "table-region table-sticky-first", tabela: "table"});
    expect(so(wrap(<Table fit><tbody /></Table>).container)).toEqual({caixa: "table-region", tabela: "table table-fit"});
    expect(so(wrap(<Table differencesOnly><tbody /></Table>).container)).toEqual({caixa: "table-region", tabela: "table table-differences-only"});
  });
  test("as chaves não vazam para a <table> como atributo", () => {
    const html = renderToStaticMarkup(<Table stickyHeader stickyFirstColumn fit differencesOnly><tbody /></Table>);
    expect(html.toLowerCase()).not.toMatch(/stickyheader|stickyfirstcolumn|differencesonly|\sfit=/);
  });
  test("className continua na <table>, junto com as classes das chaves", () => {
    const {container} = wrap(<Table fit className="minha"><tbody /></Table>);
    expect(container.querySelector("table")!.className).toBe("table table-fit minha");
  });
});
