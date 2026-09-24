// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";
export default [
  {
    variant: "Person",
    name: "Initials when there is no picture",
    description: "The fallback is not a placeholder, it is the normal case: most people in most systems have no photo. Initials come from the name so two rows never look alike by accident.",
    uses: ["Avatar"],
    code: `<Avatar fallback="AN" alt="Analyst" />
<Avatar src="/people/curator.jpg" alt="Curator" size="lg" />`,
    render: () => h("div", {style: {display: "flex", gap: "var(--space-3)", alignItems: "center"}},
      h(A.Avatar, {fallback: "AN", alt: "Analyst"}),
      h(A.Avatar, {fallback: "CU", alt: "Curator", size: "lg"})),
  },
];
