// MNT-38 e S-10 (05/11/2026) · a linha entre as fileiras (`dividers`, na `Table` e na `DataGrid`) e o cabeçalho preso à
// PÁGINA (`stickyHeader="page"`, na `DataGrid`), aprovados pela bancada `apps/keyboard-probe/tabelas.html`.
// O que se cobra aqui: o que o React emite, e que quem já usa não vê diferença. A medida (a cor da linha, o cabeçalho
// embaixo da barra) é do `tests/visual/tabela-mnt38-s10.spec.ts`.
// Provado contra o defeito: na 0.55.0 a `Table` não conhecia `dividers` (caía na `<table>` como atributo solto, sem classe)
// e a `DataGrid` tratava `stickyHeader="page"` como `true` — a caixa de 60vh com rolagem própria.
import {render} from "@testing-library/react";
import {renderToStaticMarkup} from "react-dom/server";
import {describe, expect, test} from "vitest";
import {AureaProvider, Table} from "../../packages/react/src/index";
import {DataGrid} from "../../packages/react/src/data-grid";

const wrap = (ui: React.ReactNode) => render(<AureaProvider>{ui}</AureaProvider>);
const dados = [{nome: "core-sw-01"}, {nome: "core-sw-02"}];
const colunas = [{accessorKey: "nome", header: "Nome"}];

describe("MNT-38 · dividers", () => {
  test("a Table de sempre não muda, caractere por caractere", () => {
    const antes = '<div class="table-region" role="region" aria-label="Membros" tabindex="0">'
      + '<table class="table"><caption>Membros</caption><tbody><tr><td>x</td></tr></tbody></table></div>';
    expect(renderToStaticMarkup(<Table caption="Membros"><tbody><tr><td>x</td></tr></tbody></Table>)).toBe(antes);
  });
  test("na Table, a classe vai na tabela e a prop não vaza como atributo", () => {
    const {container} = wrap(<Table caption="C" dividers><tbody><tr><td>x</td></tr></tbody></Table>);
    const t = container.querySelector("table")!;
    expect(t).toHaveClass("table", "table-dividers");
    expect(t.hasAttribute("dividers")).toBe(false);
  });
  test("na DataGrid, a classe vai na raiz; sem a prop, não", () => {
    const com = wrap(<DataGrid label="D" dividers data={dados} columns={colunas} />);
    expect(com.container.querySelector(".datagrid")).toHaveClass("datagrid-dividers");
    com.unmount();
    const sem = wrap(<DataGrid label="D" data={dados} columns={colunas} />);
    expect(sem.container.querySelector(".datagrid")).not.toHaveClass("datagrid-dividers");
  });
});

describe("S-02 · fit na DataGrid", () => {
  test("a classe vai na raiz só com a prop", () => {
    const com = wrap(<DataGrid label="D" fit data={dados} columns={colunas} />);
    expect(com.container.querySelector(".datagrid")).toHaveClass("datagrid-fit");
    com.unmount();
    expect(wrap(<DataGrid label="D" data={dados} columns={colunas} />).container.querySelector(".datagrid")).not.toHaveClass("datagrid-fit");
  });
});

describe("S-10 · stickyHeader=\"page\"", () => {
  test("`page` não é a caixa com teto: sai `datagrid-sticky-page`, e não `datagrid-sticky`", () => {
    const {container} = wrap(<DataGrid label="D" stickyHeader="page" data={dados} columns={colunas} />);
    const g = container.querySelector(".datagrid")!;
    expect(g).toHaveClass("datagrid-sticky-page");
    expect(g).not.toHaveClass("datagrid-sticky");
  });
  test("o `stickyHeader` de sempre continua a caixa com teto", () => {
    const {container} = wrap(<DataGrid label="D" stickyHeader data={dados} columns={colunas} />);
    const g = container.querySelector(".datagrid")!;
    expect(g).toHaveClass("datagrid-sticky");
    expect(g).not.toHaveClass("datagrid-sticky-page");
  });
});
