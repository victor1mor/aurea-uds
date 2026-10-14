import {createElement as h} from "react";
import {ColorSwatch} from "../../../packages/react/dist/index.js";

const row = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-3)"};

export default {
  description:
    "ColorSwatch shows a colour as a round sample. A thin ring inside keeps a colour that matches " +
    "the background visible. It is an image for screen readers, named by label.",

  install: 'import {ColorSwatch} from "@aurea-uds/react";',

  features: [
    "Any CSS colour: hex, oklch(), or a token such as var(--primary).",
    "Five sizes from the reference library: 16, 24, 32, 36 and 40.",
    "Round only, with no transparency checkerboard.",
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
  ],
};
