// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";
export default [
  {
    variant: "Bounded",
    name: "A quantity with a floor and a ceiling",
    description: "The steppers are for small corrections and the keyboard is for big ones — both hit the same bounds. Bounds on the field, not in a message after submit: the refusal should never be a surprise.",
    uses: ["NumberField"],
    code: `<NumberField label="Retries" defaultValue={3} min={0} max={10} step={1} />`,
    render: () => h("div", {style: {width: "min(280px,100%)"}},
      h(A.NumberField, {label: "Retries", defaultValue: 3, min: 0, max: 10, step: 1})),
  },
  {
    variant: "Scrub handle",
    name: "A wide range you drag instead of clicking forty times",
    description: "Opacity 0–100, a width in pixels: ranges where the steppers are the wrong instrument. `scrubbable` adds a handle that changes the value as you pull it — the gesture every drawing tool has in a numeric field. It is opt-in and strictly additive: the buttons, the arrow keys and Home/End are untouched, and the handle is hidden from assistive technology because dragging is a pointer gesture with no keyboard equivalent to promise. Use `scrubDirection=\"vertical\"` when the fields are stacked, as in a width/height pair.",
    uses: ["NumberField"],
    code: `<NumberField label="Opacity" defaultValue={80} min={0} max={100} scrubbable />`,
    render: () => h("div", {style: {width: "min(280px,100%)"}},
      h(A.NumberField, {label: "Opacity", defaultValue: 80, min: 0, max: 100, scrubbable: true})),
  },
];
