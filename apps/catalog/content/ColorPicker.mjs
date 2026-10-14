// 0.32.0, ADR-0069 — o `ColorPicker`. As prévias são VIVAS (`embed`): o gatilho abre a janela de verdade dentro
// da moldura, e a área, a trilha, as amostras e o campo do código funcionam.
import {createElement as h, useState} from "react";
import {ColorPicker} from "../../../packages/react/dist/index.js";

const PALETA = [
  {color: "#0485f7", label: "Ocean"}, {color: "#16a34a", label: "Forest"}, {color: "#f0c200", label: "Aurea yellow"},
  {color: "#e11d48", label: "Ruby"}, {color: "#7c3aed", label: "Violet"},
];

function ComOValor() {
  const [cor, setCor] = useState("#0485f7");
  return h("div", {style: {display: "grid", gap: "var(--space-2)", justifyItems: "start"}},
    h(ColorPicker, {label: "Brand colour", value: cor, onValueChange: setCor, swatches: PALETA}),
    h("code", null, cor));
}

export default {
  description:
    "ColorPicker is a swatch with a name that opens a window to pick a colour: the area, the hue track and the " +
    "hex field, which is always there. With swatches, ready colours too; as the swatches variation, a closed palette.",

  install: 'import {ColorPicker} from "@aurea-uds/react";',

  features: [
    "The value is hex (#rrggbb): value, defaultValue, onValueChange, onValueCommitted — like ColorArea and Slider.",
    "The hex field applies on Enter or when it loses focus; text that is not a colour goes back.",
    "Swatches without a label are named by the colour's name, in the app's language.",
    "variant=\"swatches\" is the closed palette: only the swatches and the hex field.",
    "Dragging to grey keeps the hue, and the hue track still moves the area.",
  ],

  examples: [
    {
      title: "Pick a colour",
      description: "The trigger shows the colour and the name; the window has the area, the hue and the code.",
      code: `<ColorPicker label="Brand colour" defaultValue="#0485f7" />`,
      embed: true,
      render: () => h(ColorPicker, {label: "Brand colour", defaultValue: "#0485f7"}),
    },
    {
      title: "With swatches",
      description: "Ready colours under the hue track. Controlled: the code follows.",
      code: `const [colour, setColour] = useState("#0485f7");

<ColorPicker label="Brand colour" value={colour} onValueChange={setColour}
  swatches={[{color: "#0485f7", label: "Ocean"}, {color: "#16a34a", label: "Forest"}, …]} />`,
      embed: true,
      render: () => h(ComOValor),
    },
    {
      title: "A closed palette",
      description: "variant=\"swatches\": only the swatches and the hex field.",
      code: `<ColorPicker label="Tag colour" variant="swatches" defaultValue="#16a34a"
  swatches={[{color: "#0485f7", label: "Ocean"}, {color: "#16a34a", label: "Forest"}, …]} />`,
      embed: true,
      render: () => h(ColorPicker, {label: "Tag colour", variant: "swatches", defaultValue: "#16a34a", swatches: PALETA}),
    },
  ],
};
