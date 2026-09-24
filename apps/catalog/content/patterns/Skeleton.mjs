// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";
export default [
  {
    variant: "Loading",
    name: "The shape of the content that is coming",
    description: "A skeleton only helps when it matches the layout it replaces — otherwise the page jumps when the data lands, which is the exact flicker it was meant to avoid. Use it for content, never for a control.",
    uses: ["Skeleton"],
    code: `<Card>
  <Skeleton style={{height: 20, width: "40%"}} />
  <Skeleton style={{height: 14}} />
  <Skeleton style={{height: 14, width: "80%"}} />
</Card>`,
    render: () => h("div", {style: {width: "min(420px,100%)", display: "flex",
      flexDirection: "column", gap: "var(--space-2)"}},
      h(A.Skeleton, {style: {height: 20, width: "40%"}}),
      h(A.Skeleton, {style: {height: 14}}),
      h(A.Skeleton, {style: {height: 14, width: "80%"}})),
  },
];
