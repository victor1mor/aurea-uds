// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";
export default [
  {
    variant: "Notice",
    name: "Something that affects the whole page",
    description: "A banner spans the region it is about; an alert sits inside it. Dismissible only when the message is genuinely optional — a banner about degraded service that can be closed is a banner nobody sees twice.",
    uses: ["Banner"],
    code: `<Banner variant="warning" title="Reduced capacity">
  Runs are queueing. Scheduled jobs may start late until 18:00 UTC.
</Banner>`,
    render: () => h("div", {style: {width: "100%"}}, h(A.Banner, {variant: "warning", title: "Reduced capacity"},
      "Runs are queueing. Scheduled jobs may start late until 18:00 UTC.")),
  },
];
