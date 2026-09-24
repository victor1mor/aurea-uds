// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
//
// `prerender: true`: fora de um gráfico do motor a legenda renderiza NADA — medido, 0 bytes,
// porque ela lê o `payload` que o motor injeta. Um pattern seu tem de estar dentro do gráfico.
import {createElement as h} from "react";
import {Chart, ChartLegend} from "../../../../packages/react/dist/chart.js";
import {BarChart, Bar, XAxis, YAxis, CartesianGrid} from "recharts";

const SERIE = [{month: "Jan", runs: 128, errors: 9}, {month: "Feb", runs: 194, errors: 14},
  {month: "Mar", runs: 173, errors: 6}, {month: "Apr", runs: 241, errors: 11},
  {month: "May", runs: 287, errors: 8}, {month: "Jun", runs: 264, errors: 17}];

export default [
  {
    variant: "Bottom",
    name: "Naming the colours of a stacked series",
    description: "Stacking hides which band is which, so the legend stops being optional: it is the only place the reader learns that the darker band is the failures. It sits under the drawing by default, where it does not compete with the axis for the first read.",
    uses: ["Chart", "ChartLegend"],
    prerender: true,
    code: `<Chart label="Runs by outcome">
  <BarChart data={data}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <Bar dataKey="runs" name="Succeeded" stackId="a" fill="var(--chart-2)" />
    <Bar dataKey="errors" name="Failed" stackId="a" fill="var(--chart-4)" />
    <ChartLegend />
  </BarChart>
</Chart>`,
    render: () => h(Chart, {label: "Runs by outcome"},
      h(BarChart, {data: SERIE},
        h(CartesianGrid, {vertical: false}),
        h(XAxis, {dataKey: "month", tickLine: false, axisLine: false}),
        h(Bar, {dataKey: "runs", name: "Succeeded", stackId: "a", fill: "var(--chart-2)"}),
        h(Bar, {dataKey: "errors", name: "Failed", stackId: "a", fill: "var(--chart-4)"}),
        h(ChartLegend, {}))),
  },
  {
    variant: "Top",
    name: "Legend above the drawing",
    description: "`verticalAlign=\"top\"` reads the names before the shapes, which is what a dashboard tile wants when the drawing is short and the reader is scanning several tiles at once. Everything else stays: the component still takes the series from the engine, never a hand-written list.",
    uses: ["Chart", "ChartLegend"],
    prerender: true,
    code: `<Chart label="Runs and errors">
  <BarChart data={data}>
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <YAxis width={32} tickLine={false} axisLine={false} />
    <Bar dataKey="runs" name="Runs" fill="var(--chart-2)" />
    <Bar dataKey="errors" name="Errors" fill="var(--chart-4)" />
    <ChartLegend verticalAlign="top" />
  </BarChart>
</Chart>`,
    render: () => h(Chart, {label: "Runs and errors"},
      h(BarChart, {data: SERIE},
        h(XAxis, {dataKey: "month", tickLine: false, axisLine: false}),
        h(YAxis, {width: 32, tickLine: false, axisLine: false}),
        h(Bar, {dataKey: "runs", name: "Runs", fill: "var(--chart-2)"}),
        h(Bar, {dataKey: "errors", name: "Errors", fill: "var(--chart-4)"}),
        h(ChartLegend, {verticalAlign: "top"}))),
  },
];
