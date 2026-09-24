import {createElement as h} from "react";
import {Toggle} from "../../../packages/react/dist/index.js";

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
    + "whether the button describes what it IS or what it WILL DO. The rule is the APG's and Adobe "
    + "Spectrum's, and it is the one rule that decides between the two components.",
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
      code: '<Toggle icon="volume--mute" label="Mute" />',
      render: () => h("div", {style: row},
        h(Toggle, {icon: "volume--mute", label: "Mute"}),
        h(Toggle, {icon: "star", label: "Favourite", defaultPressed: true})),
      note: "This catalog page is static HTML, so the preview shows the two states side by side "
        + "instead of switching. Pressing is real in your app, not here.",
    },
  ],
};
