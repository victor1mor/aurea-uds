import {createElement as h, useState} from "react";
import {ColorSwatch, Icon} from "../../../packages/react/dist/index.js";

const row = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-3)"};

// 0.32.0, ADR-0069: os exemplos da referência para a amostra (transparência, nome) e para o grupo de escolha
// (tamanhos, cor desligada, em coluna, valor de partida, com o valor, outra marca).
const PALETA = [
  {color: "#0485f7", label: "Ocean"}, {color: "#16a34a", label: "Forest"}, {color: "#f0c200", label: "Aurea yellow"},
  {color: "#e11d48", label: "Ruby"}, {color: "#7c3aed", label: "Violet"},
];
const PALETA_CODIGO = `[
    {color: "#0485f7", label: "Ocean"},
    {color: "#16a34a", label: "Forest"},
    {color: "#f0c200", label: "Aurea yellow"},
    {color: "#e11d48", label: "Ruby"},
    {color: "#7c3aed", label: "Violet"},
  ]`;

function EscolhaComOValor() {
  const [cor, setCor] = useState("#e11d48");
  return h("div", {style: {display: "grid", gap: "var(--space-3)", justifyItems: "start"}},
    h(ColorSwatch, {name: "label-colour", label: "Label colour", options: PALETA, value: cor, onChange: (e) => setCor(e.target.value)}),
    h("code", null, cor));
}

export default {
  description:
    "ColorSwatch shows a colour as a round sample. A thin ring inside keeps a colour that matches " +
    "the background visible. It is an image for screen readers, named by label.",

  install: 'import {ColorSwatch} from "@aurea-uds/react";',

  features: [
    "Any CSS colour: hex, oklch(), or a token such as var(--primary).",
    "Five sizes from the reference library: 16, 24, 32, 36 and 40.",
    "Round only. A transparent colour shows a checkerboard underneath.",
    "role=\"img\" named by label; without it, the colour value is read.",
    "With options, a group of swatches to pick one from: native radio buttons, so the choice and the arrows work without JavaScript.",
  ],

  examples: [
    {
      title: "Sizes",
      description: "xs to xl.",
      code: [
        '<ColorSwatch color="#f0c200" size="xs" label="Aurea yellow" />',
        '<ColorSwatch color="#f0c200" size="sm" label="Aurea yellow" />',
        '<ColorSwatch color="#f0c200" label="Aurea yellow" />',
        '<ColorSwatch color="#f0c200" size="lg" label="Aurea yellow" />',
        '<ColorSwatch color="#f0c200" size="xl" label="Aurea yellow" />',
      ].join("\n"),
      render: () => h("div", {style: row},
        ...["xs", "sm", "md", "lg", "xl"].map((size) =>
          h(ColorSwatch, {key: size, color: "#f0c200", size, label: "Aurea yellow"}))),
    },
    {
      title: "A palette",
      description: "Tokens work too; the ring keeps the background colour visible.",
      code: [
        '<ColorSwatch color="var(--primary)" label="Primary" />',
        '<ColorSwatch color="var(--success)" label="Success" />',
        '<ColorSwatch color="var(--background)" label="Background" />',
      ].join("\n"),
      render: () => h("div", {style: row},
        h(ColorSwatch, {color: "var(--primary)", label: "Primary"}),
        h(ColorSwatch, {color: "var(--success)", label: "Success"}),
        h(ColorSwatch, {color: "var(--info)", label: "Info"}),
        h(ColorSwatch, {color: "var(--destructive)", label: "Danger"}),
        h(ColorSwatch, {color: "var(--background)", label: "Background"})),
    },
    {
      title: "Pick from a palette",
      description: "options turns the swatch into a group to pick one colour. The chosen one gets the ring in its own colour and a check in the ink that contrasts most.",
      code: `<ColorSwatch
  name="accent"
  label="Accent colour"
  defaultValue="#0485f7"
  options={[
    {color: "#0485f7", label: "Ocean"},
    {color: "#16a34a", label: "Forest"},
    {color: "#f0c200", label: "Aurea yellow"},
    {color: "#e11d48", label: "Ruby"},
    {color: "#7c3aed", label: "Violet"},
  ]}
/>`,
      render: () => h(ColorSwatch, {name: "accent", label: "Accent colour", defaultValue: "#0485f7", options: [
        {color: "#0485f7", label: "Ocean"}, {color: "#16a34a", label: "Forest"}, {color: "#f0c200", label: "Aurea yellow"},
        {color: "#e11d48", label: "Ruby"}, {color: "#7c3aed", label: "Violet"}]}),
    },
    {
      title: "Transparency",
      description: "A colour with alpha below 1 — hex of eight digits, rgba(), hsla() — shows the checkerboard underneath.",
      code: [
        '<ColorSwatch color="#0485f7" label="Solid" />',
        '<ColorSwatch color="#0485f7aa" label="Two thirds" />',
        '<ColorSwatch color="rgba(4, 133, 247, 0.35)" label="A third" />',
        '<ColorSwatch color="#0485f700" label="Transparent" />',
      ].join("\n"),
      render: () => h("div", {style: row},
        h(ColorSwatch, {color: "#0485f7", label: "Solid"}),
        h(ColorSwatch, {color: "#0485f7aa", label: "Two thirds"}),
        h(ColorSwatch, {color: "rgba(4, 133, 247, 0.35)", label: "A third"}),
        h(ColorSwatch, {color: "#0485f700", label: "Transparent"})),
    },
    {
      title: "A name for the screen reader",
      description: "The swatch is an image. label names it; without it, the screen reader reads the colour's code.",
      code: [
        '<ColorSwatch color="#16a34a" label="Forest green" />',
        '<ColorSwatch color="#16a34a" />',
      ].join("\n"),
      render: () => h("div", {style: row},
        h(ColorSwatch, {color: "#16a34a", label: "Forest green"}),
        h(ColorSwatch, {color: "#16a34a"})),
    },
    {
      title: "Options in sizes",
      description: "The group takes the same five sizes.",
      code: `<ColorSwatch size="sm" name="small" label="Small" defaultValue="#0485f7" options={options} />
<ColorSwatch name="medium" label="Medium" defaultValue="#0485f7" options={options} />
<ColorSwatch size="xl" name="large" label="Large" defaultValue="#0485f7" options={options} />`,
      render: () => h("div", {style: {display: "grid", gap: "var(--space-4)"}},
        h(ColorSwatch, {size: "sm", name: "small", label: "Small", defaultValue: "#0485f7", options: PALETA}),
        h(ColorSwatch, {name: "medium", label: "Medium", defaultValue: "#0485f7", options: PALETA}),
        h(ColorSwatch, {size: "xl", name: "large", label: "Large", defaultValue: "#0485f7", options: PALETA})),
    },
    {
      title: "A colour you cannot pick",
      description: "disabled on one option: the others stay available. disabled on the group turns off all of them.",
      code: `<ColorSwatch name="plan" label="Plan colour" defaultValue="#0485f7" options={[
    {color: "#0485f7", label: "Ocean"},
    {color: "#16a34a", label: "Forest"},
    {color: "#f0c200", label: "Aurea yellow", disabled: true},
    {color: "#e11d48", label: "Ruby"},
  ]} />`,
      render: () => h(ColorSwatch, {name: "plan", label: "Plan colour", defaultValue: "#0485f7", options: [
        {color: "#0485f7", label: "Ocean"}, {color: "#16a34a", label: "Forest"},
        {color: "#f0c200", label: "Aurea yellow", disabled: true}, {color: "#e11d48", label: "Ruby"}]}),
    },
    {
      title: "In a column",
      description: "layout=\"stack\": one under the other.",
      code: `<ColorSwatch layout="stack" name="stack" label="Status colour" defaultValue="#16a34a"
  options={${PALETA_CODIGO}} />`,
      render: () => h(ColorSwatch, {layout: "stack", name: "stack", label: "Status colour", defaultValue: "#16a34a", options: PALETA}),
    },
    {
      title: "Starting value",
      description: "defaultValue picks one when the page opens; without it, none is picked.",
      code: `<ColorSwatch name="start" label="Theme colour" defaultValue="#7c3aed" options={options} />
<ColorSwatch name="none" label="No colour yet" options={options} />`,
      render: () => h("div", {style: {display: "grid", gap: "var(--space-4)"}},
        h(ColorSwatch, {name: "start", label: "Theme colour", defaultValue: "#7c3aed", options: PALETA}),
        h(ColorSwatch, {name: "none", label: "No colour yet", options: PALETA})),
    },
    {
      title: "Options with the value",
      description: "Controlled: onChange is the browser's event, as in Radio — event.target.value is the colour.",
      code: `const [colour, setColour] = useState("#e11d48");

<ColorSwatch name="label-colour" label="Label colour" value={colour}
  onChange={(e) => setColour(e.target.value)} options={${PALETA_CODIGO}} />`,
      embed: true,
      render: () => h(EscolhaComOValor),
    },
    {
      title: "Another mark",
      description: "indicator replaces the check on the chosen colour; it gets the ink that contrasts most.",
      code: `<ColorSwatch name="favourite" label="Favourite colour" defaultValue="#e11d48"
  indicator={<Icon name="heart" />} options={options} />`,
      render: () => h(ColorSwatch, {name: "favourite", label: "Favourite colour", defaultValue: "#e11d48",
        indicator: h(Icon, {name: "heart"}), options: PALETA}),
    },
  ],
};
