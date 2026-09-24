// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import {Menubar} from "../../../../packages/react/dist/index.js";

export default [
  {
    variant: "Application",
    name: "The menu row of an editor",
    description: "One row, and the arrow keys walk from an open menu straight into the next — that is what separates a menubar from three dropdowns side by side. It belongs to applications, not to websites.",
    uses: ["Menubar"],
    note: "The row is real; the menus open in a portal, which a static page cannot render.",
    code: `<Menubar label="Main" menus={[
  {label: "File", items: [
    {label: "New file", kbd: "⌘N"}, {label: "Open…", kbd: "⌘O"},
    "separator", {label: "Close", kbd: "⌘W"},
  ]},
  {label: "Edit", items: [{label: "Undo", kbd: "⌘Z"}, {label: "Redo", kbd: "⇧⌘Z"}]},
  {label: "View", items: [{label: "Zoom in"}, {label: "Zoom out"}, {label: "Reset zoom"}]},
]} />`,
    render: () => h(Menubar, {label: "Main", menus: [
      {label: "File", items: [{label: "New file"}, {label: "Open…"}, "separator", {label: "Close"}]},
      {label: "Edit", items: [{label: "Undo"}, {label: "Redo"}]},
      {label: "View", items: [{label: "Zoom in"}, {label: "Zoom out"}, {label: "Reset zoom"}]},
    ]}),
  },
  {
    variant: "Vertical",
    name: "The menu bar as a column",
    description: "`orientation=\"vertical\"` stacks the bar and the menus open to the side — down would put them on top of the next item of the bar itself. The side is logical (`inline-end`), so in Arabic the column sits on the right and the menus open left without anyone writing a second rule.",
    uses: ["Menubar"],
    note: "The column is real; the menus open in a portal, which a static page cannot render.",
    code: `<Menubar label="Tools" orientation="vertical" menus={[
  {label: "File", items: [{label: "New file"}, {label: "Open…"}]},
  {label: "Selection", items: [{label: "Select all"}, {label: "Expand"}]},
]} />`,
    render: () => h(Menubar, {label: "Tools", orientation: "vertical", menus: [
      {label: "File", items: [{label: "New file"}, {label: "Open…"}]},
      {label: "Selection", items: [{label: "Select all"}, {label: "Expand"}]},
    ]}),
  },
];
