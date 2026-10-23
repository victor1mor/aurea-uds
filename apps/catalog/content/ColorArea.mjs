// 0.32.0, ADR-0069 — o `ColorArea`. As prévias são VIVAS (`embed`): arrastar, tocar e as teclas funcionam
// dentro da moldura, e é isso que a varredura mede.
import {createElement as h, useState} from "react";
import {ColorArea, ColorSwatch} from "../../../packages/react/dist/index.js";
import {jsxProp} from "./_eixos.mjs";

const coluna = {display: "grid", gap: "var(--space-3)", justifyItems: "start", width: "min(100%, 14rem)"};

// Os pares de canais, dois por espaço de cor: cada canal da ficha aparece ATRAVESSADO (x) e EM PÉ (y). O código e o
// desenho saem desta lista.
const PARES = [
  {colorSpace: "hsb", xChannel: "saturation", yChannel: "brightness", defaultValue: "#0485f7", "aria-label": "HSB, saturation and brightness"},
  {colorSpace: "hsb", xChannel: "brightness", yChannel: "hue", defaultValue: "#0485f7", "aria-label": "HSB, brightness and hue"},
  {colorSpace: "hsl", xChannel: "saturation", yChannel: "lightness", defaultValue: "#16a34a", "aria-label": "HSL, saturation and lightness"},
  {colorSpace: "hsl", xChannel: "lightness", yChannel: "hue", defaultValue: "#16a34a", "aria-label": "HSL, lightness and hue"},
  {colorSpace: "rgb", xChannel: "green", yChannel: "red", defaultValue: "#e11d48", "aria-label": "RGB, green and red"},
  {colorSpace: "rgb", xChannel: "blue", yChannel: "green", defaultValue: "#e11d48", "aria-label": "RGB, blue and green"},
];

function ComOValor() {
  const [cor, setCor] = useState("#0485f7");
  return h("div", {style: coluna},
    h(ColorArea, {value: cor, onValueChange: setCor, "aria-label": "Accent"}),
    h("div", {style: {display: "flex", alignItems: "center", gap: "var(--space-2)"}},
      h(ColorSwatch, {color: cor, label: "Accent"}),
      h("code", null, cor)));
}

export default {
  description:
    "ColorArea is the square where you pick two channels of a colour for the third one fixed — saturation (across) " +
    "and brightness (up) by default, or any pair of HSB, HSL or RGB. It works by pointer, touch and keyboard, and " +
    "the screen reader hears the channels and the colour's name.",

  install: 'import {ColorArea} from "@aurea-uds/react";',

  features: [
    "The value is hex (#rrggbb), like the browser's colour input: value, defaultValue, onValueChange, onValueCommitted.",
    "Arrows move one step (Shift: ten); Page Up/Down change the brightness, Home/End the saturation.",
    "Two hidden range inputs, one per axis, announced as a 2D slider, with the colour's name in the app's language.",
    "colorSpace, xChannel and yChannel choose the pair: hue and saturation in HSL, red and blue in RGB…",
    "showDots draws a grid of dots over the area, to see the position.",
    "Dragging to grey keeps the hue: the area does not jump to red.",
  ],

  examples: [
    {
      title: "Pick a colour",
      description: "Drag, tap or use the arrows.",
      code: `<ColorArea defaultValue="#0485f7" aria-label="Fill" />`,
      embed: true,
      render: () => h("div", {style: coluna}, h(ColorArea, {defaultValue: "#0485f7", "aria-label": "Fill"})),
    },
    {
      title: "With dots",
      description: "showDots: a grid of dots over the area.",
      code: `<ColorArea defaultValue="#7c3aed" showDots aria-label="Fill" />`,
      embed: true,
      render: () => h("div", {style: coluna}, h(ColorArea, {defaultValue: "#7c3aed", showDots: true, "aria-label": "Fill"})),
    },
    {
      title: "Colour spaces and channels",
      description: "Any pair of channels, and the third one stays fixed: hue and saturation in HSL, red and blue in RGB, hue and brightness in HSB.",
      code: `<ColorArea colorSpace="hsl" xChannel="hue" yChannel="saturation" defaultValue="hsl(200, 80%, 50%)" aria-label="HSL" />
<ColorArea colorSpace="rgb" xChannel="red" yChannel="blue" defaultValue="rgb(120, 40, 220)" aria-label="RGB" />
<ColorArea xChannel="hue" yChannel="brightness" defaultValue="#16a34a" aria-label="HSB" />`,
      embed: true,
      render: () => h("div", {style: {display: "flex", flexWrap: "wrap", gap: "var(--space-6)"}},
        h(ColorArea, {colorSpace: "hsl", xChannel: "hue", yChannel: "saturation", defaultValue: "hsl(200, 80%, 50%)", "aria-label": "HSL"}),
        h(ColorArea, {colorSpace: "rgb", xChannel: "red", yChannel: "blue", defaultValue: "rgb(120, 40, 220)", "aria-label": "RGB"}),
        h(ColorArea, {xChannel: "hue", yChannel: "brightness", defaultValue: "#16a34a", "aria-label": "HSB"})),
    },
    {
      title: "Disabled",
      description: "The area does not move, and the keyboard skips it.",
      code: `<ColorArea defaultValue="#e11d48" disabled aria-label="Fill" />`,
      render: () => h("div", {style: coluna}, h(ColorArea, {defaultValue: "#e11d48", disabled: true, "aria-label": "Fill"})),
    },
    {
      title: "With the value",
      description: "Controlled: the swatch and the code follow the area.",
      code: `const [colour, setColour] = useState("#0485f7");

<ColorArea value={colour} onValueChange={setColour} aria-label="Accent" />
<ColorSwatch color={colour} label="Accent" />`,
      embed: true,
      render: () => h(ComOValor),
    },
    {
      title: "Every channel on each axis",
      description: "Two areas per colour space, so each channel shows up across and up. In each area the channel "
        + "left out is the one that stays fixed.",
      code: PARES.map((p) => `<ColorArea ${Object.entries(p).map(([k, v]) => jsxProp(k, v)).join(" ")} />`).join("\n"),
      embed: true,
      render: () => h("div", {style: {display: "flex", flexWrap: "wrap", gap: "var(--space-6)"}},
        ...PARES.map((p) => h(ColorArea, {key: p["aria-label"], ...p}))),
    },
  ],
};
