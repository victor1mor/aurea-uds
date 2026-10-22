import {createElement as h} from "react";
import {DependencyGraph} from "../../../../packages/react/dist/graph.js";

// ADR-0064 (10/10/2026): o mapa de rede é o `DependencyGraph` com props genéricas — o app traduz o
// domínio dele (fibra, enlace caído, 20 estações) para elas. O TIPO da ligação vai no desenho e no `legend`;
// o ESTADO, à parte, no `status` (12/10/2026) — a legenda mostra as duas partes. A prévia é a arrumação SIMPLES (no
// servidor a de camadas não roda); o código mostra a de camadas, que é a recomendada.
const NOS = [
  {id: "internet", label: "Internet", kind: "Cloud", icon: "globe"},
  {id: "fw", label: "Firewall", kind: "Firewall", icon: "shield", detail: "10.0.0.1"},
  {id: "core", label: "Core", kind: "Layer 3 switch", icon: "network",
    ports: [{id: "p1", side: "bottom"}, {id: "p2", side: "bottom"}]},
  {id: "floor", label: "Floor 1", kind: "Access switch", icon: "network", count: 20, countLabel: "20 workstations"},
  {id: "cam", label: "Gate camera", kind: "IP camera", icon: "security-camera", status: {label: "Unreachable", tone: "danger"}},
];
const ARESTAS = [
  {from: "internet", to: "fw", legend: "Copper"},
  {from: "internet", to: "fw", legend: "Copper"},
  {from: "internet", to: "fw", legend: "Copper"},
  {from: "fw", to: "core", pattern: "double", legend: "Fibre"},
  {from: "core", to: "floor", fromPort: "p1", sourceLabel: "port 1", legend: "Copper"},
  {from: "core", to: "cam", fromPort: "p2", sourceLabel: "port 2", legend: "Copper", status: {label: "Down", tone: "danger", mark: "cross"}},
];

export default [
  {
    variant: "Network",
    name: "A network map, top to bottom",
    description: "The internet on top and each layer below. The kind of device is a word with an icon beside it; badges carry the count and the status; ports name the ends of the lines; the line's drawing says what kind of link it is without colour — double for fibre — and its state comes apart, as a colour, a word and a cross when down. The legend builds itself in two parts: the kind of link and the state. Repeated links between the same two devices collapse into one with their count.",
    uses: ["DependencyGraph"],
    code: `<DependencyGraph
  orientation="vertical"
  layout="layered"      // needs the optional peer elkjs
  rootId="internet"
  edgeShape="step"
  groupParallel
  legend
  nodes={[
    {id: "internet", label: "Internet", kind: "Cloud", icon: "globe"},
    {id: "fw", label: "Firewall", kind: "Firewall", icon: "shield", detail: "10.0.0.1"},
    {id: "core", label: "Core", kind: "Layer 3 switch", icon: "network",
      ports: [{id: "p1", side: "bottom"}, {id: "p2", side: "bottom"}]},
    {id: "floor", label: "Floor 1", kind: "Access switch", icon: "network",
      count: 20, countLabel: "20 workstations"},
    {id: "cam", label: "Gate camera", kind: "IP camera", icon: "security-camera",
      status: {label: "Unreachable", tone: "danger"}},
  ]}
  edges={[
    {from: "internet", to: "fw", legend: "Copper"},
    {from: "internet", to: "fw", legend: "Copper"},
    {from: "fw", to: "core", pattern: "double", legend: "Fibre"},
    {from: "core", to: "floor", fromPort: "p1", sourceLabel: "port 1", legend: "Copper"},
    {from: "core", to: "cam", fromPort: "p2", sourceLabel: "port 2", legend: "Copper",
      status: {label: "Down", tone: "danger", mark: "cross"}},
  ]}
/>`,
    render: () => h("div", {style: {width: "100%"}}, h(DependencyGraph, {
      orientation: "vertical", rootId: "internet", edgeShape: "step", groupParallel: true, legend: true,
      label: "Network map", height: "21rem", nodes: NOS, edges: ARESTAS,
    })),
  },
  // MNT-31 (21/10/2026): a legenda e o minimapa cobriam os nós dos cantos de baixo. A escolha do Victor na
  // bancada: a legenda com o botão parado no canto, e o botão do minimapa junto dos de zoom.
  {
    variant: "Network",
    name: "The legend and the overview step aside",
    description: "On a large map the legend and the overview cover the devices in the bottom corners. With legendCollapsible the legend gets a Legend button that stays in its corner: open, the list rises above it; closed, only the button is left. With minimapToggle the overview gets a button beside the zoom buttons, at the top. Both start open; defaultLegendOpen and defaultMinimapOpen start them closed.",
    uses: ["DependencyGraph"],
    code: `<DependencyGraph
  orientation="vertical"
  layout="layered"
  rootId="internet"
  edgeShape="step"
  controls
  legend
  legendCollapsible       // the Legend button, in the bottom-left corner
  minimap
  minimapToggle           // the overview button, beside the zoom buttons
  defaultMinimapOpen={false}
  nodes={nodes}
  edges={edges}
/>`,
    render: () => h("div", {style: {width: "100%"}}, h(DependencyGraph, {
      orientation: "vertical", rootId: "internet", edgeShape: "step", groupParallel: true, controls: true,
      legend: true, legendCollapsible: true, minimap: true, minimapToggle: true, defaultMinimapOpen: false,
      label: "Network map with the legend and the overview tucked away", height: "21rem", nodes: NOS, edges: ARESTAS,
    })),
  },
];
