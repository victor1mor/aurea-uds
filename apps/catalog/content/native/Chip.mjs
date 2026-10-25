// O Chip do nativo no site (bloco 1, o 5-A — 23/10/2026): outro nome do `Badge`, igual em tudo. Todo valor das props do
// tipo em exemplo, com o nome `Chip` no código.
import {createElement as h} from "react";
import {Chip, Icon, IconButton, Stack} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const TONS = ["neutral", "primary", "info", "success", "warning", "danger", "red", "orange", "green", "teal", "cyan", "blue", "violet", "pink"];

export default {
  install: 'import {Chip} from "@aurea-uds/native";',
  api: {
    tone: "The colour: the six state tones and the eight category colours. Yellow stays the brand's.",
    dot: "A dot before the text. Alone, with nothing to show, the chip becomes the dot.",
    leading: "Content before the text — a glyph, in practice (<Icon name=\"check\" size=\"sm\" />). It is a node, not an icon name, and the slot does not tint what it gets.",
    trailing: "The same, after the text.",
    count: "A number to show instead of children. 0 hides the chip unless showZero.",
    max: "Above this, the chip shows max+ (99+ by default).",
    showZero: "Shows a count of 0 instead of hiding it.",
    fit: "content keeps the chip as wide as its text inside a column. For columns only: in a row it already is.",
    anchor: "Hangs the chip on a corner of children, which becomes the thing it decorates. The number is then decorative for the screen reader: write it in the decorated thing's name.",
  },
  examples: [
    {
      title: "Usage",
      code: `<Chip tone="success">Paid</Chip>
<Chip tone="warning">Pending</Chip>
<Chip tone="danger" emphasis="solid">Overdue</Chip>`,
      render: () => h("div", {style: {display: "flex", gap: "var(--space-3)", flexWrap: "wrap", alignItems: "center"}},
        h(Chip, {tone: "success"}, "Paid"), h(Chip, {tone: "warning"}, "Pending"),
        h(Chip, {tone: "danger", emphasis: "solid"}, "Overdue")),
    },
    cada({titulo: "Tones", descricao: "The state tones and the eight category colours.",
      valores: TONS, codigo: v => `<Chip tone="${v}">${v}</Chip>`, peca: v => h(Chip, {tone: v}, v)}),
    cada({titulo: "Emphasis", descricao: "How loud the tone is: the tinted pill, the contour, or the fill.",
      valores: ["soft", "outline", "solid"], codigo: v => `<Chip tone="info" emphasis="${v}">${v}</Chip>`,
      peca: v => h(Chip, {tone: "info", emphasis: v}, v)}),
    cada({titulo: "Sizes", descricao: "From the small counter to the large pill.",
      valores: ["xs", "sm", "md", "lg"], codigo: v => `<Chip size="${v}">${v}</Chip>`, peca: v => h(Chip, {size: v}, v)}),
    {
      title: "Dot and glyphs",
      description: "dot draws the state dot; leading and trailing take a node, and the colour of the glyph is yours.",
      code: `<Chip tone="success" dot>Online</Chip>
<Chip tone="info" leading={<Icon name="check" size="sm" />}>Verified</Chip>
<Chip trailing={<Icon name="caret-down" size="sm" />}>Filter</Chip>
<Chip tone="danger" dot />`,
      render: () => h("div", {style: {display: "flex", gap: "var(--space-3)", flexWrap: "wrap", alignItems: "center"}},
        h(Chip, {tone: "success", dot: true}, "Online"),
        h(Chip, {tone: "info", leading: h(Icon, {name: "check", size: "sm"})}, "Verified"),
        h(Chip, {trailing: h(Icon, {name: "caret-down", size: "sm"})}, "Filter"),
        h(Chip, {tone: "danger", dot: true})),
    },
    {
      title: "Counts",
      description: "count shows a number; above max it shows max+; a count of 0 hides the chip unless showZero.",
      code: `<Chip count={7} />
<Chip count={250} max={99} tone="danger" emphasis="solid" />
<Chip count={0} showZero />`,
      render: () => h("div", {style: {display: "flex", gap: "var(--space-3)", flexWrap: "wrap", alignItems: "center"}},
        h(Chip, {count: 7}), h(Chip, {count: 250, max: 99, tone: "danger", emphasis: "solid"}),
        h(Chip, {count: 0, showZero: true})),
    },
    // Cada um numa coluna do nativo (a `Stack`), que é onde o `fit` muda alguma coisa: nela o `auto` estica.
    cada({titulo: "Width", descricao: "Inside a column, auto stretches with it and fit=\"content\" keeps the chip as wide as its text.",
      valores: ["auto", "content"], estilo: {display: "grid", gap: "var(--space-3)", width: "min(20rem, 100%)"},
      codigo: v => `<Stack>
  <Chip fit="${v}">fit ${v}</Chip>
</Stack>`, peca: v => h(Stack, null, h(Chip, {fit: v}, `fit ${v}`))}),
    cada({titulo: "On a corner", descricao: "anchor hangs the chip on a corner of what it decorates; the count goes in that thing's name.",
      valores: ["top-end", "top-start", "bottom-end", "bottom-start"],
      codigo: v => `<Chip anchor="${v}" count={3} tone="danger" emphasis="solid">\n  <IconButton name="bell" label="Notifications, 3 new" />\n</Chip>`,
      peca: v => h(Chip, {anchor: v, count: 3, tone: "danger", emphasis: "solid"},
        h(IconButton, {name: "bell", label: `Notifications, 3 new (${v})`}))}),
    {
      title: "Hidden for now",
      description: "invisible hides the chip on the corner without moving what it decorates — while the count loads, say.",
      code: `<Chip anchor="top-end" count={3} invisible>
  <IconButton name="bell" label="Notifications" />
</Chip>`,
      render: () => h(Chip, {anchor: "top-end", count: 3, invisible: true}, h(IconButton, {name: "bell", label: "Notifications"})),
    },
  ],
};
