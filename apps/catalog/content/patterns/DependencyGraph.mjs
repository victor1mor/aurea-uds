import {createElement as h} from "react";
import {DependencyGraph} from "../../../../packages/react/dist/graph.js";

// ADR-0064 (10/10/2026): o mapa de rede é o `DependencyGraph` com props genéricas — o app traduz o
// domínio dele (fibra, enlace caído, 20 estações) para elas. A prévia é a arrumação SIMPLES (no
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
  {from: "core", to: "cam", fromPort: "p2", sourceLabel: "port 2", mark: "cross", legend: "Down"},
];

export default [
  {
    variant: "Network",
    name: "A network map, top to bottom",
    description: "The internet on top and each layer below. The kind of device is a word with an icon beside it; badges carry the count and the status; ports name the ends of the lines; the line itself says what it is without colour — double for fibre, a cross when down — and the legend builds itself. Repeated links between the same two devices collapse into one with their count.",
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
    {from: "core", to: "cam", fromPort: "p2", sourceLabel: "port 2", mark: "cross", legend: "Down"},
  ]}
/>`,
    render: () => h("div", {style: {width: "100%"}}, h(DependencyGraph, {
      orientation: "vertical", rootId: "internet", edgeShape: "step", groupParallel: true, legend: true,
      label: "Network map", height: "30rem", nodes: NOS, edges: ARESTAS,
    })),
  },
];
