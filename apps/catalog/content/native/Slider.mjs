// O Slider do nativo no site (bloco 1, o 5-A — 23/10/2026). Todo valor das props do tipo em exemplo. Arrastar, tocar no
// trilho e o leitor de tela (um passo por gesto) funcionam aqui, pelo `react-native-web`.
import {createElement as h, useState} from "react";
import {Slider, Text} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const largo = {width: "min(24rem, 100%)"};
const coluna = {display: "grid", gap: "var(--space-6)", width: "min(24rem, 100%)"};

// Controlado: o valor mora na tela; `onValueCommitted` marca o momento de salvar (ao soltar a alça).
function Controlado() {
  const [volume, setVolume] = useState(40);
  const [salvo, setSalvo] = useState(40);
  return h("div", {style: {display: "grid", gap: "var(--space-2)", ...largo}},
    h(Slider, {label: "Volume", value: volume, onValueChange: setVolume, onValueCommitted: setSalvo}),
    h(Text, {tone: "muted", size: "xs"}, `Saved: ${salvo}`));
}
function Faixa() {
  const [faixa, setFaixa] = useState([200, 800]);
  return h("div", {style: largo}, h(Slider, {label: "Price", value: faixa, onValueChange: setFaixa,
    min: 0, max: 1000, step: 10, format: {style: "currency", currency: "USD", maximumFractionDigits: 0},
    locale: "en-US", thumbLabels: ["Minimum price", "Maximum price"]}));
}

export default {
  install: 'import {Slider} from "@aurea-uds/native";',
  api: {
    value: "Controlled: a number, or a list of two for a range with two thumbs.",
    defaultValue: "The starting value, uncontrolled — a number, or a list of two.",
    min: "The lowest value. 0 by default, as on the web.",
    max: "The highest value. 100 by default.",
    step: "The step from min. 1 by default.",
    orientation: "horizontal, or vertical: the vertical one takes the height of its parent, never under 160.",
    format: "Intl.NumberFormat options for the value shown and announced — currency, percent, a unit.",
    locale: "The Intl locale. Without it, the device's.",
    style: "Style of the whole slider.",
    testID: "Test id of the slider.",
  },
  examples: [
    {
      title: "Usage",
      description: "The label and the value on top, the track with the fill, a capsule thumb. Each thumb is adjustable: the screen reader reads the value and moves it a step per gesture.",
      code: `<Slider label="Volume" defaultValue={30} />`,
      render: () => h("div", {style: largo}, h(Slider, {label: "Volume", defaultValue: 30})),
    },
    cada({titulo: "Orientation", descricao: "The vertical slider fills its parent's height — give the parent one.",
      valores: ["horizontal", "vertical"], estilo: {display: "flex", flexWrap: "wrap", gap: "var(--space-6)", alignItems: "center"},
      codigo: v => v === "vertical"
        ? `<View style={{height: 200}}>\n  <Slider orientation="vertical" label="Bass" defaultValue={60} />\n</View>`
        : `<Slider orientation="horizontal" label="Treble" defaultValue={60} />`,
      peca: v => v === "vertical"
        ? h("div", {style: {height: "12.5rem"}}, h(Slider, {orientation: v, label: "Bass", defaultValue: 60}))
        : h("div", {style: {width: "min(16rem, 100%)"}}, h(Slider, {orientation: v, label: "Treble", defaultValue: 60}))}),
    {
      title: "Controlled",
      description: "onValueChange runs on every step; onValueCommitted when the thumb is let go, a tap lands on the track, or the screen reader steps — the moment to save.",
      code: `const [volume, setVolume] = useState(40);

<Slider label="Volume" value={volume}
  onValueChange={setVolume} onValueCommitted={save} />`,
      render: () => h(Controlado),
    },
    {
      title: "A range",
      description: "Two values give two thumbs; one stops at the other. thumbLabels names each one, and format and locale write the money.",
      code: `const [range, setRange] = useState([200, 800]);

<Slider label="Price" value={range} onValueChange={setRange}
  min={0} max={1000} step={10}
  format={{style: "currency", currency: "USD", maximumFractionDigits: 0}} locale="en-US"
  thumbLabels={["Minimum price", "Maximum price"]} />`,
      render: () => h(Faixa),
    },
    {
      title: "Label, value and disabled",
      description: "labelHidden keeps the name for the screen reader only; showValue={false} hides the number; disabled stops the slider.",
      code: `<Slider label="Brightness" labelHidden defaultValue={70} />
<Slider label="Contrast" showValue={false} defaultValue={50} />
<Slider label="Locked" disabled defaultValue={20} />`,
      render: () => h("div", {style: coluna},
        h(Slider, {label: "Brightness", labelHidden: true, defaultValue: 70}),
        h(Slider, {label: "Contrast", showValue: false, defaultValue: 50}),
        h(Slider, {label: "Locked", disabled: true, defaultValue: 20})),
    },
  ],
};
