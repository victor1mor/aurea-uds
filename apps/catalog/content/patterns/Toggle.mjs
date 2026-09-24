// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";
export default [
  {
    variant: "Formatting",
    name: "A button that stays pressed",
    description: "Two states the user flips and reads back from the button itself. It is not a Switch: a switch applies a setting, a toggle marks the thing under the cursor.",
    uses: ["Toggle"],
    code: `<Toggle icon="text--bold" label="Bold" defaultPressed />
<Toggle icon="text--italic" label="Italic" />`,
    render: () => h("div", {style: {display: "flex", gap: "var(--space-1)"}},
      h(A.Toggle, {icon: "text--bold", label: "Bold", defaultPressed: true}),
      h(A.Toggle, {icon: "text--italic", label: "Italic"})),
  },
];
