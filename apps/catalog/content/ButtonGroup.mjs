import {createElement as h} from "react";
import {ButtonGroup, Button, SegmentedControl} from "../../../packages/react/dist/index.js";
import {ComValor} from "./_estado.mjs";
import {jsxProp} from "./_eixos.mjs";

const row = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2)"};
const coluna = {display: "grid", gap: "var(--space-3)", justifyItems: "start"};

// Um grupo por linha da lista, e o código e o desenho saem da MESMA lista — o `eixo` do `_eixos.mjs` não serve aqui
// porque os filhos são botões (elementos), e cada grupo leva um nome próprio.
const BOTOES = ["Day", "Week", "Month"];
const grupos = (lista) => ({
  code: lista.map((p) => `<ButtonGroup ${Object.entries(p).map(([k, v]) => jsxProp(k, v)).join(" ")}>`
    + BOTOES.map((b) => `<Button>${b}</Button>`).join("") + "</ButtonGroup>").join("\n"),
  render: () => h("div", {style: coluna}, ...lista.map((p) =>
    h(ButtonGroup, {key: p.label, ...p}, ...BOTOES.map((b) => h(Button, {key: b}, b))))),
});
const VARIANTES = ["primary", "secondary", "tertiary", "outline", "ghost", "primary-outline", "primary-ghost",
  "danger", "danger-outline", "danger-ghost", "danger-soft", "link", "link-primary", "link-danger", "nav"];
const nomeDe = (v) => v[0].toUpperCase() + v.slice(1).replace(/-/g, " ");

export default {
  description:
    "ButtonGroup binds buttons of the same kind into one coordinated set. It groups visually " +
    "and semantically — every button stays tabbable, which is exactly what separates it from a " +
    "Toolbar. Pick by the keyboard behaviour you want, never by how it looks.",

  install: 'import {ButtonGroup, Button} from "@aurea-uds/react";',

  features: [
    "role=\"group\" with an accessible name: a set with no name is a pile of buttons to a screen reader.",
    "Every button keeps its own tab stop. For arrow-key navigation with a single tab stop use Toolbar.",
    "Joined into one capsule: no gap, rounded only at the ends, a hairline between buttons. `detached` keeps them as loose pills with a small gap.",
    "variant, size and disabled set on the group reach every button; a button may still set its own.",
    "fullWidth stretches the group and shares the width equally.",
    "Selection: one-of-many is SegmentedControl; many-of-many is ToggleGroup.",
    "Disabling one item does not disable the set, and the disabled item keeps its place.",
  ],

  examples: [
    {
      title: "Range",
      description: "Three views of the same data. The label names the set, not each button.",
      code: [
        '<ButtonGroup label="Range">',
        '  <Button>Day</Button>',
        '  <Button>Week</Button>',
        '  <Button>Month</Button>',
        '</ButtonGroup>',
      ].join("\n"),
      render: () => h(ButtonGroup, {label: "Range"},
        h(Button, null, "Day"), h(Button, null, "Week"), h(Button, null, "Month")),
    },
    {
      title: "With leading icons",
      description: "The glyph repeats the verb of each button; the group still reads as one unit.",
      code: [
        '<ButtonGroup label="Export">',
        '  <Button leadingIcon="download">Download</Button>',
        '  <Button leadingIcon="share">Share</Button>',
        '  <Button leadingIcon="link-simple">Copy link</Button>',
        '</ButtonGroup>',
      ].join("\n"),
      render: () => h(ButtonGroup, {label: "Export"},
        h(Button, {leadingIcon: "download"}, "Download"),
        h(Button, {leadingIcon: "share"}, "Share"),
        h(Button, {leadingIcon: "link-simple"}, "Copy link")),
    },
    {
      title: "Variant and size from the group",
      description: "Set once on the group; every button follows. Here the outline look in the small size.",
      code: [
        '<ButtonGroup label="Zoom" variant="outline" size="sm">',
        '  <Button leadingIcon="minus">Out</Button>',
        '  <Button>100%</Button>',
        '  <Button leadingIcon="plus">In</Button>',
        '</ButtonGroup>',
      ].join("\n"),
      render: () => h(ButtonGroup, {label: "Zoom", variant: "outline", size: "sm"},
        h(Button, {leadingIcon: "minus"}, "Out"), h(Button, null, "100%"), h(Button, {leadingIcon: "plus"}, "In")),
    },
    {
      title: "Detached",
      description: "Loose pills with a small gap, for buttons that belong together but are not one control.",
      code: [
        '<ButtonGroup label="Actions" detached>',
        '  <Button>Duplicate</Button>',
        '  <Button>Move</Button>',
        '  <Button>Archive</Button>',
        '</ButtonGroup>',
      ].join("\n"),
      render: () => h(ButtonGroup, {label: "Actions", detached: true},
        h(Button, null, "Duplicate"), h(Button, null, "Move"), h(Button, null, "Archive")),
    },
    {
      title: "Single selection",
      description: "The same job with the right component: SegmentedControl carries one value and one tab stop.",
      code: [
        '<SegmentedControl label="View" value="board" onChange={setView}',
        '  items={[{value: "list", label: "List"}, {value: "board", label: "Board"}]} />',
      ].join("\n"),
      render: () => h(ComValor, {componente: SegmentedControl, label: "View", value: "board", 
        items: [{value: "list", label: "List"}, {value: "board", label: "Board"}]}),
    },
    {
      title: "Disabled item",
      description: "One unavailable option does not disable the set, and it keeps its place so the row never shifts.",
      code: [
        '<ButtonGroup label="Plan">',
        '  <Button>Monthly</Button>',
        '  <Button>Yearly</Button>',
        '  <Button disabled>Lifetime</Button>',
        '</ButtonGroup>',
      ].join("\n"),
      render: () => h(ButtonGroup, {label: "Plan"},
        h(Button, null, "Monthly"), h(Button, null, "Yearly"), h(Button, {disabled: true}, "Lifetime")),
    },
    {
      title: "Every variant",
      description: "Any Button variant, set once on the group. The joined capsule and the hairline between the "
        + "buttons stay the same; only the weight and the tone change.",
      ...grupos(VARIANTES.map((v) => ({label: nomeDe(v), variant: v}))),
    },
    {
      title: "Every size",
      description: "The five button heights, from the density tokens. The group passes the size to every button inside.",
      ...grupos([["xs", "Extra small"], ["sm", "Small"], ["md", "Medium"], ["lg", "Large"], ["xl", "Extra large"]]
        .map(([size, label]) => ({label, size}))),
    },
    {
      title: "Vertical",
      description: "The same buttons stacked. Visual only: the order, the semantics and the Tab stops do not change.",
      code: [
        '<ButtonGroup label="Align" orientation="vertical">',
        '  <Button>Top</Button>',
        '  <Button>Middle</Button>',
        '  <Button>Bottom</Button>',
        '</ButtonGroup>',
      ].join("\n"),
      render: () => h(ButtonGroup, {label: "Align", orientation: "vertical"},
        h(Button, null, "Top"), h(Button, null, "Middle"), h(Button, null, "Bottom")),
    },
  ],
};
