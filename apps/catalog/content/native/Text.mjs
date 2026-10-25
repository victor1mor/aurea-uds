// O Text do nativo no site (bloco 1, o grupo 1 — 23/10/2026). Todo valor das props do tipo em exemplo.
// No nativo o peso é uma FAMÍLIA da fonte (ADR-0039), não o `fontWeight`: o site registra cada uma pelo nome.
import {createElement as h} from "react";
import {Text} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const coluna = {display: "grid", gap: "var(--space-3)", justifyItems: "start", width: "100%"};
const largura = {display: "grid", gap: "var(--space-4)", width: "min(28rem, 100%)"};
const FRASE = "Reports close at midnight. Anything sent after that goes into the next day, and the summary is emailed in the morning.";

export default {
  install: 'import {Text} from "@aurea-uds/native";',
  api: {
    type: "The role, from a closed list: heading 1 to 6, body, body-sm, body-xs and code. It sets size, weight, line height and font at once; a loose size or weight passed with it still wins.",
    size: "The token scale. On a phone the small names go up one step (sm is 16, as the reference's native package): xs 14, sm/md/base 16, lg 18, xl 20, then 24, 30, 36, 48.",
    weight: "400, 500, 600, 700 or 800. Each weight is a family of the font, never a synthesised fontWeight (ADR-0039).",
    font: "ui (Inter, the default), editorial, code (IBM Plex Mono) or heading (Sora).",
    tone: "What the colour means, with the Button's words. primary writes in the brand yellow: on dark the yellow itself, on light the yellow mixed with the text colour so it reads.",
    leading: "The line height: none, tight, normal or relaxed, as a ratio of the size.",
    italic: "The italic of the font, drawn — not a slanted upright. Only the ui font has it; on the others it does nothing.",
    align: "auto, left, right or center. left and right are mirrored by React Native in right-to-left layouts.",
    tracking: "The letter spacing of the token: tight to widest, as a ratio of the size. Headings are tight by default.",
    numeric: "Figures of the same width, for numbers that line up or change, in the code font (IBM Plex Mono). A font passed explicitly still wins.",
  },
  examples: [
    {
      title: "Usage",
      code: `<Text type="h3">Weekly report</Text>
<Text tone="muted">Ready for review since Monday.</Text>`,
      render: () => h("div", {style: coluna}, h(Text, {type: "h3"}, "Weekly report"), h(Text, {tone: "muted"}, "Ready for review since Monday.")),
    },
    cada({titulo: "Types", descricao: "The closed list of roles: six heading levels, three body sizes and code.",
      valores: ["h1", "h2", "h3", "h4", "h5", "h6", "body", "body-sm", "body-xs", "code"], estilo: coluna,
      codigo: v => `<Text type="${v}">type ${v}</Text>`, peca: v => h(Text, {type: v}, `type ${v}`)}),
    cada({titulo: "Sizes", descricao: "Ten names on the token scale; sm, md and base are the same 16 on a phone.",
      valores: ["xs", "sm", "md", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl"], estilo: coluna,
      codigo: v => `<Text size="${v}">size ${v}</Text>`, peca: v => h(Text, {size: v}, `size ${v}`)}),
    cada({titulo: "Weights", descricao: "From regular to extra bold, each one a family of the font.",
      valores: [400, 500, 600, 700, 800], estilo: coluna,
      codigo: v => `<Text weight={${v}}>weight ${v}</Text>`, peca: v => h(Text, {weight: v}, `weight ${v}`)}),
    cada({titulo: "Fonts", descricao: "ui and editorial are Inter, code is IBM Plex Mono, heading is Sora.",
      valores: ["ui", "editorial", "code", "heading"], estilo: coluna,
      codigo: v => `<Text font="${v}">font ${v}</Text>`, peca: v => h(Text, {font: v}, `font ${v}`)}),
    cada({titulo: "Tones", descricao: "What the colour means. primary is the brand yellow as text: on light it is mixed with the text colour so it reads.",
      valores: ["default", "muted", "subtle", "primary", "link", "danger", "success", "warning", "info"], estilo: coluna,
      codigo: v => `<Text tone="${v}">tone ${v}</Text>`, peca: v => h(Text, {tone: v}, `tone ${v}`)}),
    cada({titulo: "Leading", descricao: "The space between lines, as a ratio of the size.",
      valores: ["none", "tight", "normal", "relaxed"], estilo: largura,
      codigo: v => `<Text leading="${v}">${FRASE}</Text>`, peca: v => h(Text, {leading: v}, FRASE)}),
    cada({titulo: "Align", descricao: "auto follows the writing direction; left and right are mirrored in right-to-left.",
      valores: ["auto", "left", "right", "center"], estilo: largura,
      codigo: v => `<Text align="${v}">align ${v}</Text>`, peca: v => h(Text, {align: v}, `align ${v}`)}),
    cada({titulo: "Tracking", descricao: "The letter spacing of the token, from tight to widest.",
      valores: ["tight", "normal", "wide", "wider", "widest"], estilo: coluna,
      codigo: v => `<Text tracking="${v}">tracking ${v}</Text>`, peca: v => h(Text, {tracking: v}, `tracking ${v}`)}),
    {
      title: "Italic and numbers",
      description: "italic is the drawn italic of the ui font. numeric gives figures of the same width, in the code font, so a column of values lines up.",
      code: `<Text italic>Draft — not sent yet</Text>
<Text numeric>1,234.50</Text>
<Text numeric>  987.00</Text>`,
      render: () => h("div", {style: coluna}, h(Text, {italic: true}, "Draft — not sent yet"),
        h(Text, {numeric: true}, "1,234.50"), h(Text, {numeric: true}, "  987.00")),
    },
  ],
};
