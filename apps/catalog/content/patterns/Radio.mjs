// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";
export default [
  {
    variant: "Choice",
    name: "One answer out of a few",
    description: "Radios show every option at once, which is their whole advantage over a select — and their limit: past five or six the list stops being scannable and a select or combobox reads faster.",
    uses: ["Radio"],
    code: `<fieldset>
  <legend>Density</legend>
  <Radio name="density" label="Compact" />
  <Radio name="density" label="Comfortable" defaultChecked />
  <Radio name="density" label="Spacious" />
</fieldset>`,
    render: () => h("div", {style: {display: "flex", flexDirection: "column", gap: "var(--space-2)"}},
      h(A.Radio, {name: "d", label: "Compact"}),
      h(A.Radio, {name: "d", label: "Comfortable", defaultChecked: true}),
      h(A.Radio, {name: "d", label: "Spacious"})),
  },
];
