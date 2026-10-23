// O Heading do nativo no site (bloco 1, o 5-A — 23/10/2026): o título, de h1 a h6, na Sora, rodando pelo
// `react-native-web`. Todo valor das props do tipo em exemplo (`api-surface-native.json`).
import {createElement as h} from "react";
import {Heading} from "../../../../packages/native/dist/index.js";

// Uma coluna flexível, como o `View` da tela do app: o título ocupa a largura, e o alinhamento aparece.
const coluna = (filhos) => h("div", {style: {display: "flex", flexDirection: "column", gap: "var(--space-3)", width: "100%", maxWidth: "30rem"}}, ...filhos);
const TIPOS = ["h1", "h2", "h3", "h4", "h5", "h6"];
const PARA_QUEBRAR = "results for every region, product line and sales channel this quarter";

export default {
  install: 'import {Heading} from "@aurea-uds/native";',
  description: "A heading, h1 to h6. The type picks the size, and the heading is announced as a header to the screen reader.",
  api: {
    type: "The level, h1 to h6: it picks the size and the weight of the role. Defaults to h1.",
    weight: "Overrides the weight of the role: normal, medium, semibold or bold. Headings are semibold by default.",
    align: "Text alignment; start and end become left and right, which React Native mirrors in RTL.",
    truncate: "One line, cut with an ellipsis (numberOfLines={1}).",
  },
  examples: [
    {
      title: "Usage",
      code: `<Heading type="h2">Monthly report</Heading>`,
      render: () => h(Heading, {type: "h2"}, "Monthly report"),
    },
    {
      title: "Levels",
      description: "Each level picks the size. On a phone there is no document outline: the level is the size, and every level is announced as a header.",
      code: TIPOS.map(v => `<Heading type="${v}">Heading ${v}</Heading>`).join("\n"),
      render: () => coluna(TIPOS.map(v => h(Heading, {key: v, type: v}, `Heading ${v}`))),
    },
    {
      title: "Colours",
      description: "Two only: the text colour or the muted one.",
      code: ["default", "muted"].map(v => `<Heading type="h4" color="${v}">color ${v}</Heading>`).join("\n"),
      render: () => coluna(["default", "muted"].map(v => h(Heading, {key: v, type: "h4", color: v}, `color ${v}`))),
    },
    {
      title: "Weights",
      code: ["normal", "medium", "semibold", "bold"].map(v => `<Heading type="h4" weight="${v}">weight ${v}</Heading>`).join("\n"),
      render: () => coluna(["normal", "medium", "semibold", "bold"].map(v => h(Heading, {key: v, type: "h4", weight: v}, `weight ${v}`))),
    },
    {
      title: "Alignment",
      description: "On a heading that wraps; justify fills the width with every line but the last.",
      code: ["start", "center", "end", "justify"].map(v => `<Heading type="h5" align="${v}">align ${v}: ${PARA_QUEBRAR}</Heading>`).join("\n"),
      render: () => coluna(["start", "center", "end", "justify"].map(v => h(Heading, {key: v, type: "h5", align: v}, `align ${v}: ${PARA_QUEBRAR}`))),
    },
    {
      title: "Truncate",
      description: "One line, cut with an ellipsis.",
      code: `<Heading type="h3" truncate>Quarterly results for every region, product line and sales channel</Heading>`,
      render: () => coluna([h(Heading, {key: 1, type: "h3", truncate: true}, "Quarterly results for every region, product line and sales channel")]),
    },
  ],
};
