// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
//
// O conteúdo vive num PORTAL: `renderToStaticMarkup` não renderiza portal (medido, 0 bytes), e
// numa página estática não há ponteiro nem foco. Então o preview mostra o DISPARADOR real e o
// código mostra a composição inteira — é a mesma concessão declarada do starter.
//
// HoverCard ≠ Tooltip. O tooltip é um RÓTULO curto e nomeia o disparador; o hover card é uma
// PRÉVIA rica, e o que está dentro dele não pode ser a única via para nada — abre por passagem
// do ponteiro, e quem navega por teclado ou toque não passa o ponteiro em lugar nenhum.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";

const linha = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2)"};

export default [
  {
    variant: "Bottom",
    name: "Who this person is, without leaving the sentence",
    description: "A name in running text is an identifier, not an identity. The card answers \"who?\" in place, and the profile page it previews stays one click away — the preview is a shortcut, never the only route.",
    uses: ["HoverCard", "Avatar", "Badge"],
    note: "Opens on pointer or focus; a static page shows the trigger.",
    code: `<HoverCard trigger={<a href="/people/analyst">Analyst</a>}>
  <div className="cluster">
    <Avatar fallback="AN" />
    <div>
      <strong>Analyst</strong>
      <p className="muted">Data · joined March 2026</p>
    </div>
  </div>
  <Badge variant="success">Available</Badge>
</HoverCard>`,
    render: () => h("p", null, "Reviewed by ",
      h(A.HoverCard, {trigger: h("a", {href: "#"}, "Analyst")},
        h("div", {style: linha}, h(A.Avatar, {fallback: "AN"}),
          h("div", null, h("strong", null, "Analyst"),
            h("p", {className: "muted"}, "Data · joined March 2026")))),
      " on 12 August."),
  },
  {
    variant: "Top",
    name: "Previewing what a link leads to",
    description: "`side=\"top\"` when the trigger sits low in the viewport and a card below it would be cut off. The rest is unchanged: the preview saves a navigation, it does not replace one.",
    uses: ["HoverCard", "Badge"],
    note: "Opens on pointer or focus; a static page shows the trigger.",
    code: `<HoverCard side="top" trigger={<a href="/runs/8814">Run #8814</a>}>
  <strong>Nightly sweep</strong>
  <p className="muted">Finished 09:13 · 1m 48s · 0 errors</p>
  <Badge variant="success">Succeeded</Badge>
</HoverCard>`,
    render: () => h("p", null, "Triggered by ",
      h(A.HoverCard, {side: "top", trigger: h("a", {href: "#"}, "Run #8814")},
        h("strong", null, "Nightly sweep"),
        h("p", {className: "muted"}, "Finished 09:13 · 1m 48s · 0 errors"),
        h(A.Badge, {variant: "success"}, "Succeeded")),
      "."),
  },
];
