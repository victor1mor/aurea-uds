// O ChartLegend do nativo no site (bloco 1, o 5-A — 23/10/2026): a legenda sozinha, fora do `Chart`. O tipo não tem
// lista fechada de valores; os exemplos mostram as duas formas de dar a cor.
import {createElement as h} from "react";
import {ChartLegend, useAureaTokens} from "../../../../packages/native/dist/index.js";

const SERIES = [
  {name: "Revenue", data: [12, 18, 15, 22]},
  {name: "Costs", data: [8, 9, 11, 10]},
  {name: "Profit", data: [4, 9, 4, 12]},
];

// As cores já resolvidas, do tema: é o que o app passa quando monta a legenda à parte.
function ComCores() {
  const t = useAureaTokens();
  return h(ChartLegend, {series: SERIES.slice(0, 2), colors: [t.color.success, t.color.warning]});
}
function CorNaSerie() {
  const t = useAureaTokens();
  return h(ChartLegend, {series: [{name: "Target", data: [20, 20, 20, 20], color: t.color.info}, ...SERIES.slice(0, 1)]});
}

export default {
  install: 'import {ChartLegend} from "@aurea-uds/native";',
  api: {
    series: "The series, in the shape the Chart takes: {name, data, color?, mark?}. The legend reads the name and the colour; the name is always written, so colour is never the only thing that tells two series apart.",
    colors: "Colours already resolved, one per series, in order. The Chart passes its own; a legend drawn apart passes yours. A series' own color wins over this list, and without either the legend follows the chart ramp.",
    style: "Style of the list.",
    testID: "Test id of the list.",
  },
  examples: [
    {
      title: "Usage",
      description: "The Chart draws this list itself when there are two series or more; draw it apart when the legend lives somewhere else on the screen.",
      code: `<ChartLegend series={[
  {name: "Revenue", data: [12, 18, 15, 22]},
  {name: "Costs", data: [8, 9, 11, 10]},
  {name: "Profit", data: [4, 9, 4, 12]},
]} />`,
      render: () => h(ChartLegend, {series: SERIES}),
    },
    {
      title: "Colours from the app",
      description: "colors gives one colour per series, in order — resolved values, read from the theme with useAureaTokens().",
      code: `const t = useAureaTokens();

<ChartLegend
  series={[revenue, costs]}
  colors={[t.color.success, t.color.warning]}
/>`,
      render: () => h(ComCores),
    },
    {
      title: "A series' own colour",
      description: "A color on the series wins over the colors list; the others keep the ramp.",
      code: `<ChartLegend series={[
  {name: "Target", data: [20, 20, 20, 20], color: t.color.info},
  revenue,
]} />`,
      render: () => h(CorNaSerie),
    },
  ],
};
