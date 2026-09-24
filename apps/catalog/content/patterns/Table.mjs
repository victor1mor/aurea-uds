import {createElement as h} from "react";
import {Table, Badge, Status, Pagination, SearchField, SegmentedControl, Button, Checkbox} from "../../../../packages/react/dist/index.js";

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
];
