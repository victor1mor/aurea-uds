// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";
export default [
  {
    variant: "Operational",
    name: "The state of a service, in a row",
    description: "A coloured dot plus a word. The word is mandatory: colour alone fails for a third of readers, and green and amber are the pair people confuse most.",
    uses: ["Status"],
    code: `<Status variant="online">Running</Status>
<Status variant="offline">Stopped</Status>
<Status>Unknown</Status>`,
    render: () => h("div", {style: {display: "flex", gap: "var(--space-4)", flexWrap: "wrap"}},
      h(A.Status, {variant: "online"}, "Running"), h(A.Status, {variant: "offline"}, "Stopped"),
      h(A.Status, null, "Unknown")),
  },
];
