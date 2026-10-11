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
  ],
};
