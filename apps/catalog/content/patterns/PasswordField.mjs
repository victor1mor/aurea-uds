// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";
export default [
  {
    variant: "Sign in",
    name: "A password the user can check",
    description: "The reveal exists because typing a password blind is how people get locked out. The button says the action, not the state — Show password, then Hide password — so a screen reader announces what will happen.",
    uses: ["PasswordField"],
    code: `<Field label="Password"><PasswordField autoComplete="current-password" /></Field>`,
    render: () => h("div", {style: {width: "min(360px,100%)"}},
      h(A.Field, {label: "Password"}, h(A.PasswordField, null))),
  },
];
