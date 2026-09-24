// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";
export default [
  {
    variant: "Determinate",
    name: "A job with a known end",
    description: "Determinate only when the total is real. Faking a percentage for something unbounded is worse than the spinner it replaced: it promises an end the system cannot keep.",
    uses: ["Progress"],
    code: `<Progress label="Uploading dataset" value={62} />`,
    render: () => h("div", {style: {width: "min(420px,100%)"}},
      h(A.Progress, {label: "Uploading dataset", value: 62})),
  },
];
