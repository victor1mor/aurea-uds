// C-14 (o lote 111, 26/11/2026): a `DataGrid` passou da TanStack Table 8 para a 9 (9.3.1). A aparência não muda, e o
// comportamento fica o de antes — salvo onde a 9 obriga. Cada teste abaixo fixa um ponto em que a 9, ligada do jeito
// mais curto, faria a grade mudar sem ninguém pedir. Provados contra o defeito (26/11/2026), um a um, desfazendo a
// linha que cada um cobra em `packages/react/src/data-grid.tsx`:
//   - o meio-marcado com TUDO marcado: sem o `&&!table.getIsAllRowsSelected()`, o "selecionar todos" fica marcado E
//     com o tracinho (na 9, `getIsSomeRowsSelected` quer dizer "pelo menos uma");
//   - sem `pageSize`, todas as linhas: sem o `manualPagination:true`, a 9 corta em páginas de 10 (o recurso de
//     paginação fica sempre registrado);
//   - o filtro de texto da coluna: sem o registro `filterFns`, o "auto" da coluna não acha o "contém" e nada passa.
//     (A ordem e a busca geral acham a função sozinhas na 9 — os dois testes delas passaram sem os registros —; eles
//     ficam como guarda do comportamento de antes, não como prova dos registros.)
//   - o Shift+clique: com `enableRowRangeSelection` ligado, o Shift marca a faixa inteira. Fica como na 8 por decisão
//     do Victor (26/11/2026, na bancada: "como hoje").
import {describe, test, expect, vi} from "vitest";
import {render, screen, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {AureaProvider} from "../../packages/react/src/index";
import {DataGrid, type ColumnDef, type VisibilityState} from "../../packages/react/src/data-grid";

type Agente = {id: string; nome: string; execucoes: number};
const AGENTES: Agente[] = [
  {id: "m", nome: "Messenger", execucoes: 48},
  {id: "a", nome: "Analyst", execucoes: 12},
  {id: "c", nome: "Curator", execucoes: 31},
  {id: "r", nome: "Writer", execucoes: 5},
  {id: "v", nome: "Reviewer", execucoes: 20},
];
// O app continua escrevendo `ColumnDef<Linha>`, com UM parâmetro: o conjunto de recursos da 9 já vem dentro do tipo
// da Aurea. Se o tipo exigisse o conjunto, esta linha não compilaria (a trava `exemplos-compilam` e o `tsc` pegam).
const COLUNAS: ColumnDef<Agente>[] = [
  {accessorKey: "nome", header: "Nome"},
  {accessorKey: "execucoes", header: "Execuções"},
];
const wrap = (ui: React.ReactNode) => render(<AureaProvider>{ui}</AureaProvider>);
const linhas = () => within(screen.getByRole("grid")).getAllByRole("row").slice(1);
const todas = () => screen.getByRole("checkbox", {name: "Select all rows"}) as HTMLInputElement;
const caixas = () => screen.getAllByRole("checkbox", {name: "Select row"}) as HTMLInputElement[];

// 15 s: a primeira montagem da grade importa o motor e leva mais de 5 s com a máquina carregada.
describe("DataGrid na TanStack Table 9 — o comportamento de antes", {timeout: 15000}, () => {
  test("com TODAS marcadas, o \"selecionar todos\" fica marcado e SEM o tracinho", async () => {
    const user = userEvent.setup();
    wrap(<DataGrid data={AGENTES} columns={COLUNAS} selectable getRowId={(r) => r.id} />);
    expect(todas().checked).toBe(false);
    expect(todas().indeterminate).toBe(false);

    await user.click(todas());
    expect(todas().checked).toBe(true);
    expect(todas().indeterminate).toBe(false);

    // uma só desmarcada: o tracinho volta (o meio-marcado da 0.64.0)
    await user.click(caixas()[0]);
    expect(todas().checked).toBe(false);
    expect(todas().indeterminate).toBe(true);

    // marcando a última que faltava, o tracinho sai de novo
    await user.click(caixas()[0]);
    expect(todas().checked).toBe(true);
    expect(todas().indeterminate).toBe(false);
  });

  test("com todas marcadas por fora (estado controlado), também sem o tracinho", () => {
    wrap(<DataGrid data={AGENTES} columns={COLUNAS} selectable getRowId={(r) => r.id}
      rowSelection={{m: true, a: true, c: true, r: true, v: true}} onRowSelectionChange={() => {}} />);
    expect(todas().checked).toBe(true);
    expect(todas().indeterminate).toBe(false);
  });

  test("sem `pageSize`, a grade mostra todas as linhas (a 9 não corta em 10)", () => {
    const muitas = Array.from({length: 23}, (_, i) => ({id: `x${i}`, nome: `Agent ${i}`, execucoes: i}));
    wrap(<DataGrid data={muitas} columns={COLUNAS} />);
    expect(linhas()).toHaveLength(23);
    expect(screen.queryByRole("navigation", {name: /pagination/i})).toBeNull();
  });

  test("com `pageSize`, continua cortando — e o total de páginas é o de antes", () => {
    const muitas = Array.from({length: 23}, (_, i) => ({id: `x${i}`, nome: `Agent ${i}`, execucoes: i}));
    wrap(<DataGrid data={muitas} columns={COLUNAS} pageSize={10} />);
    expect(linhas()).toHaveLength(10);
    expect(screen.getByRole("button", {name: "Page 3"})).toBeInTheDocument();
    expect(screen.queryByRole("button", {name: "Page 4"})).toBeNull();
  });

  test("a coluna de número ordena como número (o \"auto\" acha a função pelo registro)", async () => {
    const user = userEvent.setup();
    wrap(<DataGrid data={AGENTES} columns={COLUNAS} />);
    const col = () => linhas().map((l) => l.querySelectorAll("td")[1].textContent);
    // O número começa do MAIOR no primeiro clique, como na 8 (`getAutoSortDir` da 8.21.3: o que não é texto vai
    // primeiro em ordem decrescente). Como texto, seria 5, 48, 31, 20, 12.
    await user.click(screen.getByRole("button", {name: "Execuções"}));
    expect(col()).toEqual(["48", "31", "20", "12", "5"]);
    await user.click(screen.getByRole("button", {name: "Execuções"}));
    expect(col()).toEqual(["5", "12", "20", "31", "48"]);
  });

  test("a busca acha texto e número, sem diferença de maiúscula", async () => {
    const user = userEvent.setup();
    wrap(<DataGrid data={AGENTES} columns={COLUNAS} filterable />);
    const busca = screen.getByRole("searchbox", {name: "Filter"});
    await user.type(busca, "WRIT");
    expect(linhas()).toHaveLength(1);
    expect(linhas()[0]).toHaveTextContent("Writer");
    await user.clear(busca);
    await user.type(busca, "48");
    expect(linhas()).toHaveLength(1);
    expect(linhas()[0]).toHaveTextContent("Messenger");
  });

  test("o filtro de texto da coluna usa o \"contém\" de antes", async () => {
    const user = userEvent.setup();
    wrap(<DataGrid data={AGENTES} columns={COLUNAS} filters={[{column: "nome", label: "Nome"}]} />);
    await user.type(screen.getByRole("textbox", {name: "Filter Nome"}), "er");
    const corpo = screen.getByRole("grid").querySelectorAll("tbody tr");
    expect([...corpo].map((l) => l.querySelectorAll("td")[0].textContent)).toEqual(["Messenger", "Writer", "Reviewer"]);
  });

  test("Shift+clique na caixa de uma linha marca SÓ aquela linha, como na 8", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    wrap(<DataGrid data={AGENTES} columns={COLUNAS} selectable getRowId={(r) => r.id} onSelectionChange={onSelectionChange} />);
    await user.click(caixas()[0]);
    await user.keyboard("{Shift>}");
    await user.click(caixas()[3]);
    await user.keyboard("{/Shift}");
    expect(caixas().map((c) => c.checked)).toEqual([true, false, false, true, false]);
    expect(onSelectionChange).toHaveBeenLastCalledWith([AGENTES[0], AGENTES[3]]);
  });

  test("o nome `VisibilityState` continua publicado, com a mesma forma", () => {
    const estado: VisibilityState = {nome: false};
    wrap(<DataGrid data={AGENTES} columns={COLUNAS} columnVisibility={estado} onColumnVisibilityChange={() => {}} />);
    expect(screen.queryByRole("button", {name: "Nome"})).toBeNull();
    expect(screen.getByRole("button", {name: "Execuções"})).toBeInTheDocument();
  });
});
