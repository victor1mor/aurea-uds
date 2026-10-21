// OS EXEMPLOS DE PARTIDA COM MOTOR PESADO (21/10/2026) — os gráficos (Recharts), o editor de código (CodeMirror), a
// grade (TanStack Table), o mapa de rede (React Flow) e o QR. Saíram do `_starters.mjs` quando o site ganhou a parte
// viva em toda caixa: num arquivo só, a parte viva pesaria 1,16 MB comprimida em TODA página (medido); sem eles, 436 KB.
// O gerador junta os dois arquivos — para ele é uma lista só — e a página de um componente DAQUI carrega o
// `assets/live-motores.js`, que traz os motores; as outras carregam o `assets/live.js`, leve. Componente novo com motor
// opcional entra AQUI, e não no `_starters.mjs`.
import {createElement as h} from "react";
import {CodeEditor} from "../../../packages/react/dist/code-editor.js";
import {DataGrid} from "../../../packages/react/dist/data-grid.js";
import {QRCode} from "../../../packages/react/dist/qrcode.js";
import {DependencyGraph} from "../../../packages/react/dist/graph.js";
import {Chart, ChartTooltip, ChartLegend} from "../../../packages/react/dist/chart.js";
import {AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis} from "recharts";
import {row, wide} from "./_starters.mjs";
import {ComValor} from "./_estado.mjs";

// Série de exemplo das três páginas de Chart. Uma só, para que as três mostrem o mesmo dado
// visto de três jeitos — é o que faz a página da legenda e a do tooltip serem comparáveis.
const SERIE = [{month: "Jan", runs: 128, errors: 9}, {month: "Feb", runs: 194, errors: 14},
  {month: "Mar", runs: 173, errors: 6}, {month: "Apr", runs: 241, errors: 11},
  {month: "May", runs: 287, errors: 8}, {month: "Jun", runs: 264, errors: 17}];

export default {
  // ── Chart (Lote 3) ────────────────────────────────────────────────────────────────────────
  // `prerender: true` porque o Recharts 3 monta o desenho por EFEITO: renderToStaticMarkup
  // devolve a <div> embrulho e nenhum <svg> (medido em 01/08/2026, 127 bytes). O gerador monta
  // estas três num DOM de verdade e grava o HTML — ver o bloco PRERENDER do build-catalog.
  // O código continua sendo o componente, sem nada de prerender: é assim que o consumidor usa.
  Chart: {
    install: 'import {Chart} from "@aurea-uds/react/chart";',
    code: `<Chart label="Runs per month">
  <AreaChart data={data}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <Area dataKey="runs" name="Runs" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.15} />
  </AreaChart>
</Chart>`,
    prerender: true,
    render: () => h(Chart, {label: "Runs per month"},
      h(AreaChart, {data: SERIE},
        h(CartesianGrid, {vertical: false}),
        h(XAxis, {dataKey: "month", tickLine: false, axisLine: false}),
        h(Area, {dataKey: "runs", name: "Runs", stroke: "var(--chart-2)",
          fill: "var(--chart-2)", fillOpacity: 0.15}))),
  },
  ChartLegend: {
    install: 'import {Chart, ChartLegend} from "@aurea-uds/react/chart";',
    code: `<Chart label="Runs and errors">
  <BarChart data={data}>
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <Bar dataKey="runs" name="Runs" fill="var(--chart-2)" />
    <Bar dataKey="errors" name="Errors" fill="var(--chart-4)" />
    <ChartLegend />
  </BarChart>
</Chart>`,
    prerender: true,
    render: () => h(Chart, {label: "Runs and errors"},
      h(BarChart, {data: SERIE},
        h(XAxis, {dataKey: "month", tickLine: false, axisLine: false}),
        h(Bar, {dataKey: "runs", name: "Runs", fill: "var(--chart-2)"}),
        h(Bar, {dataKey: "errors", name: "Errors", fill: "var(--chart-4)"}),
        h(ChartLegend, {}))),
  },
  ChartTooltip: {
    install: 'import {Chart, ChartTooltip} from "@aurea-uds/react/chart";',
    // `defaultIndex` fixa o ponto ativo. Numa página estática não há ponteiro, e sem ele o
    // tooltip nunca apareceria no preview; num app real ele é opcional.
    description: "The tooltip follows the pointer. Here it starts pinned to one point, so it shows before you move; "
      + "point at the chart and it follows.",
    code: `<Chart label="Runs per month">
  <AreaChart data={data}>
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <Area dataKey="runs" name="Runs" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.15} />
    <ChartTooltip />
  </AreaChart>
</Chart>`,
    prerender: true,
    render: () => h(Chart, {label: "Runs per month"},
      h(AreaChart, {data: SERIE},
        h(XAxis, {dataKey: "month", tickLine: false, axisLine: false}),
        h(Area, {dataKey: "runs", name: "Runs", stroke: "var(--chart-2)",
          fill: "var(--chart-2)", fillOpacity: 0.15}),
        h(ChartTooltip, {defaultIndex: 3}))),
  },
  CodeEditor: {
    install: 'import {CodeEditor} from "@aurea-uds/react/code-editor";',
    description: "CodeMirror 6 with the Aurea theme. The editor mounts on the client: without JavaScript, the page "
      + "shows only its host element.",
    code: `import {javascript} from "@codemirror/lang-javascript";

<CodeEditor
  defaultValue={'const total = items.reduce((n, i) => n + i.price, 0);'}
  extensions={[javascript()]}
  onChange={setSource}
/>`,
    render: () => h("div", {style: wide}, h(CodeEditor,
      {defaultValue: "const total = items.reduce((n, i) => n + i.price, 0);"})),
  },
  DataGrid: {
    install: 'import {DataGrid} from "@aurea-uds/react/data-grid";',
    code: `<DataGrid
  label="Members"
  filterable
  data={[{name: "Messenger", role: "Owner"}, {name: "Analyst", role: "Editor"}]}
  columns={[
    {accessorKey: "name", header: "Name"},
    {accessorKey: "role", header: "Role"},
  ]}
/>`,
    render: () => h("div", {style: wide}, h(DataGrid, {
      label: "Members", filterable: true,
      data: [{name: "Messenger", role: "Owner"}, {name: "Analyst", role: "Editor"},
        {name: "Curator", role: "Viewer"}],
      columns: [{accessorKey: "name", header: "Name"}, {accessorKey: "role", header: "Role"}],
    })),
  },
  DependencyGraph: {
    // Subpath próprio + a folha ESTRUTURAL do motor. Só ela: o `style.css` dele é a
    // identidade deles e não entra (ver a ficha e o REFERENCES.md).
    install: 'import {DependencyGraph} from "@aurea-uds/react/graph";\nimport "@xyflow/react/dist/base.css";',
    // A prévia RENDERIZA, e isso é correção de 09/08/2026. A primeira versão dizia que grafo
    // não cabia em HTML estático e mostrava uma caixa vazia com uma frase dentro — o Victor
    // perguntou "cadê?" e estava certo. A conclusão era minha, não medida: o motor tem caminho
    // de SSR documentado, e são três coisas no componente (`initialWidth`, `initialHeight` e
    // `handles` por nó, mais o viewport inicial no provider). Sem elas o motor não tem o que
    // medir e não desenha; com elas, `renderToStaticMarkup` devolve o grafo inteiro.
    code: `<DependencyGraph
  nodes={[
    {id: "ingest", label: "Ingest", kind: "source"},
    {id: "embed", label: "Embed", kind: "model"},
    {id: "index", label: "Index", kind: "store"},
    {id: "answer", label: "Answer", kind: "agent"},
  ]}
  edges={[
    {from: "ingest", to: "embed"},
    {from: "embed", to: "index"},
    {from: "index", to: "answer"},
  ]}
  onSelect={setSelected}
  selectedId={selected}
/>`,
    // Quatro nos em TRES colunas, e a escolha e medida: o enquadramento nunca amplia, entao a
    // profundidade do exemplo decide a escala. Cinco em cadeia caiam a 0,46 num painel de
    // 635px e o rotulo ficava ilegivel; com tres colunas fica ~0,8, e ainda mostra um RAMO,
    // que e o que um grafo existe para mostrar.
    render: () => h(ComValor, {componente: DependencyGraph, valor: "selectedId", aviso: "onSelect",
      height: "20rem", selectedId: "embed",
      nodes: [
        {id: "ingest", label: "Ingest", kind: "source"},
        {id: "embed", label: "Embed", kind: "model"},
        {id: "index", label: "Index", kind: "store"},
        {id: "answer", label: "Answer", kind: "agent"}],
      edges: [
        {from: "ingest", to: "embed"},
        {from: "embed", to: "index"},
        {from: "embed", to: "answer", animated: true}]}),
  },
  QRCode: {
    description: "Three sizes, side by side, because the choice is about SCANNING and not about "
      + "layout: the smaller the box, the fewer pixels each module gets, and below roughly four "
      + "an ordinary phone camera starts to miss it. The preview showed only sm, which is why "
      + "this page used to display a code nobody could read.",
    install: 'import {QRCode} from "@aurea-uds/react/qrcode";',
    code: `<QRCode value="https://aureauds.dev" size="sm" />
<QRCode value="https://aureauds.dev" size="md" />
<QRCode value="https://aureauds.dev" size="lg" />`,
    // `flex-end` alinha os três pela BASE: comparação de tamanho com as caixas centradas na
    // vertical faria o `sm` parecer flutuando, e o que a página compara é altura.
    render: () => h("div", {style: {...row, alignItems: "flex-end", gap: "var(--space-5)"}},
      [["sm", "7.5rem"], ["md", "10rem"], ["lg", "15rem"]].map(([tam, medida]) =>
        h("div", {key: tam, style: {display: "grid", gap: "var(--space-2)", justifyItems: "center"}},
          h(QRCode, {value: "https://aureauds.dev", size: tam}),
          h("span", {className: "muted"}, `${tam} · ${medida}`)))),
  },
};
