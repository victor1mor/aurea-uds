# v0.30.0

Reading large graphs with the DependencyGraph - vertical layered layout, icons, badges and ports, edges that explain themselves without color, minimap, path highlight and export.

The first round of the [DependencyGraph](./dependencygraph.html) for network and topology maps: reading the graph. It can flow top to bottom in layers, nodes and edges carry more information without relying on color, and large graphs get a minimap, navigation and export. The web [Icon](./icon.html) now accepts your own icon component. Nothing is removed and no default changes.

## New

### Layout

- **`orientation="vertical"`**: edges enter at the top and leave at the bottom, with each layer centered.
- **`layout="layered"`**: arranges the graph with `elkjs`, with fewer crossings, `rootId` at the top, a suggested `layer` per node and ports in the declared order.
- **`edgeShape="step"`**: right-angle edges with rounded corners.
- **New optional dependency `elkjs`**, loaded only when requested. Without it, the simple layout is used.

### Nodes and edges

- **Nodes say more, without relying on color**: an `icon` next to the type (never replacing it), a count badge (`count`, with `countLabel` for screen readers), a status badge (`status`, the word) and `ports`, with name and side.
- **Edges say what they are, without relying on color**: `pattern` (dashed, dotted, double), `weight` (thicker), a `mark` in the middle (×, dot, lock), `count`, the port name at each end (`sourceLabel`, `targetLabel`) and a `legend` that builds itself from the edges on screen.
- **`groupParallel`**: repeated edges between the same two nodes become one edge with "×10". It is a button that expands them and groups them again.

### Reading a large graph

- **`minimap`**: an overview of the whole graph.
- **`controls`**: zoom in, zoom out and fit to screen.
- **`focusId`** (go to a node), **`highlight`** (a path lights up and the rest dims), **`highlightNeighbors`** and **`hiddenIds`** (hide nodes without re-running the layout).
- **Events**: `onNodeHover`, `onNodeContextMenu` and `onEdgeSelect`.
- **Low vision and keyboard**: `textSize="lg"` (node text independent of zoom, and the box grows with it), `highContrast` (edges and text in the text color, and thicker), and arrow keys that move from node to node.

### Export

- **`apiRef.toDrawio()`**: a `.drawio` file, written by Aurea with no dependency.
- **`apiRef.toPng()` and `apiRef.toSvg()`**, through `modern-screenshot`, a new optional dependency.

### Icons and docs

- **The web `Icon` accepts your own icon component** (`AureaIconComponent`), as React Native already did, for glyphs the set does not have, such as a router.
- **The icon-name migration table to Phosphor** gains 7 names: `add--alt`, `edge-node`, `flow--connection`, `ibm-cloud-pak--network-automation`, `location`, `network-interface` and `router`.
- **The README** now says to restart your dev server after updating Aurea.

## Breaking changes

- **`AureaStrings` (web) has eight new keys**: `graphConnections`, `graphFit`, `graphJoin`, `graphLegend`, `graphOverview`, `graphShow`, `graphZoomIn` and `graphZoomOut`. If you build the whole object yourself, add them. Passing only some strings to `AureaProvider` is unaffected.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.30.0 @aurea-uds/core@0.30.0 @aurea-uds/fonts@0.30.0 @aurea-uds/icons@0.30.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.30.0
```
