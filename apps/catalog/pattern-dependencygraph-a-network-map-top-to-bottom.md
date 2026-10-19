# A network map, top to bottom

The internet on top and each layer below. The kind of device is a word with an icon beside it; badges carry the count and the status; ports name the ends of the lines; the line's drawing says what kind of link it is without colour — double for fibre — and its state comes apart, as a colour, a word and a cross when down. The legend builds itself in two parts: the kind of link and the state. Repeated links between the same two devices collapse into one with their count.

## Usage

```tsx
import {DependencyGraph} from "@aurea-uds/react";
```

```tsx
<DependencyGraph
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
/>
```
