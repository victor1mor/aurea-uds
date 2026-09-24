// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`. Medido em 21/08/2026: a classe `.aspect-ratio` aparecia em
// UMA página do catálogo — a do próprio componente. Primitive sem composição nenhuma é buraco,
// não "coberto por outros"; é o que este arquivo fecha.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";

const grade = {display: "grid", gap: "var(--space-4)",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", width: "min(600px,100%)"};
const miolo = {display: "grid", placeItems: "center", height: "100%",
  background: "var(--secondary)", borderRadius: "var(--radius-card)", color: "var(--muted-foreground)"};

export default [
  {
    variant: "Default",
    name: "A media slot that reserves its space",
    description: "The box holds the shape before the image arrives, so nothing below it jumps when it does. That is the whole job: not cropping the picture, but stopping the layout from shifting under the reader — the failure a card grid makes most visibly.",
    uses: ["AspectRatio", "Card"],
    code: `<Card>
  <AspectRatio ratio={16 / 9}>
    <img src={cover} alt="" style={{width: "100%", height: "100%", objectFit: "cover"}} />
  </AspectRatio>
  <strong>Design tokens, end to end</strong>
</Card>`,
    render: () => h("div", {style: {width: "min(320px,100%)"}}, h(A.Card, null,
      h(A.AspectRatio, {ratio: 16 / 9}, h("div", {style: miolo}, "16 : 9")),
      h("strong", {style: {display: "block", marginTop: "var(--space-3)"}},
        "Design tokens, end to end"),
      h("p", {className: "muted"}, "Episode 12 · 42 min"))),
  },
  {
    variant: "Default",
    name: "One ratio held across a grid",
    description: "Cards of different image heights read as a broken grid even when every card is correct. Fixing the ratio in one place is what makes the row line up, and it survives a source image nobody checked.",
    uses: ["AspectRatio"],
    code: `<div className="grid">
  {items.map(i => (
    <AspectRatio key={i.id} ratio={4 / 3}>
      <img src={i.cover} alt="" />
    </AspectRatio>
  ))}
</div>`,
    render: () => h("div", {style: grade}, ...["4 : 3", "4 : 3", "4 : 3"].map((r, n) =>
      h(A.AspectRatio, {key: n, ratio: 4 / 3}, h("div", {style: miolo}, r)))),
  },
  {
    variant: "Default",
    name: "A square, for identity",
    description: "`ratio={1}` is the default because the square is the shape identity uses — an avatar, a logo, a QR code. Naming it explicitly in the code is still worth it: a reader who sees `ratio={1}` knows the square was chosen, not inherited.",
    uses: ["AspectRatio", "QRCode"],
    code: `<AspectRatio ratio={1}>
  <QRCode value="https://aureauds.dev" />
</AspectRatio>`,
    render: () => h("div", {style: {width: "160px"}},
      h(A.AspectRatio, {ratio: 1}, h("div", {style: miolo}, "1 : 1"))),
  },
];
