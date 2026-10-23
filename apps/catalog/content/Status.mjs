import {createElement as h} from "react";
import {Status, Badge} from "../../../packages/react/dist/index.js";
import {eixo} from "./_eixos.mjs";

const row = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-5)"};
// Os nomes de sentido da ficha, com o rótulo que cada um diria numa tela de operação.
const SENTIDO = {neutral: "Draft", running: "Running", success: "Healthy", warning: "Slow", danger: "Down",
  info: "Scheduled"};

export default {
  description:
    "Status shows the operational condition of a thing — online, busy, offline. It is not a " +
    "Badge: a Badge is a short metadata pill, Status says what state something is in, as a " +
    "coloured dot plus a readable label.",
  install: 'import {Status} from "@aurea-uds/react";',
  features: [
    "The colour is never the only signal — the label states the condition (WCAG 1.4.1); the dot is decorative.",
    "offline is a hollow dot, so it never collapses onto neutral in the light theme.",
    "Operational names (online/busy/away) and semantic names (success/warning/danger) map to the same theme-aware tokens.",
  ],
  examples: [
    {
      title: "Operational states",
      description: "Coloured dot, readable label. The word carries the meaning.",
      code:
        '<Status variant="online">Online</Status>\n' +
        '<Status variant="busy">Busy</Status>\n' +
        '<Status variant="away">Away</Status>\n' +
        '<Status variant="offline">Offline</Status>',
      render: () => h("div", {style: row},
        h(Status, {variant: "online"}, "Online"), h(Status, {variant: "busy"}, "Busy"),
        h(Status, {variant: "away"}, "Away"), h(Status, {variant: "offline"}, "Offline")),
    },
    {
      title: "Status vs Badge",
      description: "A Badge is a pill of metadata; a Status is a state on the line.",
      code: '<Status variant="online">Deployed</Status>\n<Badge variant="success">v1.7.0</Badge>',
      render: () => h("div", {style: row},
        h(Status, {variant: "online"}, "Deployed"), h(Badge, {variant: "success"}, "v1.7.0")),
    },
    eixo({
      titulo: "Semantic names",
      descricao: "The same dots in the vocabulary of a job or a service: running, success, warning, danger and info. "
        + "Neutral is the default. The label still says what the colour means.",
      Comp: Status, nome: "Status", prop: "variant", valores: Object.keys(SENTIDO), filho: (v) => SENTIDO[v],
    }),
    eixo({
      titulo: "Universal states",
      descricao: "state is the condition, an axis apart from the colour. With no children the label comes from the "
        + "shared string table, so the same condition reads the same on every screen; with no variant the dot follows "
        + "the severity — waiting is info, the rest is warning, and offline keeps its hollow dot.",
      Comp: Status, nome: "Status", prop: "state",
      valores: ["waiting_user", "waiting_approval", "waiting_dependency", "offline", "stale", "partial", "degraded"],
    }),
  ],
};
