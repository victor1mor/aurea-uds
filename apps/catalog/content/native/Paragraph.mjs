// O Paragraph do nativo no site (bloco 1, o 5-A — 23/10/2026). Todo valor das props do tipo em exemplo.
import {createElement as h} from "react";
import {Paragraph} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const TEXTO = "The report collects every invoice of the week, grouped by client, with the totals at the end of each group.";
const coluna = {display: "grid", gap: "var(--space-3)", width: "min(32rem, 100%)"};

export default {
  install: 'import {Paragraph} from "@aurea-uds/native";',
  api: {
    type: "The role: body (16), body-sm (14) or body-xs (12).",
    weight: "Overrides the weight of the role: normal, medium, semibold or bold (400 to 700).",
    align: "Text alignment. start and end become left and right, which React Native mirrors in a right-to-left layout.",
    truncate: "One line, cut with an ellipsis (numberOfLines={1}).",
  },
  examples: [
    {
      title: "Usage",
      code: `<Paragraph>${TEXTO}</Paragraph>
<Paragraph type="body-sm" color="muted">Updated every Monday at 08:00.</Paragraph>`,
      render: () => h("div", {style: coluna},
        h(Paragraph, null, TEXTO),
        h(Paragraph, {type: "body-sm", color: "muted"}, "Updated every Monday at 08:00.")),
    },
    cada({titulo: "Types", descricao: "Three sizes of running text: 16, 14 and 12.",
      valores: ["body", "body-sm", "body-xs"], estilo: coluna,
      codigo: v => `<Paragraph type="${v}">type ${v}: ${TEXTO}</Paragraph>`,
      peca: v => h(Paragraph, {type: v}, `type ${v}: ${TEXTO}`)}),
    cada({titulo: "Colours", descricao: "Two colours only, a closed list: the text's, or the muted one.",
      valores: ["default", "muted"], estilo: coluna,
      codigo: v => `<Paragraph color="${v}">color ${v}</Paragraph>`,
      peca: v => h(Paragraph, {color: v}, `color ${v}`)}),
    cada({titulo: "Weights", descricao: "Body text is regular by default; weight overrides it.",
      valores: ["normal", "medium", "semibold", "bold"], estilo: coluna,
      codigo: v => `<Paragraph weight="${v}">weight ${v}</Paragraph>`,
      peca: v => h(Paragraph, {weight: v}, `weight ${v}`)}),
    cada({titulo: "Alignment", descricao: "start and end follow the writing direction; justify stretches every full line.",
      valores: ["start", "center", "end", "justify"], estilo: coluna,
      codigo: v => `<Paragraph align="${v}">align ${v}: ${TEXTO}</Paragraph>`,
      peca: v => h(Paragraph, {align: v}, `align ${v}: ${TEXTO}`)}),
    {
      title: "Truncate",
      description: "One line, cut with an ellipsis — for a list row, not for text someone needs to read whole.",
      code: `<Paragraph truncate>${TEXTO}</Paragraph>`,
      // Em grade, como numa coluna do nativo: o texto do `react-native-web` solto num bloco fica em linha e não corta.
      render: () => h("div", {style: {display: "grid", width: "min(16rem, 100%)"}}, h(Paragraph, {truncate: true}, TEXTO)),
    },
  ],
};
