// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";
export default [
  {
    variant: "Verification",
    name: "The six digits from the email",
    description: "One box per character, and paste fills all of them — because nobody types a code they can copy. Masking is for a secret; a verification code is not one, and hiding it only makes it harder to check.",
    uses: ["OTPField"],
    code: `<OTPField label="Verification code" length={6} onValueChange={check} />`,
    render: () => h(A.OTPField, {label: "Verification code", length: 6}),
  },
];
