// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: a medição mostrou 77 dos 90 componentes com ZERO composição
// resolvida, contra cobertura total em duas das referências. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import {DropdownMenu, IconButton, Button} from "../../../../packages/react/dist/index.js";

export default [
  {
    variant: "Row actions",
    name: "The overflow menu of a table row",
    description: "Three dots at the end of the row. Destructive items sit last, after a separator, so the pointer never lands on Delete while reaching for Rename.",
    uses: ["DropdownMenu", "IconButton"],
    code: `<DropdownMenu
  label="Row actions"
  trigger={<IconButton icon="dots-three" label="Row actions" />}
  items={[
    {label: "Rename", leadingIcon: "pencil-simple"},
    {label: "Duplicate", leadingIcon: "copy"},
    "separator",
    {label: "Delete", leadingIcon: "trash"},
  ]}
/>`,
    render: () => h(DropdownMenu, {label: "Row actions", trigger: h(IconButton, {icon: "dots-three", label: "Row actions"}),
      items: [{label: "Rename", leadingIcon: "pencil-simple"}, {label: "Duplicate", leadingIcon: "copy"}, "separator",
        {label: "Delete", leadingIcon: "trash"}]}),
  },
  {
    variant: "Split action",
    name: "A primary action with variants behind it",
    description: "The button does the common thing; the chevron opens the rest. The label of the button is the action itself, never the word More.",
    uses: ["DropdownMenu", "Button", "IconButton"],
    code: `<ButtonGroup label="Export">
  <Button variant="primary">Export CSV</Button>
  <DropdownMenu
    label="Other formats"
    trigger={<IconButton variant="primary" icon="caret-down" label="Other formats" />}
    items={[{label: "Export JSON"}, {label: "Export Parquet"}]}
  />
</ButtonGroup>`,
    render: () => h("div", {style: {display: "flex", gap: "var(--space-1)"}},
      h(Button, {variant: "primary"}, "Export CSV"),
      h(IconButton, {variant: "primary", icon: "caret-down", label: "Other formats"})),
  },
  {
    variant: "View menu",
    name: "A menu that holds STATE, not just commands",
    description: "The View menu of any application: things that toggle, things that are mutually exclusive, and a section label that names the group instead of pretending to be an item. Until 28/08/2026 the Aurea menu could express none of these — `items` had a single shape, and the engine underneath had five (G-API-02).",
    uses: ["DropdownMenu", "Button"],
    code: `<DropdownMenu
  label="View"
  trigger={<Button variant="ghost">View</Button>}
  items={[
    {kind: "checkbox", label: "Sidebar", defaultChecked: true,
      onCheckedChange: (on) => setSidebar(on)},
    {kind: "checkbox", label: "Ruler"},
    "separator",
    {kind: "radiogroup", label: "Sort by", defaultValue: "name",
      onValueChange: setSort, items: [
        {value: "name", label: "Name"},
        {value: "date", label: "Date modified"},
      ]},
    "separator",
    {kind: "submenu", label: "Export", leadingIcon: "download", items: [
      {label: "PDF"},
      {label: "CSV"},
    ]},
    {kind: "link", label: "Documentation", href: "/docs"},
  ]}
/>`,
    render: () => h(DropdownMenu, {label: "View", trigger: h(Button, {variant: "ghost"}, "View"), items: [
      {kind: "checkbox", label: "Sidebar", defaultChecked: true}, {kind: "checkbox", label: "Ruler"}, "separator",
      {kind: "radiogroup", label: "Sort by", defaultValue: "name",
        items: [{value: "name", label: "Name"}, {value: "date", label: "Date modified"}]}, "separator",
      {kind: "submenu", label: "Export", leadingIcon: "download", items: [{label: "PDF"}, {label: "CSV"}]},
      {kind: "link", label: "Documentation", href: "#"}]}),
  },
];
