// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";
export default [
  {
    variant: "Filter",
    name: "Narrowing a list as you type",
    description: "type=\"search\" so the browser offers its own clear control and history. The glyph is decoration — the accessible name comes from the label, never from the magnifier.",
    uses: ["SearchField"],
    code: `<SearchField aria-label="Filter members" placeholder="Filter members…" onChange={setQuery} />`,
    render: () => h("div", {style: {width: "min(360px,100%)"}},
      h(A.SearchField, {"aria-label": "Filter members", placeholder: "Filter members…"})),
  },
];
