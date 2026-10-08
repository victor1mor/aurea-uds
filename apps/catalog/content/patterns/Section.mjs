// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// GAR-06 (07/10/2026): o rodapé de site é a `Section` com `variant="footer"`.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";
const COLUNAS = [
  {title: "Product", items: [{id: "pricing", label: "Pricing", href: "#"}, {id: "changelog", label: "Changelog", href: "#"}]},
  {title: "Company", items: [{id: "about", label: "About", href: "#"}, {id: "careers", label: "Careers", href: "#"}]},
  {title: "Help", items: [{id: "docs", label: "Docs", href: "#"}, {id: "contact", label: "Contact", href: "#"}]},
];
export default [
  {
    variant: "Footer",
    name: "The website footer, dark on a light page",
    description: "variant=\"footer\" turns the band into the footer: brand, link columns and the legal line, already inside a Container. It keeps the band's theme, so a dark footer on a light page is theme=\"dark\". On a phone everything stacks.",
    uses: ["Section"],
    code: `<Section
  variant="footer"
  theme="dark"
  spacing="sm"
  brand={<strong>Acme</strong>}
  links={columns}
  legal="© 2026 Acme. All rights reserved."
  navLabel="Footer"
/>`,
    render: () => h("div", {style: {width: "100%"}}, h(A.Section, {variant: "footer", theme: "dark", spacing: "sm",
      brand: h("strong", null, "Acme"), links: COLUNAS, legal: "© 2026 Acme. All rights reserved."})),
  },
];
