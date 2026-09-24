// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: a medição mostrou 77 dos 90 componentes com ZERO composição
// resolvida, contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import {DropdownMenu, IconButton, Button} from "../../../../packages/react/dist/index.js";

const PORTAL = "This page is static HTML: the popup lives in a portal and only exists in a real "
  + "React app. The preview shows the trigger; the code is the whole composition.";

export default [
  {
    variant: "Row actions",
    name: "The overflow menu of a table row",
    description: "Three dots at the end of the row. Destructive items sit last, after a separator, so the pointer never lands on Delete while reaching for Rename.",
    uses: ["DropdownMenu", "IconButton"],
    note: PORTAL,
    code: `<DropdownMenu
  label="Row actions"
  trigger={<IconButton icon="overflow-menu--horizontal" label="Row actions" />}
  items={[
    {label: "Rename", leadingIcon: "edit"},
    {label: "Duplicate", leadingIcon: "copy"},
    "separator",
    {label: "Delete", leadingIcon: "trash-can"},
  ]}
/>`,
    render: () => h(IconButton, {icon: "overflow-menu--horizontal", label: "Row actions"}),
  },
  {
    variant: "Split action",
    name: "A primary action with variants behind it",
    description: "The button does the common thing; the chevron opens the rest. The label of the button is the action itself, never the word More.",
    uses: ["DropdownMenu", "Button", "IconButton"],
    note: PORTAL,
    code: `<ButtonGroup label="Export">
  <Button variant="primary">Export CSV</Button>
  <DropdownMenu
    label="Other formats"
    trigger={<IconButton variant="primary" icon="chevron--down" label="Other formats" />}
    items={[{label: "Export JSON"}, {label: "Export Parquet"}]}
  />
</ButtonGroup>`,
    render: () => h("div", {style: {display: "flex", gap: "var(--space-1)"}},
      h(Button, {variant: "primary"}, "Export CSV"),
      h(IconButton, {variant: "primary", icon: "chevron--down", label: "Other formats"})),
  },
  {
    variant: "View menu",
    name: "A menu that holds STATE, not just commands",
    description: "The View menu of any application: things that toggle, things that are mutually exclusive, and a section label that names the group instead of pretending to be an item. Until 28/08/2026 the Aurea menu could express none of these — `items` had a single shape, and the engine underneath had five (G-API-02).",
    uses: ["DropdownMenu", "Button"],
    note: PORTAL,
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
    render: () => h(Button, {variant: "ghost"}, "View"),
  },
];
