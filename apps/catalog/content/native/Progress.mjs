// O Progress do nativo no site (bloco 1, o 5-A — 23/10/2026): a barra de progresso, com total ou sem, rodando pelo
// `react-native-web`. Todo valor das props do tipo em exemplo (`api-surface-native.json`).
import {createElement as h} from "react";
import {Progress} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const largura = {width: "min(24rem, 100%)"};
const coluna = {display: "grid", gap: "var(--space-4)", width: "min(24rem, 100%)"};
const TONS = ["brand", "neutral", "success", "warning", "danger", "info"];

export default {
  install: 'import {Progress} from "@aurea-uds/native";',
  api: {
    value: "Percentage, 0 to 100, clamped once: it is both the fill and the value the screen reader hears. Without it the bar is indeterminate: a piece runs across the track, and with reduced motion the whole bar shows dimmed instead.",
    detail: "Supporting text above the track, on the end side: speed, time left, bytes. As text it also goes into the value the screen reader hears.",
    style: "Style for the outer View.",
    testID: "Test id of the bar.",
  },
  examples: [
    {
      title: "Usage",
      code: `<Progress label="Uploading the report" value={64} detail="3.2 of 5 MB" />`,
      render: () => h("div", {style: largura}, h(Progress, {label: "Uploading the report", value: 64, detail: "3.2 of 5 MB"})),
    },
    cada({titulo: "Tones", descricao: "What the fill means, the same closed list as the Button's tone: paused is neutral, failed is danger.",
      valores: TONS, estilo: coluna,
      codigo: v => `<Progress tone="${v}" label="Sync, ${v}" value={60} />`,
      peca: v => h(Progress, {tone: v, label: `Sync, ${v}`, value: 60})}),
    {
      title: "Without a total",
      description: "With no value, a piece runs across the track instead of a 0% that reads as stalled.",
      code: `<Progress label="Loading the list" detail="Fetching data" />`,
      render: () => h("div", {style: largura}, h(Progress, {label: "Loading the list", detail: "Fetching data"})),
    },
    {
      title: "Just the bar",
      description: "Without detail, only the track. The label is never drawn: it is the name the screen reader hears.",
      code: `<Progress label="Step 2 of 4" value={50} />`,
      render: () => h("div", {style: largura}, h(Progress, {label: "Step 2 of 4", value: 50})),
    },
  ],
};
