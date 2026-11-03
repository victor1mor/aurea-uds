import {createElement as h} from "react";
import {Toggle} from "../../../packages/react/dist/index.js";
import {eixo, cada} from "./_eixos.mjs";

const row = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2)"};

export default {
  description:
    "Toggle is a button that stays on. It is the Aurea component for a two-state control that is "
    + "not a form field: bold in a text toolbar, list-or-grid, mute. The state is aria-pressed, so "
    + "a screen reader announces it as a toggle button and says whether it is pressed.",
  install: 'import {Toggle} from "@aurea-uds/react";',
  features: [
    "It OWNS the state. Uncontrolled with defaultPressed, controlled with pressed plus "
    + "onPressedChange — the Base UI engine handles keyboard, focus and aria-pressed.",
    "THE LABEL MUST NOT CHANGE between the two states. If the text turns from \"Mute\" into "
    + "\"Unmute\", or \"Play\" into \"Pause\", this is the wrong component: use a Button. A screen "
    + "reader reads the new label and the state at the same time, and the listener cannot tell "
    + "whether the button describes what it IS or what it WILL DO. The rule is the APG's and one of "
    + "the references', and it is the one rule that decides between the two components.",
    "Icon only needs a name: pass label. Without visible children and without label the component "
    + "writes to the console, because an anonymous button is a dead end for a screen reader.",
    "It is not a Switch and not a Checkbox. A switch is a setting that applies immediately; a "
    + "checkbox is a form field that gets submitted; a toggle is an action that stays on.",
    "`Button` also accepts a `pressed` prop. It is DEPRECATED since 0.4.0 and goes away in 1.0 — "
    + "it only paints and announces, and you keep the state. Twelve reference libraries were read "
    + "in August 2026 and none of them puts the pressed state on the plain button.",
  ],
  examples: [
    {
      title: "The formatting set",
      // PROVA DO RUNTIME (18/08/2026): este é o primeiro exemplo do catálogo que precisa de
      // JavaScript para funcionar. Estático, o toggle desenha e não alterna; hidratado, ele
      // alterna de verdade. É o que separa "a prévia existe" de "a prévia funciona".
      embed: true,
      description: "Three toggles, each independently on or off. This is what a text toolbar is — "
        + "and the labels stay the same whether they are pressed or not.",
      code: [
        '<Toggle defaultPressed>Bold</Toggle>',
        '<Toggle>Italic</Toggle>',
        '<Toggle>Underline</Toggle>',
      ].join("\n"),
      render: () => h("div", {style: row},
        h(Toggle, {defaultPressed: true}, "Bold"),
        h(Toggle, null, "Italic"),
        h(Toggle, null, "Underline")),
    },
    {
      title: "Icon only, with a name",
      description: "No visible text means label is required — it becomes the accessible name. "
        + "Note the name says what the control IS (\"Mute\"), not what pressing it will do.",
      code: '<Toggle icon="speaker-slash" label="Mute" />',
      render: () => h("div", {style: row},
        h(Toggle, {icon: "speaker-slash", label: "Mute"}),
        h(Toggle, {icon: "star", label: "Favourite", defaultPressed: true})),
      note: "The preview shows the two states side by side; press either one to switch it.",
    },
    {
      title: "Ghost",
      description: "The default has the neutral fill; ghost has none, for a quiet row. Pressed looks the same on both.",
      code: [
        '<Toggle variant="ghost" icon="text-b" label="Bold" defaultPressed />',
        '<Toggle variant="ghost" icon="text-italic" label="Italic" />',
      ].join("\n"),
      render: () => h("div", {style: row},
        h(Toggle, {variant: "ghost", icon: "text-b", label: "Bold", defaultPressed: true}),
        h(Toggle, {variant: "ghost", icon: "text-italic", label: "Italic"})),
    },
    eixo({
      titulo: "Sizes",
      descricao: "The button scale — sm, md, lg and xl — so a toggle sits level with the controls beside it. md is the default; xl is the 50 button.",
      Comp: Toggle, nome: "Toggle", prop: "size", valores: ["sm", "md", "lg", "xl"],
      filho: (v) => ({sm: "Small", md: "Medium", lg: "Large", xl: "Extra large"})[v],
    }),
    cada({titulo: "The colour of the on state", descricao: "pressedStyle (ADR-0084): brand — the yellow of the primary button, "
      + "the default — neutral (grey) or contrast (graphite, inverted). Each button below is pressed.",
      valores: ["brand", "neutral", "contrast"],
      codigo: v => `<Toggle icon="text-b" label="Bold" defaultPressed pressedStyle="${v}" />`,
      peca: v => h(Toggle, {icon: "text-b", label: `Bold, ${v}`, defaultPressed: true, pressedStyle: v})}),
    {
      title: "Area",
      description: "area makes the toggle an area around a block — a thumbnail, an icon with its name. With variant=\"ghost\" " +
        "it has no fill (the yellow at 18% on hover, 42% when on); with the default, the grey fill and, when on, the solid " +
        "yellow. area=\"pill\" keeps it as wide as its content.",
      code: '<Toggle area variant="ghost" defaultPressed label="Header">\n  <Thumbnail part="header" />\n</Toggle>\n<Toggle area label="Light"><Icon name="sun" /> Light</Toggle>\n<Toggle area="pill" variant="ghost">Sidebar</Toggle>',
      render: () => h("div", {style: {display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "var(--space-3)"}},
        h(Toggle, {area: true, variant: "ghost", defaultPressed: true, label: "Header", style: {inlineSize: "8rem"}},
          h("span", {style: {display: "block", blockSize: "var(--space-16)", borderRadius: "var(--radius-lg)", background: "var(--card)"}})),
        h(Toggle, {area: true, label: "Light", style: {inlineSize: "8rem"}}, h("span", {style: {display: "grid", justifyItems: "center", gap: "var(--space-2)", padding: "var(--space-3)"}}, "Light")),
        h(Toggle, {area: "pill", variant: "ghost"}, h("span", {style: {paddingInline: "var(--space-3)"}}, "Sidebar"))),
    },
  ],
};
