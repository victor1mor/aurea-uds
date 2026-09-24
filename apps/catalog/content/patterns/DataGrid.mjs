// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import {DataGrid} from "../../../../packages/react/dist/data-grid.js";

const LINHAS = [
  {name: "Messenger", role: "Owner", runs: 1284, status: "active"},
  {name: "Analyst", role: "Editor", runs: 412, status: "active"},
  {name: "Curator", role: "Viewer", runs: 96, status: "paused"},
  {name: "Writer", role: "Editor", runs: 38, status: "active"},
];

export default [
  {
    variant: "Selectable",
    name: "A list you act on in bulk",
    description: "Selection turns a table into a work surface: pick the rows, then act once. The header checkbox selects the page, never the whole dataset — a promise a static table cannot keep.",
    uses: ["DataGrid"],
    code: `<DataGrid
  label="Members"
  selectable
  filterable
  pageSize={10}
  onSelectionChange={setSelected}
  getRowId={row => row.name}
  data={members}
  columns={[
    {accessorKey: "name", header: "Name"},
    {accessorKey: "role", header: "Role"},
    {accessorKey: "runs", header: "Runs"},
  ]}
/>`,
    render: () => h("div", {style: {width: "100%"}}, h(DataGrid, {
      label: "Members", selectable: true, filterable: true,
      getRowId: (r) => r.name, data: LINHAS,
      columns: [
        {accessorKey: "name", header: "Name"},
        {accessorKey: "role", header: "Role"},
        {accessorKey: "runs", header: "Runs"},
      ]})),
  },
];
