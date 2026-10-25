// 0.32.0, ADR-0069 — o `ColorPicker`. As prévias são VIVAS (`embed`): o gatilho abre a janela de verdade dentro
// da moldura, e a área, a trilha, as amostras e o campo do código funcionam.
import {createElement as h, useState} from "react";
import {ColorArea, ColorField, ColorPicker, Select, Slider} from "../../../packages/react/dist/index.js";

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

// "Com campos" e "com trilhas", como na referência: o conteúdo da janela montado por quem usa (`children`). As peças
// de cor de dentro, sem valor próprio, repartem a cor do seletor; o espaço de cor se escolhe num `Select`.
const CANAIS = {
  hsb: [["hue", "Hue"], ["saturation", "Saturation"], ["brightness", "Brightness"]],
  hsl: [["hue", "Hue"], ["saturation", "Saturation"], ["lightness", "Lightness"]],
  rgb: [["red", "Red"], ["green", "Green"], ["blue", "Blue"]],
};
const ESPACOS = [{value: "hsl", label: "HSL"}, {value: "hsb", label: "HSB"}, {value: "rgb", label: "RGB"}];

function ComCampos() {
  const [espaco, setEspaco] = useState("hsl");
  return h(ColorPicker, {label: "Pick a colour", defaultValue: "hsla(220, 90%, 50%, 0.8)"},
    h(ColorArea, null),
    h(Slider, {label: "Hue", channel: "hue"}),
    h(Select, {"aria-label": "Colour space", value: espaco, onValueChange: setEspaco, items: ESPACOS}),
    h("div", {style: {display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "var(--space-2)"}},
      ...CANAIS[espaco].map(([canal, nome]) =>
        h(ColorField, {key: canal, channel: canal, colorSpace: espaco, variant: "secondary", "aria-label": nome}))));
}

function ComTrilhas() {
  const [espaco, setEspaco] = useState("hsl");
  return h(ColorPicker, {label: "Pick a colour", defaultValue: "hsl(219, 58%, 93%)"},
    h(Select, {"aria-label": "Colour space", value: espaco, onValueChange: setEspaco, items: ESPACOS}),
    ...[...CANAIS[espaco], ["alpha", "Alpha"]].map(([canal, nome]) =>
      h(Slider, {key: canal, label: nome, channel: canal, colorSpace: espaco})));
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
    "The window can be assembled: children replaces the default content, and the colour pieces inside — ColorArea, Slider with channel, ColorField — share the picker's colour.",
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
  swatches={[{color: "#0485f7", label: "Ocean"}, {color: "#16a34a", label: "Forest"}]} />`,
      embed: true,
      render: () => h(ComOValor),
    },
    {
      title: "A closed palette",
      description: "variant=\"swatches\": only the swatches and the hex field.",
      code: `<ColorPicker label="Tag colour" variant="swatches" defaultValue="#16a34a"
  swatches={[{color: "#0485f7", label: "Ocean"}, {color: "#16a34a", label: "Forest"}]} />`,
      embed: true,
      render: () => h(ColorPicker, {label: "Tag colour", variant: "swatches", defaultValue: "#16a34a", swatches: PALETA}),
    },
    {
      title: "With fields",
      description: "The window assembled with children: the area, the hue, and one field per channel — the colour space chosen in a Select.",
      code: `const [space, setSpace] = useState<ColorSpace>("hsl");
const channels: Record<ColorSpace, ColorChannel[]> = {hsb: ["hue", "saturation", "brightness"], hsl: ["hue", "saturation", "lightness"], rgb: ["red", "green", "blue"]};

<ColorPicker label="Pick a colour" defaultValue="hsla(220, 90%, 50%, 0.8)">
  <ColorArea />
  <Slider label="Hue" channel="hue" />
  <Select aria-label="Colour space" value={space} onValueChange={(v) => setSpace(v as ColorSpace)}
    items={[{value: "hsl", label: "HSL"}, {value: "hsb", label: "HSB"}, {value: "rgb", label: "RGB"}]} />
  <div style={{display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "var(--space-2)"}}>
    {channels[space].map((channel) => (
      <ColorField key={channel} channel={channel} colorSpace={space} variant="secondary" aria-label={channel} />
    ))}
  </div>
</ColorPicker>`,
      embed: true,
      render: () => h(ComCampos),
    },
    {
      title: "With sliders",
      description: "One track per channel, transparency included — the colour space chosen in a Select.",
      code: `const [space, setSpace] = useState<ColorSpace>("hsl");
const channels: Record<ColorSpace, ColorChannel[]> = {hsb: ["hue", "saturation", "brightness"], hsl: ["hue", "saturation", "lightness"], rgb: ["red", "green", "blue"]};

<ColorPicker label="Pick a colour" defaultValue="hsl(219, 58%, 93%)">
  <Select aria-label="Colour space" value={space} onValueChange={(v) => setSpace(v as ColorSpace)}
    items={[{value: "hsl", label: "HSL"}, {value: "hsb", label: "HSB"}, {value: "rgb", label: "RGB"}]} />
  {[...channels[space], "alpha" as const].map((channel) => (
    <Slider key={channel} label={channel} channel={channel} colorSpace={space} />
  ))}
</ColorPicker>`,
      embed: true,
      render: () => h(ComTrilhas),
    },
  ],
};
