// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
//
// `prerender: true` em toda entrada daqui, pela mesma razão medida do starter do Chart: o
// Recharts 3 monta o desenho por EFEITO, e `renderToStaticMarkup` devolve a <div> embrulho sem
// <svg> nenhum. A primeira versão deste arquivo não fez isso e saiu pior que vazia — anunciava
// `<ChartLegend items={[…]} />`, uma prop que o componente não tem. O componente recebe
// `LegendProps` do motor e lê o `payload` das séries. Corrigido em 21/08/2026.
import {createElement as h} from "react";
import {Chart, ChartLegend, ChartTooltip} from "../../../../packages/react/dist/chart.js";
import {AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis} from "recharts";

const SERIE = [{month: "Jan", runs: 128, errors: 9}, {month: "Feb", runs: 194, errors: 14},
  {month: "Mar", runs: 173, errors: 6}, {month: "Apr", runs: 241, errors: 11},
  {month: "May", runs: 287, errors: 8}, {month: "Jun", runs: 264, errors: 17}];

export default [
  {
    variant: "Frame",
    name: "One series over time",
    description: "Chart is the frame, not the drawing: it carries the accessible name, the sizing and the surface, and the series comes in as a child of the chart library. That split is what lets the drawing engine be swapped without touching the page.",
    uses: ["Chart"],
    prerender: true,
    code: `<Chart label="Runs per month">
  <AreaChart data={data}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <Area dataKey="runs" name="Runs" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.15} />
  </AreaChart>
</Chart>`,
    render: () => h(Chart, {label: "Runs per month"},
      h(AreaChart, {data: SERIE},
        h(CartesianGrid, {vertical: false}),
        h(XAxis, {dataKey: "month", tickLine: false, axisLine: false}),
        h(Area, {dataKey: "runs", name: "Runs", stroke: "var(--chart-2)",
          fill: "var(--chart-2)", fillOpacity: 0.15}))),
  },
  {
    variant: "Frame",
    name: "Two series, read together",
    description: "Two bars side by side answer a question one bar cannot: not how many runs, but how many of them failed. The legend is required here — with two series the colours stop being decoration and start carrying meaning.",
    uses: ["Chart", "ChartLegend"],
    prerender: true,
    code: `<Chart label="Runs and errors">
  <BarChart data={data}>
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <YAxis width={32} tickLine={false} axisLine={false} />
    <Bar dataKey="runs" name="Runs" fill="var(--chart-2)" />
    <Bar dataKey="errors" name="Errors" fill="var(--chart-4)" />
    <ChartLegend />
  </BarChart>
</Chart>`,
    render: () => h(Chart, {label: "Runs and errors"},
      h(BarChart, {data: SERIE},
        h(XAxis, {dataKey: "month", tickLine: false, axisLine: false}),
        h(YAxis, {width: 32, tickLine: false, axisLine: false}),
        h(Bar, {dataKey: "runs", name: "Runs", fill: "var(--chart-2)"}),
        h(Bar, {dataKey: "errors", name: "Errors", fill: "var(--chart-4)"}),
        h(ChartLegend, {}))),
  },
  {
    variant: "Frame",
    name: "The whole reading surface",
    description: "Grid, axis, legend and tooltip on one chart — the assembled form, so the pieces are seen doing their jobs together instead of one at a time. `defaultIndex` pins the tooltip because a static page has no pointer; in an application it is not needed.",
    uses: ["Chart", "ChartLegend", "ChartTooltip"],
    prerender: true,
    code: `<Chart label="Runs and errors per month">
  <AreaChart data={data}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <Area dataKey="runs" name="Runs" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.15} />
    <Area dataKey="errors" name="Errors" stroke="var(--chart-4)" fill="var(--chart-4)" fillOpacity={0.15} />
    <ChartTooltip />
    <ChartLegend />
  </AreaChart>
</Chart>`,
    render: () => h(Chart, {label: "Runs and errors per month"},
      h(AreaChart, {data: SERIE},
        h(CartesianGrid, {vertical: false}),
        h(XAxis, {dataKey: "month", tickLine: false, axisLine: false}),
        h(Area, {dataKey: "runs", name: "Runs", stroke: "var(--chart-2)",
          fill: "var(--chart-2)", fillOpacity: 0.15}),
        h(Area, {dataKey: "errors", name: "Errors", stroke: "var(--chart-4)",
          fill: "var(--chart-4)", fillOpacity: 0.15}),
        h(ChartTooltip, {defaultIndex: 3}),
        h(ChartLegend, {}))),
  },
];
