import {createElement as h} from "react";
import {Range, Field, Input} from "../../../packages/react/dist/index.js";

const stack = {display: "grid", gap: "var(--space-4)", width: "min(420px, 100%)"};
const row = {display: "flex", alignItems: "center", gap: "var(--space-3)"};

export default {
  description:
    "Range is a value picked along a line: volume, opacity, a threshold. It is the native input, " +
    "themed by tokens — the drag, the arrow keys and the touch behaviour are the platform's. Use it " +
    "when the approximate value is the point; when the exact number matters, pair it with a field.",

  install: 'import {Range, Field} from "@aurea-uds/react";',

  features: [
    "Native input: dragging, arrow keys, Home and End all work without a line of our JS.",
    "The thumb and the track wear the tokens — the accent colour is the brand's, in both themes.",
    "min, max and step pass through; the browser enforces them.",
    "Show the number next to it when the value is meant to be read, not only felt.",
    "Two thumbs (a min–max band) is not this component: use two fields until a real demand appears.",
  ],

  examples: [
    {
      title: "With a label",
      description: "The simplest form: a labelled slider from 0 to 100.",
      code: '<Field label="Volume"><Range defaultValue={60} /></Field>',
      render: () => h("div", {style: stack},
        h(Field, {label: "Volume"}, h(Range, {defaultValue: 60}))),
    },
    {
      title: "With the number",
      description: "When the exact value matters, the slider sets it and the field states it.",
      code: [
        '<div className="cluster">',
        '  <Range min={0} max={100} defaultValue={72} />',
        '  <Input type="number" defaultValue={72} min={0} max={100} />',
        '</div>',
      ].join("\n"),
      // Dois controles para o MESMO valor precisam de DOIS nomes: o Field nomeia o grupo, não
      // cada um. Antes do AUD-0001 os dois herdavam "Quality" do `<label>` que os envolvia — o
      // mesmo nome para o slider e para o campo —, e ao virar grupo os dois ficaram anônimos.
      // Quem achou foi o axe do `catalog-sweep`, com duas violações de `label` nesta página.
      render: () => h("div", {style: stack},
        h(Field, {label: "Quality"},
          h("div", {style: row},
            h("div", {style: {flex: 1}}, h(Range, {min: 0, max: 100, defaultValue: 72, "aria-label": "Quality"})),
            h("div", {style: {width: "84px"}}, h(Input, {type: "number", defaultValue: 72, min: 0, max: 100, "aria-label": "Quality, exact value"}))))),
    },
    {
      title: "Steps",
      description: "A coarse step turns a continuous line into a small set of allowed values.",
      code: '<Range min={0} max={4} step={1} defaultValue={2} />',
      render: () => h("div", {style: stack},
        h(Field, {label: "Density", hint: "Five steps"}, h(Range, {min: 0, max: 4, step: 1, defaultValue: 2}))),
    },
    {
      title: "Disabled",
      description: "Locked value: still readable, not draggable.",
      code: '<Range defaultValue={30} disabled />',
      render: () => h("div", {style: stack},
        h(Field, {label: "Threshold (locked)"}, h(Range, {defaultValue: 30, disabled: true}))),
    },
  ],
};
