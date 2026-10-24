// A Table do nativo no site (bloco 1, o 5-A — 23/10/2026): no aparelho ela NÃO é uma grade — cada linha vira um cartão,
// e cada célula leva o nome da coluna junto. A API é outra da web: `columns` + `rows`, dados em vez de `<thead>`.
import {createElement as h, useState} from "react";
import {Badge, Table, Text} from "../../../../packages/native/dist/index.js";

const largura = {width: "min(24rem, 100%)"};

const COLUNAS = [
  {key: "date", header: "Date", primary: true},
  {key: "description", header: "Description"},
  {key: "amount", header: "Amount"},
];
const LINHAS = [
  {id: "p1", date: "Oct 2", description: "Fuel", amount: "$62.40"},
  {id: "p2", date: "Oct 9", description: "Tyre change", amount: "$310.00"},
  {id: "p3", date: "Oct 17", description: "Parking", amount: "$18.00"},
];
const DADOS_CODIGO = `const columns = [
  {key: "date", header: "Date", primary: true},
  {key: "description", header: "Description"},
  {key: "amount", header: "Amount"},
];
const rows = [
  {id: "p1", date: "Oct 2", description: "Fuel", amount: "$62.40"},
  {id: "p2", date: "Oct 9", description: "Tyre change", amount: "$310.00"},
  {id: "p3", date: "Oct 17", description: "Parking", amount: "$18.00"},
];`;

const TOM = {Paid: "success", Pending: "warning", Overdue: "danger"};
const COM_ESTADO = [...COLUNAS,
  {key: "status", header: "Status", cell: (linha) => h(Badge, {tone: TOM[linha.status]}, linha.status)}];
const LINHAS_COM_ESTADO = LINHAS.map((l, n) => ({...l, status: ["Paid", "Pending", "Overdue"][n]}));

// A linha tocável: a de baixo diz qual foi tocada.
function Tocavel() {
  const [tocada, setTocada] = useState(null);
  return h("div", {style: {...largura, display: "grid", gap: "var(--space-3)"}},
    h(Table, {caption: "October expenses", columns: COLUNAS, rows: LINHAS, keyExtractor: (l) => l.id, onRowPress: setTocada}),
    h(Text, {size: "sm", tone: "muted"}, tocada ? `Opened: ${tocada.description}` : "Touch a row"));
}

export default {
  install: 'import {Table} from "@aurea-uds/native";',
  description: "Rows and columns of data — and on the phone it is not a grid. Each row becomes a card and each cell carries its column's name, so four numbers never stand alone. The API is data: columns plus rows.",
  api: {
    caption: "The accessible name of the list. It is not drawn: put a Heading above when the title should show. Without it, the generic phrase from the strings table.",
    columns: "The columns: {key, header, cell?, primary?}. header names each cell inside the card; cell draws it (without it, String(row[key])); primary makes that column the card's title, without repeating its name.",
    rows: "The data, one object per row.",
    keyExtractor: "A stable identity for each row. Without it, the index — enough for a list that does not reorder.",
    onRowPress: "Makes each row a button that receives the row. Without it a row is not a target, and does not pretend to be.",
    empty: "What to show with no rows. Without it, the empty phrase from the strings table.",
    style: "Style for the list.",
    testID: "Test id of the list.",
  },
  examples: [
    {
      title: "Usage",
      code: `${DADOS_CODIGO}\n\n<Table caption="October expenses" columns={columns} rows={rows} keyExtractor={row => row.id} />`,
      render: () => h("div", {style: largura}, h(Table, {caption: "October expenses", columns: COLUNAS, rows: LINHAS, keyExtractor: (l) => l.id})),
    },
    {
      title: "Rows you can touch",
      description: "onRowPress turns each card into a button that receives its row.",
      code: `${DADOS_CODIGO}

<Table caption="October expenses" columns={columns} rows={rows} keyExtractor={row => row.id}
  onRowPress={row => open(row.id)} />`,
      render: () => h(Tocavel),
    },
    {
      title: "A cell of your own",
      description: "cell draws the cell from the row — here a Badge; the column's name still goes with it.",
      code: `${DADOS_CODIGO}
const invoices = rows.map((row, n) => ({...row, status: ["Paid", "Pending", "Overdue"][n]}));
const TONE = {Paid: "success", Pending: "warning", Overdue: "danger"};
const withStatus = [...columns,
  {key: "status", header: "Status", cell: row => <Badge tone={TONE[row.status]}>{row.status}</Badge>}];

<Table caption="October invoices" columns={withStatus} rows={invoices} keyExtractor={row => row.id} />`,
      render: () => h("div", {style: largura}, h(Table, {caption: "October invoices", columns: COM_ESTADO, rows: LINHAS_COM_ESTADO, keyExtractor: (l) => l.id})),
    },
    {
      title: "Empty",
      code: `<Table caption="November expenses" columns={columns} rows={[]} empty="No expenses this month." />`,
      render: () => h("div", {style: largura}, h(Table, {caption: "November expenses", columns: COLUNAS, rows: [], empty: "No expenses this month."})),
    },
  ],
};
