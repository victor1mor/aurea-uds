// RECEITA · Dashboard · BI (S-11, 05/11/2026) — o painel de números como tela de produto: o período, os quatro números
// com a direção, as barras e a MESMA série em grade (a regra da receita: "visualization always has a tabular
// alternative" — quem não lê as barras lê os números). Interação de verdade: trocar o período troca os números, as barras e
// a grade juntos. A grade é a `DataGrid` (a decisão S-02). O gráfico é o `Chart` (Recharts): o gerador o desenha antes
// (`prerender`), porque o motor só desenha depois de montar.
import {createElement as h, useState} from "react";
import * as A from "../../../../packages/react/dist/index.js";
import {Chart} from "../../../../packages/react/dist/chart.js";
import {DataGrid} from "../../../../packages/react/dist/data-grid.js";
import {BarChart, Bar, CartesianGrid, XAxis} from "recharts";
import {Tela, Numero, Grupo} from "./_tela.mjs";

const numeros = {display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, calc(var(--space-24) * 2)), 1fr))", gap: "var(--space-3)"};

const PERIODOS = {
  "7d": {serie: [["Mon", 6.1], ["Tue", 6.8], ["Wed", 7.4], ["Thu", 6.9], ["Fri", 8.2], ["Sat", 5.3], ["Sun", 4.9]],
    kpis: [["Revenue", "$45.6k", "+8%", "up"], ["Active seats", "312", "+4%", "up"], ["Churn", "1.2%", "−0.3 pt", "down"], ["Avg. deal", "$1.9k", "0%", "flat"]]},
  "30d": {serie: [["Wk 1", 41.2], ["Wk 2", 44.0], ["Wk 3", 39.8], ["Wk 4", 48.2]],
    kpis: [["Revenue", "$173k", "+12%", "up"], ["Active seats", "318", "+6%", "up"], ["Churn", "1.4%", "+0.1 pt", "up"], ["Avg. deal", "$2.1k", "+5%", "up"]]},
  "90d": {serie: [["Aug", 151], ["Sep", 162], ["Oct", 173]],
    kpis: [["Revenue", "$486k", "+19%", "up"], ["Active seats", "324", "+9%", "up"], ["Churn", "1.3%", "−0.2 pt", "down"], ["Avg. deal", "$2.0k", "+3%", "up"]]},
};
const PLANOS = {"7d": [["Pro", 29.4, 168], ["Team", 12.1, 96], ["Starter", 4.1, 48]],
  "30d": [["Pro", 111.0, 171], ["Team", 47.2, 98], ["Starter", 14.8, 49]],
  "90d": [["Pro", 312.5, 174], ["Team", 131.9, 101], ["Starter", 41.6, 49]]};
const COLUNAS = [{accessorKey: "plan", header: "Plan"}, {accessorKey: "revenue", header: "Revenue ($k)"}, {accessorKey: "seats", header: "Seats"}];
// Churn que sobe é ruim: a direção diz para onde o número foi, o tom diz se isso é bom.
const tomDe = (rotulo, dir) => dir === "flat" ? "neutral" : (rotulo === "Churn") === (dir === "up") ? "danger" : "success";

function RevenueDashboard() {
  const [periodo, setPeriodo] = useState("30d");
  const [exportado, setExportado] = useState(null);
  const {serie, kpis} = PERIODOS[periodo];
  const dados = serie.map(([x, y]) => ({x, revenue: y}));
  return h(Tela, {icone: "chart-bar", trilha: ["Analytics"], titulo: "Revenue",
    estado: h(A.Status, {variant: "success"}, "Up to date"),
    propriedades: [["funnel", "All plans"], ["globe", "All regions"], ["clock", "Data as of 09:41"]],
    acoes: [
      h(A.SegmentedControl, {key: "p", label: "Period", value: periodo, onChange: setPeriodo,
        items: [{value: "7d", label: "7 days"}, {value: "30d", label: "30 days"}, {value: "90d", label: "90 days"}]}),
      h(A.Button, {key: "e", variant: "secondary", leadingIcon: "download-simple", onClick: () => setExportado(periodo)}, `Export ${periodo}`)],
    rodape: exportado ? `Exported ${exportado} · all plans · all regions, as a CSV with the same numbers as the grid.`
      : `Export scope: ${periodo} · all plans · all regions. The grid carries the same numbers as the bars.`},
    h("div", {style: numeros}, ...kpis.map(([rotulo, valor, tendencia, dir]) =>
      h(Numero, {key: rotulo, label: rotulo, value: valor, trend: tendencia, direction: dir, tone: tomDe(rotulo, dir)}))),
    h(Grupo, {titulo: "Revenue per period, in thousands of dollars"}, h(Chart, {label: "Revenue over the period, in thousands of dollars"},
      h(BarChart, {data: dados},
        h(CartesianGrid, {vertical: false}),
        h(XAxis, {dataKey: "x", tickLine: false, axisLine: false, interval: 0}),
        h(Bar, {dataKey: "revenue", name: "Revenue", fill: "var(--chart-2)"})))),
    h(DataGrid, {label: "Revenue by plan", columns: COLUNAS,
      data: PLANOS[periodo].map(([plan, revenue, seats]) => ({plan, revenue: revenue.toFixed(1), seats: String(seats)}))}));
}

export default {
  uses: ["Card", "Separator", "Avatar", "Icon", "Text", "Heading", "Status", "SegmentedControl", "Button", "KPI", "Chart", "DataGrid"],
  prerender: "recharts-surface",
  code: `import {useState} from "react";
import {Avatar, Button, Card, Heading, Icon, KPI, SegmentedControl, Separator, Status, Text} from "@aurea-uds/react";
import {Chart} from "@aurea-uds/react/chart";
import {DataGrid} from "@aurea-uds/react/data-grid";
import {Bar, BarChart, CartesianGrid, XAxis} from "recharts";

// The same series twice: as bars and as numbers. Changing the period changes both.
export function RevenueDashboard({periods, plans, onExport}) {
  const [period, setPeriod] = useState("30d");
  const {series, kpis} = periods[period];

  return (
    <Card>
      <header>
        <Avatar size="lg" tone="brand" emphasis="soft" fallback={<Icon name="chart-bar" />} />
        <Text type="body-xs" tone="muted">Analytics</Text>
        <Heading level={3}>Revenue</Heading> <Status variant="success">Up to date</Status>
        <SegmentedControl label="Period" value={period} onChange={setPeriod}
          items={[{value: "7d", label: "7 days"}, {value: "30d", label: "30 days"}, {value: "90d", label: "90 days"}]} />
        <Button variant="secondary" leadingIcon="download-simple" onClick={() => onExport(period)}>Export {period}</Button>
      </header>
      <Separator />

      {kpis.map(k => (
        <Card key={k.label} variant="inset">
          <KPI variant="plain" label={k.label} value={k.value} trend={k.trend} direction={k.direction} tone={k.tone} />
        </Card>
      ))}

      <Card variant="inset">
        <Chart label="Revenue over the period, in thousands of dollars">
          <BarChart data={series}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="x" tickLine={false} axisLine={false} interval={0} />
            <Bar dataKey="revenue" name="Revenue" fill="var(--chart-2)" />
          </BarChart>
        </Chart>
      </Card>

      <DataGrid label="Revenue by plan" data={plans[period]}
        columns={[{accessorKey: "plan", header: "Plan"}, {accessorKey: "revenue", header: "Revenue ($k)"},
          {accessorKey: "seats", header: "Seats"}]} />

      <Separator />

      <footer>
        <Text type="body-sm" tone="muted">The grid carries the same numbers as the bars.</Text>
      </footer>
    </Card>
  );
}`,
  render: () => h(RevenueDashboard),
};
