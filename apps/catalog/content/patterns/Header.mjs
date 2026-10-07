// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// GAR-01 (07/10/2026): o `Header` é o antigo `Topbar` com o nome de mercado. O primeiro padrão é a
// barra de aplicativo de sempre; o segundo, o cabeçalho de SITE (`items`, `current`, `actions`).
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";
const ITENS = [
  {id: "home", label: "Home", href: "#"},
  {id: "pricing", label: "Pricing", href: "#"},
  {id: "docs", label: "Docs", href: "#"},
  {id: "blog", label: "Blog", href: "#"},
];
export default [
  {
    variant: "Floating",
    name: "The bar that carries the brand and the global actions",
    description: "Brand on the left, actions on the right, and nothing in between that belongs to a single page. The floating variant sits on the content; flush joins the page — pick one per application, not per screen.",
    uses: ["Header", "IconButton"],
    code: `<Header brand={<strong>Aurea UDS</strong>}>
  <SearchField aria-label="Search" placeholder="Search…" />
  <IconButton icon="sun" label="Switch to light" onClick={toggleTheme} />
</Header>`,
    render: () => h("div", {style: {width: "100%"}}, h(A.Header, {brand: h("strong", null, "Aurea UDS")},
      h(A.IconButton, {icon: "sun", label: "Switch to light"}))),
  },
  {
    variant: "Website",
    name: "A website header, with the current page marked",
    description: "The same list the Sidebar and the BottomNav take goes in items, and current marks the page you are on. Below 768px the links leave the bar and drop into the menu panel; the actions stay in the bar. maxWidth lines the bar up with the Container of the page.",
    uses: ["Header", "Button"],
    code: `<Header
  variant="flush"
  divider
  maxWidth="xl"
  brand={<strong>Acme</strong>}
  items={items}
  current="pricing"
  navLabel="Main"
  menuLabel="Menu"
  actions={<Button variant="primary" size="sm">Sign up</Button>}
/>`,
    render: () => h("div", {style: {width: "100%", position: "relative"}}, h(A.Header, {variant: "flush", divider: true,
      maxWidth: "xl", brand: h("strong", null, "Acme"), items: ITENS, current: "pricing",
      actions: h(A.Button, {variant: "primary", size: "sm"}, "Sign up")})),
  },
];
