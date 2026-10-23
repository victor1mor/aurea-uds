// O Code do nativo no site (bloco 1, o 5-A — 23/10/2026): o trecho de código no meio da frase, rodando pelo
// `react-native-web`. Todo valor das props do tipo em exemplo (`api-surface-native.json`).
import {createElement as h} from "react";
import {Code, Text} from "../../../../packages/native/dist/index.js";

// Uma coluna flexível, como o `View` da tela do app: o `Code` fica do tamanho do texto, como lá.
const coluna = (filhos) => h("div", {style: {display: "flex", flexDirection: "column", gap: "var(--space-3)", width: "100%", maxWidth: "22.5rem"}}, ...filhos);
const LONGO = "const total = items.reduce((sum, item) => sum + item.price, 0);";

export default {
  install: 'import {Code} from "@aurea-uds/native";',
  api: {
    weight: "Overrides the weight of the role. The code font ships up to semibold, so bold draws at semibold.",
    align: "Text alignment; start and end become left and right, which React Native mirrors in RTL. It shows when the code wraps.",
    truncate: "One line, cut with an ellipsis (numberOfLines={1}).",
  },
  examples: [
    {
      title: "Usage",
      code: `<Text>Run <Code>pnpm add @aurea-uds/native</Code> in the app folder.</Text>`,
      render: () => h(Text, null, "Run ", h(Code, null, "pnpm add @aurea-uds/native"), " in the app folder."),
    },
    {
      title: "Colours",
      description: "Two only: the text colour or the muted one.",
      code: ["default", "muted"].map(v => `<Code color="${v}">color ${v}</Code>`).join("\n"),
      render: () => coluna(["default", "muted"].map(v => h(Code, {key: v, color: v}, `color ${v}`))),
    },
    {
      title: "Weights",
      description: "The code font ships up to semibold, so bold draws at semibold.",
      code: ["normal", "medium", "semibold", "bold"].map(v => `<Code weight="${v}">weight ${v}</Code>`).join("\n"),
      render: () => coluna(["normal", "medium", "semibold", "bold"].map(v => h(Code, {key: v, weight: v}, `weight ${v}`))),
    },
    {
      title: "Alignment",
      description: "The lines line up inside the code's own box, so the alignment shows when the code wraps.",
      code: ["start", "center", "end", "justify"].map(v => `<Code align="${v}">${LONGO}</Code>`).join("\n"),
      render: () => coluna(["start", "center", "end", "justify"].map(v => h(Code, {key: v, align: v}, LONGO))),
    },
    {
      title: "Truncate",
      description: "One line, cut with an ellipsis.",
      code: `<Code truncate>${LONGO}</Code>`,
      render: () => coluna([h(Code, {key: 1, truncate: true}, LONGO)]),
    },
  ],
};
