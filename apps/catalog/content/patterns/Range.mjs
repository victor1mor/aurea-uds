// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";
export default [
  {
    variant: "Setting",
    name: "A value with no exact number in mind",
    description: "A slider is for approximate values — volume, opacity, a threshold nobody types. When the exact figure matters, a NumberField is honest and a slider is guesswork with a nice handle.",
    uses: ["Range", "Field"],
    code: `<Field label="Similarity threshold" hint="Higher matches fewer, more confident results">
  <Range min={0} max={100} defaultValue={72} />
</Field>`,
    render: () => h("div", {style: {width: "min(360px,100%)"}},
      h(A.Field, {label: "Similarity threshold", hint: "Higher matches fewer, more confident results"},
        h(A.Range, {min: 0, max: 100, defaultValue: 72}))),
  },
];
