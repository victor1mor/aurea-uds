// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`. Medido em 21/08/2026: `.separator` aparecia em DUAS páginas
// do catálogo, as duas do próprio componente.
//
// A regra que decide todo pattern daqui: o separador é DECORATIVO por padrão e some do leitor de
// tela. Quando ele separa duas coisas que só a linha distingue, ele deixa de ser decoração — e
// aí o que resolve é um cabeçalho ou um `aria-label`, não a linha. Linha não é estrutura.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";

const largo = {width: "min(520px,100%)"};

export default [
  {
    variant: "Horizontal",
    name: "Between two parts of the same card",
    description: "The line says \"the section above is finished\" without spending a heading on it. Inside a card, where a heading would be too loud and blank space alone reads as an accident.",
    uses: ["Card", "Separator", "DataList", "Button"],
    code: `<Card>
  <DataList items={fields} />
  <Separator />
  <Button variant="ghost" size="sm">Edit details</Button>
</Card>`,
    render: () => h("div", {style: largo}, h(A.Card, null,
      h(A.DataList, {items: [
        {term: "Plan", value: "Team"},
        {term: "Seats", value: "12 of 20"}]}),
      h("div", {style: {margin: "var(--space-4) 0"}}, h(A.Separator)),
      h(A.Button, {variant: "ghost", size: "sm"}, "Edit details"))),
  },
  {
    variant: "Vertical",
    name: "Between items on one line",
    description: "`orientation=\"vertical\"` for metadata that shares a row and does not share a meaning. It stretches to the line, so it never reads as a stray character the way a typed pipe does at a different font size.",
    uses: ["Cluster", "Separator"],
    code: `<Cluster>
  <span>12 components</span>
  <Separator orientation="vertical" />
  <span>186 patterns</span>
  <Separator orientation="vertical" />
  <span>Apache-2.0</span>
</Cluster>`,
    render: () => h("div", {style: largo}, h(A.Cluster, null,
      h("span", null, "90 components"),
      h(A.Separator, {orientation: "vertical"}),
      h("span", null, "186 patterns"),
      h(A.Separator, {orientation: "vertical"}),
      h("span", {className: "muted"}, "Apache-2.0"))),
  },
  {
    variant: "Horizontal",
    name: "Grouping a menu without labelling it",
    description: "The line groups the destructive action away from the rest so it is not reached by accident. Note what it is not doing: a screen reader hears one flat list, and that is correct — the separation is a pointer affordance, and the wording of the item is what carries the warning.",
    uses: ["Separator", "Button"],
    code: `<div className="menu">
  <button className="menu-item" type="button">Rename</button>
  <button className="menu-item" type="button">Duplicate</button>
  <Separator />
  <button className="menu-item" type="button">Delete permanently</button>
</div>`,
    render: () => h("div", {style: {width: "min(280px,100%)"}}, h("div", {className: "menu"},
      h("button", {className: "menu-item", type: "button"}, "Rename"),
      h("button", {className: "menu-item", type: "button"}, "Duplicate"),
      h(A.Separator),
      h("button", {className: "menu-item", type: "button"}, "Delete permanently"))),
  },
];
