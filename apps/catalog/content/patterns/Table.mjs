import {createElement as h} from "react";
import {Table, Badge, Status, Pagination, SearchField, SegmentedControl, Button, Checkbox, Field, Select, Switch} from "../../../../packages/react/dist/index.js";

const wide = {width: "min(660px, 100%)", display: "grid", gap: "var(--space-3)"};
const row = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2)"};

const rows = [
  {name: "Messenger", status: "online", plan: "Pro"},
  {name: "Analyst", status: "busy", plan: "Free"},
  {name: "Curator", status: "offline", plan: "Pro"},
];

export default [
  {
    variant: "Base",
    name: "With caption",
    description: "The caption names the table for a screen reader and for the eye — a table with no name is a grid of noise.",
    uses: ["Table"],
    code: '<Table caption="Workspace members">\n  <thead><tr><th>Name</th><th>Plan</th></tr></thead>\n  <tbody>…</tbody>\n</Table>',
    render: () => h("div", {style: wide},
      h(Table, {caption: "Workspace members"},
        h("thead", null, h("tr", null, h("th", null, "Name"), h("th", null, "Plan"))),
        h("tbody", null, ...rows.map(r => h("tr", {key: r.name},
          h("td", null, r.name), h("td", null, r.plan)))))),
  },
  {
    variant: "Status column",
    name: "Operational state",
    description: "A Status per row instead of a coloured cell: the condition is spelled out, not encoded in a fill.",
    uses: ["Table", "Status"],
    code: '<td><Status variant="online">online</Status></td>',
    render: () => h("div", {style: wide},
      h(Table, {caption: "Agents"},
        h("thead", null, h("tr", null, h("th", null, "Agent"), h("th", null, "State"))),
        h("tbody", null, ...rows.map(r => h("tr", {key: r.name},
          h("td", null, r.name),
          h("td", null, h(Status, {variant: r.status}, r.status))))))),
  },
  {
    variant: "Selectable",
    name: "With pagination",
    description: "The full collection composition: filter above, selection in the first column, pagination below.",
    uses: ["Table", "Checkbox", "SearchField", "Pagination"],
    code: '<SearchField placeholder="Filter members…" />\n<Table caption="Members">…</Table>\n<Pagination page={1} total={3} onPageChange={setPage} />',
    render: () => h("div", {style: wide},
      h("div", {style: row}, h("div", {style: {flex: 1, minWidth: "180px"}},
        h(SearchField, {placeholder: "Filter members…"}))),
      h(Table, {caption: "Members"},
        h("thead", null, h("tr", null, h("th", null, h("span", {className: "sr-only"}, "Select")), h("th", null, "Name"), h("th", null, "Plan"))),
        h("tbody", null, ...rows.map((r, i) => h("tr", {key: r.name},
          h("td", null, h(Checkbox, {label: `Select ${r.name}`, labelHidden: true, defaultChecked: i === 0})),
          h("td", null, r.name), h("td", null, r.plan))))),
      h(Pagination, {page: 1, total: 3, onPageChange: () => {}})),
  },
  {
    variant: "Selectable",
    name: "View switch",
    description: "Table or cards for the same data — SegmentedControl switches the view, never the meaning.",
    uses: ["SegmentedControl", "Table"],
    code: '<SegmentedControl label="View" value="table"\n  items={[{value:"table",label:"Table"},{value:"cards",label:"Cards"}]} onChange={setView} />',
    render: () => h("div", {style: wide},
      h(SegmentedControl, {label: "View", value: "table", onChange: () => {},
        items: [{value: "table", label: "Table"}, {value: "cards", label: "Cards"}]}),
      h(Table, {caption: "Members"},
        h("thead", null, h("tr", null, h("th", null, "Name"), h("th", null, "Plan"))),
        h("tbody", null, ...rows.slice(0, 2).map(r => h("tr", {key: r.name},
          h("td", null, r.name), h("td", null, r.plan)))))),
  },
  {
    variant: "Selectable",
    name: "Row actions",
    description: "Actions live at the end of the row, ghost so they do not shout over the data.",
    uses: ["Table", "Button"],
    code: '<td className="cluster">\n  <Button variant="ghost" size="sm">Edit</Button>\n  <Button variant="ghost" size="sm">Remove</Button>\n</td>',
    render: () => h("div", {style: wide},
      h(Table, {caption: "Members"},
        h("thead", null, h("tr", null, h("th", null, "Name"), h("th", null, "Actions"))),
        h("tbody", null, ...rows.slice(0, 2).map(r => h("tr", {key: r.name},
          h("td", null, r.name),
          h("td", null, h("div", {style: row}, h(Button, {variant: "ghost", size: "sm"}, "Edit"),
            h(Button, {variant: "ghost", size: "sm"}, "Remove")))))))),
  },
  // GAR-12 e GAR-13 (08/10/2026): a tabela de COMPARAÇÃO — a mesma Table, com uma chave para cada
  // coisa (escolha do Victor). Os três padrões abaixo são as três decisões dele: a comparação com
  // grupos e o melhor valor, dois itens no celular, e o "Só diferenças".
  {
    variant: "Comparison",
    name: "A comparison with groups and the best value",
    description: "Items are columns, specs are rows. Each group of rows is a <tbody> that opens with a band; each row is named by a <th scope=\"row\">. The name column stays put when the table scrolls sideways, and the header stays at the top of the box when it scrolls down. The best value is bold and also says so in text — a Badge, because colour alone tells nothing to someone who cannot see it.",
    uses: ["Table", "Badge"],
    code: `<Table caption="Compare models" stickyHeader stickyFirstColumn>
  <thead><tr><th scope="col">Spec</th><th scope="col">Model A</th>…</tr></thead>
  <tbody>
    <tr><th scope="rowgroup" colSpan={4}>Engine</th></tr>
    <tr>
      <th scope="row">Power</th>
      <td>120 hp</td>
      <td data-best>150 hp <Badge>Best</Badge></td>
      <td>110 hp</td>
    </tr>
  </tbody>
</Table>`,
    render: () => h("div", {style: {...wide, "--table-max-h": "300px"}}, comparison({stickyHeader: true, stickyFirstColumn: true}, 3)),
  },
  {
    variant: "Comparison",
    name: "Two at a time on a phone",
    description: "On a narrow screen the page shows two items, picked with two selects above the table, and `fit` drops the 720px minimum so the two fit with no sideways scroll. Which two is the page's choice; the table only has to fit.",
    uses: ["Table", "Field", "Select", "Badge"],
    code: `<Field label="Compare"><Select value={a} onValueChange={setA}>…</Select></Field>
<Field label="With"><Select value={b} onValueChange={setB}>…</Select></Field>
<Table caption="Compare models" fit>…two columns…</Table>`,
    render: () => h("div", {style: {width: "min(360px, 100%)", display: "grid", gap: "var(--space-3)"}},
      h("div", {style: {display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)"}},
        h(Field, {label: "Compare"}, h(Select, {defaultValue: "a"}, ...MODELS.map((m, i) => h("option", {key: m, value: "abc"[i]}, m)))),
        h(Field, {label: "With"}, h(Select, {defaultValue: "b"}, ...MODELS.map((m, i) => h("option", {key: m, value: "abc"[i]}, m))))),
      comparison({fit: true}, 2)),
  },
  {
    variant: "Comparison",
    name: "Differences only",
    description: "A switch hides the rows that are the same for every item — the page marks them <tr data-same>, and `differencesOnly` hides them. Removing what does not differ is what makes a long comparison readable.",
    uses: ["Table", "Switch", "Badge"],
    code: `<Switch label="Differences only" checked={only} onChange={e => setOnly(e.target.checked)} />
<Table caption="Compare models" differencesOnly={only}>
  …<tr data-same><th scope="row">Fuel</th><td>Flex</td><td>Flex</td><td>Flex</td></tr>…
</Table>`,
    render: () => h("div", {style: wide},
      h(Switch, {label: "Differences only", defaultChecked: true}),
      comparison({differencesOnly: true}, 3)),
  },
];

// A comparação dos três padrões acima: grupos em <tbody>, o nome da linha em <th scope="row">,
// o melhor valor em <td data-best> com o selo em texto, a linha igual em <tr data-same>.
const MODELS = ["Model A", "Model B", "Model C"];
const SPECS = [
  {group: "Engine", rows: [["Power", ["120 hp", "150 hp", "110 hp"], 1], ["Torque", ["16 kgfm", "19 kgfm", "15 kgfm"], 1], ["Fuel", ["Flex", "Flex", "Flex"], -1]]},
  {group: "Brakes", rows: [["Front", ["Disc", "Disc", "Disc"], -1], ["Rear", ["Drum", "Disc", "Drum"], null]]},
];
function comparison(props, n) {
  const cols = MODELS.slice(0, n);
  return h(Table, {caption: "Compare models", ...props},
    h("thead", null, h("tr", null, h("th", {scope: "col"}, "Spec"), ...cols.map(m => h("th", {scope: "col", key: m}, m)))),
    ...SPECS.map(g => h("tbody", {key: g.group},
      h("tr", null, h("th", {scope: "rowgroup", colSpan: n + 1}, g.group)),
      ...g.rows.map(([name, values, best]) => h("tr", {key: name, "data-same": best === -1 ? "" : undefined},
        h("th", {scope: "row"}, name),
        ...values.slice(0, n).map((v, i) => best === i
          ? h("td", {key: i, "data-best": ""}, v, " ", h(Badge, null, "Best"))
          : h("td", {key: i}, v)))))));
}
