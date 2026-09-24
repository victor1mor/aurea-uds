// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
//
// O conteúdo vive num PORTAL: `renderToStaticMarkup` não renderiza portal (medido, 0 bytes).
// O preview mostra o DISPARADOR real e o código a composição inteira — concessão declarada.
//
// A regra que decide todo pattern daqui: tooltip é RÓTULO, nunca a única via para uma
// informação. Ele abre por ponteiro ou foco, e quem lê por toque não tem nem um nem outro de
// forma confiável. O que precisa ser lido sempre vai no `hint` do Field ou no próprio texto.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";

const PORTAL = "The tip opens in a portal on hover or focus, which a static page cannot render; the trigger below is real.";
const linha = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2)"};

export default [
  {
    variant: "Top",
    name: "Naming an icon-only control",
    description: "The IconButton already carries its accessible name; the tip is what shows that name to everyone else. Two mechanisms, one string — which is why the label and the tip must say the same thing, never two different things.",
    uses: ["Tooltip", "IconButton"],
    note: PORTAL,
    code: `<Tooltip content="Export as CSV">
  <IconButton icon="download" label="Export as CSV" />
</Tooltip>`,
    render: () => h(A.Tooltip, {content: "Export as CSV"},
      h(A.IconButton, {icon: "download", label: "Export as CSV"})),
  },
  {
    variant: "Top",
    name: "Why a control is unavailable",
    description: "A disabled button says no and not why, and a disabled element does not receive focus — so the tip goes on a wrapper that does. Without that the explanation exists only for a mouse, which is the failure this pattern is here to avoid.",
    uses: ["Tooltip", "Button"],
    note: PORTAL,
    code: `<Tooltip content="Add a payment method first">
  <span tabIndex={0}>
    <Button variant="primary" disabled>Publish</Button>
  </span>
</Tooltip>`,
    render: () => h(A.Tooltip, {content: "Add a payment method first"},
      h("span", {tabIndex: 0, style: {display: "inline-block"}},
        h(A.Button, {variant: "primary", disabled: true}, "Publish"))),
  },
  {
    variant: "Right",
    name: "Spelling out an abbreviated column",
    description: "`side=\"right\"` when the trigger sits in a narrow column and a tip above would cover the row being read. The header still has to make sense without the tip: P95 is the label, the tip only expands it.",
    uses: ["Tooltip"],
    note: PORTAL,
    code: `<th>
  <Tooltip side="right" content="95th percentile over the last 7 days">
    <abbr>P95</abbr>
  </Tooltip>
</th>`,
    render: () => h("span", {style: linha},
      h(A.Tooltip, {side: "right", content: "95th percentile over the last 7 days"},
        h("abbr", {tabIndex: 0}, "P95")),
      h("span", {className: "muted"}, "1.8s")),
  },
];
