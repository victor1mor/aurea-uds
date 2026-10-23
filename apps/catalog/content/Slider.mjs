import {createElement as h, useState} from "react";
import {ColorSwatch, Slider} from "../../../packages/react/dist/index.js";

const col = {display: "grid", gap: "var(--space-6)", width: "100%", maxWidth: "24rem"};

// As trilhas de cor (0.32.0, ADR-0069): o valor é a COR, e várias trilhas repartem a mesma — os exemplos da
// referência (o matiz, desligada, de pé, com o valor, os canais do HSL, o alfa e o RGB).
function CorComOValor() {
  const [cor, setCor] = useState("hsl(30, 100%, 50%)");
  return h("div", {style: col},
    h(Slider, {label: "Hue", channel: "hue", value: cor, onValueChange: setCor}),
    h("div", {style: {display: "flex", alignItems: "center", gap: "var(--space-2)"}},
      h(ColorSwatch, {color: cor, label: "The colour"}), h("code", null, cor)));
}

function Canais({canais, inicio, espaco}) {
  const [cor, setCor] = useState(inicio);
  return h("div", {style: col},
    ...canais.map(([canal, nome]) => h(Slider, {key: canal, label: nome, channel: canal, colorSpace: espaco, value: cor, onValueChange: setCor})),
    h("div", {style: {display: "flex", alignItems: "center", gap: "var(--space-2)"}},
      h(ColorSwatch, {color: cor, label: "The colour"}), h("code", null, cor)));
}

// Um `colorSpace` só para todas as trilhas (o catálogo fiel, 23/10/2026): as três do RGB e o matiz, que lê `rgb` como
// `hsb` — o que a ficha promete. O código e o desenho saem desta lista.
const RGB_E_MATIZ = [["hue", "Hue"], ["red", "Red"], ["green", "Green"], ["blue", "Blue"]];

export default {
  description:
    "Slider picks a number by dragging a thumb along a track: label and value on top, the track with " +
    "its fill, a capsule thumb in the brand colour. One value or a range of two, horizontal or vertical, with the number " +
    "written by the platform's Intl. It speaks numbers — onValueChange(value) — where Range speaks the " +
    "browser's change event.",

  install: 'import {Slider} from "@aurea-uds/react";',

  features: [
    "The label names the thumbs; with two values, thumbLabels gives each one its own name.",
    "Arrows step, Page Up/Down and Shift + arrow take the large step, Home and End jump to the ends.",
    "onValueChange on every step; onValueCommitted when the thumb is released — the moment to save.",
    "format and locale write the value (percent, currency…) with Intl, as NumberField does.",
    "Range stays for the browser's own slider, with its change event.",
    "channel makes it a colour track — hue, saturation, brightness, lightness, red, green, blue or alpha: painted with the channel, the thumb in the colour.",
    "On a colour track the value is the colour (hex, rgb(), hsl(), hsb()), so several tracks share one colour; onValueChange gives the hex.",
  ],

  examples: [
    {
      title: "One value",
      description: "The value sits next to the label and follows the thumb.",
      code: '<Slider label="Volume" defaultValue={40} />',
      render: () => h("div", {style: col}, h(Slider, {label: "Volume", defaultValue: 40})),
    },
    {
      title: "A range of two",
      description: "Pass a list: two thumbs, and the fill between them. Each thumb has its own name.",
      code: '<Slider label="Price" defaultValue={[200, 800]} min={0} max={1000} step={50}\n  thumbLabels={["Minimum", "Maximum"]} format={{style: "currency", currency: "BRL"}} locale="pt-BR" />',
      render: () => h("div", {style: col}, h(Slider, {label: "Price", defaultValue: [200, 800], min: 0, max: 1000, step: 50,
        thumbLabels: ["Minimum", "Maximum"], format: {style: "currency", currency: "BRL"}, locale: "pt-BR"})),
    },
    {
      title: "Formatted",
      description: "A percentage, written by Intl. The stored value stays the raw number.",
      code: '<Slider label="Discount" defaultValue={0.25} min={0} max={1} step={0.05} format={{style: "percent"}} />',
      render: () => h("div", {style: col}, h(Slider, {label: "Discount", defaultValue: 0.25, min: 0, max: 1, step: 0.05, format: {style: "percent"}})),
    },
    {
      title: "Vertical",
      description: "Value on top, track in the middle, label below. The height is --range-vertical-size.",
      code: '<Slider label="Level" orientation="vertical" defaultValue={60} />',
      render: () => h("div", {style: {display: "flex", gap: "var(--space-8)"}},
        h(Slider, {label: "Level", orientation: "vertical", defaultValue: 60}),
        h(Slider, {label: "Bass", orientation: "vertical", defaultValue: 30})),
    },
    {
      title: "Colour track",
      description: "The hue, from 0 to 360 degrees. The screen reader hears the colour's name with the number.",
      code: '<Slider label="Hue" channel="hue" defaultValue="hsl(210, 100%, 50%)" />',
      embed: true,
      render: () => h("div", {style: col}, h(Slider, {label: "Hue", channel: "hue", defaultValue: "hsl(210, 100%, 50%)"})),
    },
    {
      title: "Colour track, disabled",
      description: "Unavailable, not hidden.",
      code: '<Slider label="Hue" channel="hue" defaultValue="hsl(120, 100%, 40%)" disabled />',
      render: () => h("div", {style: col}, h(Slider, {label: "Hue", channel: "hue", defaultValue: "hsl(120, 100%, 40%)", disabled: true})),
    },
    {
      title: "Colour track, vertical",
      description: "Standing up, like the number slider.",
      code: `<Slider label="Hue" channel="hue" orientation="vertical" defaultValue="hsl(280, 90%, 55%)" />
<Slider label="Brightness" channel="brightness" orientation="vertical" defaultValue="hsl(280, 90%, 55%)" />`,
      embed: true,
      render: () => h("div", {style: {display: "flex", gap: "var(--space-8)"}},
        h(Slider, {label: "Hue", channel: "hue", orientation: "vertical", defaultValue: "hsl(280, 90%, 55%)"}),
        h(Slider, {label: "Brightness", channel: "brightness", orientation: "vertical", defaultValue: "hsl(280, 90%, 55%)"})),
    },
    {
      title: "Colour track with the value",
      description: "Controlled: the value is the colour, and onValueChange gives the hex.",
      code: `const [colour, setColour] = useState("hsl(30, 100%, 50%)");

<Slider label="Hue" channel="hue" value={colour} onValueChange={setColour} />
<ColorSwatch color={colour} label="The colour" />`,
      embed: true,
      render: () => h(CorComOValor),
    },
    {
      title: "HSL channels",
      description: "Three tracks share one colour: each one is painted with the other two.",
      code: `const [colour, setColour] = useState("hsl(200, 80%, 50%)");

<Slider label="Hue" channel="hue" colorSpace="hsl" value={colour} onValueChange={setColour} />
<Slider label="Saturation" channel="saturation" colorSpace="hsl" value={colour} onValueChange={setColour} />
<Slider label="Lightness" channel="lightness" value={colour} onValueChange={setColour} />`,
      embed: true,
      render: () => h(Canais, {inicio: "hsl(200, 80%, 50%)", espaco: "hsl",
        canais: [["hue", "Hue"], ["saturation", "Saturation"], ["lightness", "Lightness"]]}),
    },
    {
      title: "Transparency",
      description: "The alpha track, from transparent to solid, over a checkerboard. With transparency, the hex has eight digits.",
      code: `const [colour, setColour] = useState("rgba(4, 133, 247, 0.6)");

<Slider label="Alpha" channel="alpha" value={colour} onValueChange={setColour} />`,
      embed: true,
      render: () => h(Canais, {inicio: "rgba(4, 133, 247, 0.6)", canais: [["alpha", "Alpha"]]}),
    },
    {
      title: "RGB channels",
      description: "Red, green and blue, from 0 to 255.",
      code: `const [colour, setColour] = useState("rgb(240, 194, 0)");

<Slider label="Red" channel="red" value={colour} onValueChange={setColour} />
<Slider label="Green" channel="green" value={colour} onValueChange={setColour} />
<Slider label="Blue" channel="blue" value={colour} onValueChange={setColour} />`,
      embed: true,
      render: () => h(Canais, {inicio: "rgb(240, 194, 0)", canais: [["red", "Red"], ["green", "Green"], ["blue", "Blue"]]}),
    },
    {
      title: "Disabled",
      description: "Unavailable, not hidden.",
      code: '<Slider label="Brightness" defaultValue={70} disabled />',
      render: () => h("div", {style: col}, h(Slider, {label: "Brightness", defaultValue: 70, disabled: true})),
    },
    {
      title: "One colour space for a whole picker",
      description: "colorSpace=\"rgb\" on every track of a picker: red, green and blue are RGB channels already, and "
        + "beside them a hue track reads rgb as hsb. So one value serves every track, and the picker passes it once.",
      code: `const [colour, setColour] = useState("rgb(4, 133, 247)");

${RGB_E_MATIZ.map(([canal, nome]) =>
  `<Slider label="${nome}" channel="${canal}" colorSpace="rgb" value={colour} onValueChange={setColour} />`).join("\n")}
<ColorSwatch color={colour} label="The colour" />`,
      embed: true,
      render: () => h(Canais, {inicio: "rgb(4, 133, 247)", espaco: "rgb", canais: RGB_E_MATIZ}),
    },
  ],
};
