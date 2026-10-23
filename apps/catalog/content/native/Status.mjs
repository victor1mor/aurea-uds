// O Status do nativo no site (bloco 1, o 5-A — 23/10/2026): um ponto e uma palavra, rodando pelo `react-native-web`.
// Todo valor das props do tipo em exemplo (`api-surface-native.json`).
import {createElement as h} from "react";
import {Status} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const VARIANTES = ["neutral", "online", "offline", "busy", "away", "success", "warning", "danger", "info"];
const ESTADOS = ["waiting_user", "waiting_approval", "waiting_dependency", "offline", "stale", "partial", "degraded"];
const coluna = {display: "grid", gap: "var(--space-3)", justifyItems: "start"};

export default {
  install: 'import {Status} from "@aurea-uds/native";',
  api: {
    state: "Universal state — the condition, beside variant, the colour of the dot. With no variant it picks one: offline keeps its own dimmed dot, the waiting states are info and the rest are warning. With no children the label comes from the strings table.",
  },
  examples: [
    {
      title: "Usage",
      code: `<Status variant="online">Online</Status>
<Status variant="busy">In a meeting</Status>`,
      render: () => h("div", {style: coluna},
        h(Status, {variant: "online"}, "Online"), h(Status, {variant: "busy"}, "In a meeting")),
    },
    cada({titulo: "Variants", descricao: "The operational names and the semantic ones share the same colours; offline is a dimmed dot, not a colour, so it reads apart from online.",
      valores: VARIANTES, coluna: true,
      codigo: v => `<Status variant="${v}">${v}</Status>`, peca: v => h(Status, {variant: v}, v)}),
    cada({titulo: "Universal states", descricao: "With no label, each state writes its sentence from the strings table, the same on every screen.",
      valores: ESTADOS, coluna: true,
      codigo: v => `<Status state="${v}" />`, peca: v => h(Status, {state: v})}),
  ],
};
