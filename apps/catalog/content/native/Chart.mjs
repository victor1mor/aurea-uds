// O Chart do nativo no site (bloco 1, o 5-A — 23/10/2026): o único componente do `@aurea-uds/native` cuja geometria é
// nossa (ADR-0041), desenhado pelo `react-native-svg` no navegador. Todo valor das props do tipo em exemplo.
import {createElement as h, useState} from "react";
import {Chart, Text} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const largura = {width: "min(32rem, 100%)"};
const coluna = {display: "grid", gap: "var(--space-6)", width: "100%"};

const DIAS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const VISITAS = [{name: "Visits", data: [12, 19, 15, 24, 21]}];
const DUAS = [
  {name: "This week", data: [12, 19, 15, 24, 21]},
  {name: "Last week", data: [9, 14, 17, 18, 16]},
];
const DADOS_CODIGO = `const labels = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const series = [{name: "Visits", data: [12, 19, 15, 24, 21]}];`;

const grafico = (props) => h("div", {style: largura}, h(Chart, {labels: DIAS, series: VISITAS, label: "Visits this week", ...props}));

// O toque escolhe um ponto; a linha de baixo diz qual.
function Escolhido() {
  const [dia, setDia] = useState(3);
  return h("div", {style: {...largura, display: "grid", gap: "var(--space-3)"}},
    h(Chart, {labels: DIAS, series: VISITAS, label: "Visits this week", selectedIndex: dia, onSelect: setDia}),
    h(Text, {size: "sm", tone: "muted"}, `Selected: ${DIAS[dia]}`));
}

export default {
  install: 'import {Chart} from "@aurea-uds/native";',
  description: "A line, area or bar chart drawn by the package itself on react-native-svg: the scale, the axis and the path are Aurea's code, not an engine's. A touch selects a point and writes its values under the drawing; each column of the chart is a stop for the screen reader, with its label and values.",
  api: {
    labels: "The x axis, one label per point. It is categorical: the labels come out as they are, with no time scale.",
    series: "The data: {name, data, color?, mark?}. A null in data is a gap the line skips, never a zero. A series' own mark lets bars and a line share one chart.",
    label: "The name of the drawing for the screen reader. Say what it plots, not that it is a chart.",
    mark: "How every series draws unless it says otherwise: a line, a filled area, or bars.",
    height: "Height of the drawing in dp. The default, 220, is the web's chart height.",
    yTicks: "How many marks the y axis gets. The range is split into equal parts, from zero when every value is positive.",
    formatValue: "Turns a value into text: on the axis, in the selection and in the list of values.",
    showLegend: "Shows the legend with one series. With two or more it is always on and does not turn off: the chart colours are one blue ramp, and the names separate them.",
    showValues: "Writes the selected point's values in text under the drawing. On by default.",
    onSelect: "Called with the label's index when a point is touched.",
    selectedIndex: "A point lit without a touch — for a preview or a screen with no finger.",
    style: "Style for the outer View.",
    testID: "Test id of the root; the drawing gets `<testID>-svg`.",
  },
  examples: [
    {
      title: "Usage",
      description: "The drawing measures its own width, so the page shows it once it is live.",
      code: `${DADOS_CODIGO}\n\n<Chart label="Visits this week" labels={labels} series={series} />`,
      render: () => grafico(),
    },
    cada({titulo: "Marks", descricao: "The same data as a line, a filled area or bars. Bars always start at zero.",
      valores: ["line", "area", "bar"], estilo: coluna,
      codigo: v => `<Chart mark="${v}" label="Visits this week" labels={labels} series={series} />`,
      peca: v => grafico({mark: v, label: `Visits this week, ${v}`})}),
    {
      title: "Two series",
      description: "With two or more series the legend is always there: colour is never the only thing that tells them apart.",
      code: `<Chart mark="bar" label="Visits, this week and last" labels={labels} series={[
  {name: "This week", data: [12, 19, 15, 24, 21]},
  {name: "Last week", data: [9, 14, 17, 18, 16]},
]} />`,
      render: () => grafico({mark: "bar", series: DUAS, label: "Visits, this week and last"}),
    },
    {
      title: "Bars and a line",
      description: "A series' own mark overrides the chart's, so a target line can sit over the bars.",
      code: `<Chart label="Visits against the target" labels={labels} series={[
  {name: "Visits", data: [12, 19, 15, 24, 21], mark: "bar"},
  {name: "Target", data: [18, 18, 18, 18, 18], mark: "line"},
]} />`,
      render: () => grafico({label: "Visits against the target", series: [
        {name: "Visits", data: [12, 19, 15, 24, 21], mark: "bar"},
        {name: "Target", data: [18, 18, 18, 18, 18], mark: "line"}]}),
    },
    {
      title: "Selecting a point",
      description: "A touch lights a point, writes its values below and tells onSelect; selectedIndex lights one from the screen's state.",
      code: `const [day, setDay] = useState(3);

<Chart label="Visits this week" labels={labels} series={series} selectedIndex={day} onSelect={setDay} />`,
      render: () => h(Escolhido),
    },
    {
      title: "Axis, size and format",
      description: "height and yTicks shape the drawing; formatValue writes every number, on the axis and under the selected point.",
      code: `<Chart label="Revenue this week" labels={labels} series={series} height={160} yTicks={2}
  formatValue={v => \`$\${v}k\`} />`,
      render: () => grafico({label: "Revenue this week", height: 160, yTicks: 2, formatValue: v => `$${v}k`}),
    },
    {
      title: "Legend and values",
      description: "showLegend names a single series; showValues={false} keeps the selected point's values out of the text below — the screen reader still reads them on each column.",
      code: `<Chart label="Visits this week" labels={labels} series={series} showLegend showValues={false} selectedIndex={3} />`,
      render: () => grafico({showLegend: true, showValues: false, selectedIndex: 3}),
    },
  ],
};
