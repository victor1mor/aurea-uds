// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";
export default [
  {
    variant: "Inline",
    name: "Waiting inside a button",
    description: "The label stays while the spinner runs — replacing it with a bare spinner loses what the user is waiting for. Decorative here, because the button already announces itself busy.",
    uses: ["Spinner", "Button"],
    code: `<Button variant="primary" loading>Saving…</Button>`,
    render: () => h("div", {style: {display: "flex", gap: "var(--space-3)", alignItems: "center"}},
      h(A.Button, {variant: "primary", loading: true}, "Saving…"),
      h(A.Spinner, {label: "Loading results"})),
  },
];
