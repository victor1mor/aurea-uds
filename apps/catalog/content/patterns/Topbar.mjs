// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";
export default [
  {
    variant: "Floating",
    name: "The bar that carries the brand and the global actions",
    description: "Brand on the left, actions on the right, and nothing in between that belongs to a single page. The floating variant sits on the content; flush joins the page — pick one per application, not per screen.",
    uses: ["Topbar", "IconButton"],
    code: `<Topbar brand={<strong>Aurea UDS</strong>}>
  <SearchField aria-label="Search" placeholder="Search…" />
  <IconButton icon="light" label="Switch to light" onClick={toggleTheme} />
</Topbar>`,
    render: () => h("div", {style: {width: "100%"}}, h(A.Topbar, {brand: h("strong", null, "Aurea UDS")},
      h(A.IconButton, {icon: "light", label: "Switch to light"}))),
  },
];
