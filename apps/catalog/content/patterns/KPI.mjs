// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
//
// `trend` é ReactNode — texto ou elemento, não um objeto {value, direction}. A primeira versão
// deste arquivo inventou o objeto e o build reprovou na hora (21/08/2026). É a razão de o gate
// renderizar todo pattern: API inventada não sobrevive a um render de verdade.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";

const tiras = {display: "flex", gap: "var(--space-4)", flexWrap: "wrap"};

export default [
  {
    variant: "Metric",
    name: "A number with its comparison",
    description: "The delta only means something next to a period, so the trend line carries both. A KPI without a comparison is a number on a wall — true, and useless for deciding anything.",
    uses: ["KPI"],
    code: `<KPI label="Runs" value="1,284" trend="+12% vs last week" />`,
    render: () => h("div", {style: tiras},
      h("div", {style: {minWidth: "160px"}},
        h(A.KPI, {label: "Runs", value: "1,284", trend: "+12% vs last week"})),
      h("div", {style: {minWidth: "160px"}},
        h(A.KPI, {label: "P95 latency", value: "1.8s", trend: "−4% vs last week"}))),
  },
  {
    variant: "Metric",
    name: "The direction, not just the sign",
    description: "`trend` takes a node, so the comparison can carry a status of its own. Colour alone would fail WCAG 1.4.1 — the arrow and the words are what make the direction readable without it.",
    uses: ["KPI", "Status"],
    code: `<KPI
  label="Failed runs"
  value="17"
  trend={<Status variant="danger">up 6 since Monday</Status>}
/>`,
    render: () => h("div", {style: tiras},
      h("div", {style: {minWidth: "180px"}}, h(A.KPI, {label: "Failed runs", value: "17",
        trend: h(A.Status, {variant: "danger"}, "up 6 since Monday")})),
      h("div", {style: {minWidth: "180px"}}, h(A.KPI, {label: "Succeeded", value: "1,267",
        trend: h(A.Status, {variant: "success"}, "up 9% since Monday")}))),
  },
  {
    variant: "Metric",
    name: "A row of tiles across the top of a dashboard",
    description: "Three or four side by side is the shape a dashboard opens with: the numbers that decide whether to keep reading. Past four they stop being a summary and become a table that forgot it was one.",
    uses: ["KPI"],
    code: `<div className="grid">
  <KPI label="Runs" value="1,284" trend="+12%" />
  <KPI label="Success rate" value="98.7%" trend="+0.4pt" />
  <KPI label="P95 latency" value="1.8s" trend="−4%" />
</div>`,
    render: () => h("div", {style: {...tiras, width: "min(680px,100%)"}},
      ...[["Runs", "1,284", "+12%"], ["Success rate", "98.7%", "+0.4pt"],
        ["P95 latency", "1.8s", "−4%"]].map(([l, v, t]) =>
        h("div", {key: l, style: {flex: "1 1 160px"}}, h(A.KPI, {label: l, value: v, trend: t})))),
  },
];
