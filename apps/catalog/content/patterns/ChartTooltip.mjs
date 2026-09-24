// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
//
// `prerender: true` e `defaultIndex`: fora do gráfico o tooltip renderiza nada (lê o `payload`
// do motor), e dentro dele só aparece sob o ponteiro — que uma página estática não tem.
import {createElement as h} from "react";
import {Chart, ChartTooltip} from "../../../../packages/react/dist/chart.js";
import {AreaChart, Area, BarChart, Bar, XAxis, CartesianGrid} from "recharts";

const SERIE = [{month: "Jan", runs: 128, errors: 9}, {month: "Feb", runs: 194, errors: 14},
  {month: "Mar", runs: 173, errors: 6}, {month: "Apr", runs: 241, errors: 11},
  {month: "May", runs: 287, errors: 8}, {month: "Jun", runs: 264, errors: 17}];

export default [
  {
    variant: "Single series",
    name: "The exact value under the pointer",
    description: "An area chart shows a shape, not a number; the tooltip is where the number lives. It reuses the same `.tooltip` surface as the rest of the system, so a value read on a chart looks like a value read anywhere else.",
    uses: ["Chart", "ChartTooltip"],
    prerender: true,
    code: `<Chart label="Runs per month">
  <AreaChart data={data}>
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <Area dataKey="runs" name="Runs" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.15} />
    <ChartTooltip />
  </AreaChart>
</Chart>`,
    render: () => h(Chart, {label: "Runs per month"},
      h(AreaChart, {data: SERIE},
        h(XAxis, {dataKey: "month", tickLine: false, axisLine: false}),
        h(Area, {dataKey: "runs", name: "Runs", stroke: "var(--chart-2)",
          fill: "var(--chart-2)", fillOpacity: 0.15}),
        h(ChartTooltip, {defaultIndex: 4}))),
  },
  {
    variant: "Multi series",
    name: "Every series at one point in time",
    description: "With more than one series the tooltip becomes a small table: the label is the point on the axis, and each row is a series with its colour swatch. This is the comparison the drawing cannot make, because two bars of different heights do not tell you their difference.",
    uses: ["Chart", "ChartTooltip"],
    prerender: true,
    code: `<Chart label="Runs and errors">
  <BarChart data={data}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <Bar dataKey="runs" name="Runs" fill="var(--chart-2)" />
    <Bar dataKey="errors" name="Errors" fill="var(--chart-4)" />
    <ChartTooltip />
  </BarChart>
</Chart>`,
    render: () => h(Chart, {label: "Runs and errors"},
      h(BarChart, {data: SERIE},
        h(CartesianGrid, {vertical: false}),
        h(XAxis, {dataKey: "month", tickLine: false, axisLine: false}),
        h(Bar, {dataKey: "runs", name: "Runs", fill: "var(--chart-2)"}),
        h(Bar, {dataKey: "errors", name: "Errors", fill: "var(--chart-4)"}),
        h(ChartTooltip, {defaultIndex: 3}))),
  },
];
