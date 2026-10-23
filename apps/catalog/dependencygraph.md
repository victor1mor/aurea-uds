# DependencyGraph

Who depends on whom, on a canvas you can pan, zoom and build on.

## Usage

```tsx
import {DependencyGraph} from "@aurea-uds/react/graph";
import "@xyflow/react/dist/base.css";
```

```tsx
<DependencyGraph
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
/>
```

## Examples

### Tree and circle

Besides the layers, two arrangements of its own: tree, from the root down, and radial, the root in the middle with the rest around it.

```tsx
<DependencyGraph layout="tree" nodes={nodes} edges={edges} height="18rem" />
<DependencyGraph layout="radial" nodes={nodes} edges={edges} height="18rem" />
```

### Large text

textSize="lg" makes the names on the nodes and lines larger, for people who see little.

```tsx
<DependencyGraph textSize="lg" nodes={nodes} edges={edges} height="18rem" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `nodes` | `GraphNodeItem[]` | — | The vocabulary is ours, not the engine's. x and y are optional: without them a layered longest-path layout runs, because the engine positions nothing on its own and a graph with no coordinates piles every node at 0,0. A node can carry an `icon` (a sprite name or the app's own drawing) NEXT TO its kind, never instead of it; a `count` badge (with `countLabel` for the screen reader); a `status` badge (a word, with a tone that only reinforces it); `ports` (named handles on a chosen side); and a `layer`, the band the node sits in on the `layered` layout. `layer` is an ORDER, not an index: 0, 5 and 10 become the 1st, 2nd and 3rd band, and nodes with the same `layer` sit at the same height. It applies only when EVERY node outside a container has one (a container takes its own `layer`, or the smallest one inside it); with `layer` on only some nodes the map comes out as if there were none, and says so once in the console. INSIDE a container the engine arranges on its own: there `layer` does not apply (sending it there breaks the whole map, measured). Round 2: `parentId` puts the node inside a CONTAINER (site, floor, rack — one parent each; a VLAN is a filter, not a container, because one device sits in several); `collapsed` starts a container or a subtree closed; `pinned` keeps the node where it is; `shape: "cloud"` draws it as a cloud (Internet, public cloud, remote site). |
| `edges` | `GraphEdgeItem[]` | — | {from, to} — not {source, target}. Keeping our own words is what lets the engine be replaced without breaking anyone, the same reason Chart does not expose Recharts types. An edge can attach to ports (`fromPort`, `toPort`), write port names at its ends (`sourceLabel`, `targetLabel`), and say what it is without relying on colour: `pattern` (solid, dashed, dotted, double), `weight` (regular, thick, heavy), `mark` in the middle (cross, dot, lock), a `count` (for example the members of a link aggregation) and a `legend` name — the KIND of link (copper, fibre). Its STATE is separate: `status` (`label`, `tone`, and an optional `mark` such as the cross of a down link), the same shape as a node's status badge. The tone colours the line and doubles its thickness (all three weights double together, so speed still reads between coloured lines) — a hairline loses its colour when the map is zoomed out. The word goes into the legend, so colour is never the only signal. Round 2: `priority` decides which label stays when two labels touch (higher wins; on a tie, the earlier edge). |
| `selectedId` | `string \| null` | — | Controlled selection. |
| `onSelect` | `(id: string) => void` | — | Without it nodes are plain text instead of buttons — a control that does nothing does not get drawn. |
| `connectable` | `boolean` | false | Shows the connection handles. Off by default: a handle hanging off a read-only graph is an affordance lying — it promises a drag that goes nowhere. |
| `onConnect` | `(edge: {from: string; to: string; fromPort?: string; toPort?: string}) => void` | — | Fires when someone draws a new edge. |
| `onNodeMove` | `(id: string, pos: {x: number; y: number}) => void` | — | Enables dragging and reports where the node landed. Whoever passes x and y back keeps the position; that is what lets a builder store what the person arranged without fighting the automatic layout. |
| `height` | `string` | "28rem" | A canvas needs a definite height or it collapses. A CSS length, not a number — check 23. |
| `label` | `string` | "Dependency graph" | Accessible name of the group. |
| `className` | `string` | — | On the canvas wrapper. |
| `orientation` | `"horizontal" \| "vertical"` | "horizontal" | `vertical` draws top to bottom: edges enter a node from the top and leave from the bottom, and each layer is centred on the widest one, so the root sits in the middle. |
| `layout` | `"simple" \| "layered" \| "tree" \| "radial"` | "simple" | `layered` arranges the graph with elkjs (an optional peer): fewer crossings, balanced children, ports where the node draws them, children INSIDE their container, and right-angle routes with parallel lines kept apart. `tree` is a compact tree and `radial` puts the root in the centre with straight lines. They arrive after the first paint; the simple layout stands until then. |
| `rootId` | `string` | — | The node pinned to the first layer in the `layered` layout. |
| `edgeShape` | `"curve" \| "step"` | "curve" | `step` draws edges at right angles, with the small radius at each bend. In the `layered` layout the route comes from elkjs and keeps parallel lines apart; after a manual arrangement, a line that would cross a node is routed around it by @tisoap/react-flow-smart-edge (an optional peer). Where a line crosses another, the one drawn later jumps over it. |
| `groupParallel` | `boolean` | false | Edges between the same two nodes (in either direction) collapse into one line with their count. The count is a button that expands them into separate lines and joins them again; its name says what it does and how many. |
| `minimap` | `boolean` | false | An overview in the corner, with the visible area marked. It can be dragged and zoomed. |
| `controls` | `boolean` | false | Zoom in, zoom out and fit-to-screen buttons in the corner. |
| `legend` | `boolean` | false | A legend built from what is on the canvas, in two parts: the KIND of link (one row per distinct `legend` name, drawn without colour) and its STATE (one row per distinct `status.label`, drawn in its tone). Each sample shows what all the lines in its row share — a fibre row stays double even when only some fibre lines are thick. With only one part, it is a single list without titles. |
| `legendCollapsible` | `boolean` | false | The legend gets a Legend button that stays in the bottom-left corner: open, the list rises above it; closed, only the button is left, and the devices in that corner show. The button says whether it is open (`aria-expanded`) and points to the list (`aria-controls`). |
| `defaultLegendOpen` | `boolean` | true | Whether the collapsible legend starts open. Only applies with `legendCollapsible`. |
| `minimapToggle` | `boolean` | false | The overview gets an Overview button beside the zoom buttons, at the top. The overview stays in its corner and only shows and hides. Without `controls`, the button stands alone in the top corner. It says whether the overview is shown (`aria-expanded`) and points to it (`aria-controls`). |
| `defaultMinimapOpen` | `boolean` | true | Whether the overview with a button starts shown. Only applies with `minimapToggle`. |
| `focusId` | `string \| null` | — | Centres the canvas on this node and marks it — the 'go to' of a search. The mark is the brand border, not the keyboard focus ring. |
| `highlight` | `{nodes?: string[]; edges?: string[]} \| null` | — | Lights a path and dims everything else. Edges are matched by their `id`; without edge ids, an edge stays lit when both its ends are lit. |
| `highlightNeighbors` | `boolean` | false | With a selected node, lights it, its neighbours and the edges between them, and dims the rest. |
| `hiddenIds` | `string[]` | — | Hides these nodes and their edges WITHOUT re-running the layout: everything else stays exactly where it was. Filtering a map should not reshuffle it. |
| `onNodeHover` | `(id: string \| null) => void` | — | The pointer entered a node (its id) or left it (null) — for a summary card. |
| `onNodeContextMenu` | `(id: string, point: {x: number; y: number}) => void` | — | Right click on a node, with the point on the screen — for a ContextMenu. The browser's own menu does not open. |
| `onEdgeSelect` | `(id: string) => void` | — | A click on an edge, or Enter on a focused edge. With it, edges show the pointer and take the Tab; without it they do neither, because nothing would answer. |
| `textSize` | `"md" \| "lg"` | "md" | The text of the nodes and edge labels, independent of zoom. `lg` grows the node box in the same proportion, so names do not cut sooner. |
| `highContrast` | `boolean` | false | Edges, labels and node borders in the text colour, and the base line thickness doubles. Every weight and pattern is a multiple of the base, so they all follow. |
| `apiRef` | `Ref<DependencyGraphApi>` | — | Commands for the app: fitView(), zoomIn(), zoomOut(), focus(id), toDrawio() (a draw.io file with the current positions), toPng() and toSvg() (a data: URL; they need modern-screenshot). Round 2: undo(), redo(), align(edge), distribute(axis), relayout() and getLayout(). |
| `editable` | `boolean` | false | The ARRANGE mode: dragging on empty canvas draws a lasso; Shift, Ctrl or Cmd add to the selection; dragging moves every selected node; a toolbar aligns, distributes, pins, rearranges, undoes and redoes; arrow keys move the selection (with Shift, four steps); Ctrl+Z, Ctrl+Shift+Z or Ctrl+Y, and Ctrl+A. The canvas pans with the middle or right button, or Space + drag. Off, it is the read-only map. |
| `grid` | `boolean` | true | The snapping grid of the arrange mode (16 px, `--space-4`), drawn as the background dots. |
| `onLayoutChange` | `(layout: GraphLayoutChange) => void` | — | The arrangement changed — a drag, align, distribute, pin, rearrange, undo or redo. It carries every node's position and the pinned ids; storing it is the app's job. Whoever passes the positions back as x/y keeps them. |
| `onSelectionChange` | `(ids: string[]) => void` | — | The selection of the arrange mode. With exactly one node selected, `onSelect` is called too. |
| `collapsible` | `boolean` | false | Nodes with a subtree get the button to close and open it. A node's subtree is what can only be reached THROUGH it — with a redundant cable, an access switch does not vanish with one of its two cores. Containers always have the button. |
| `onCollapseChange` | `(id: string, collapsed: boolean) => void` | — | A container or a subtree opened or closed. |
| `visibleOnly` | `boolean` | false | Renders only what is on screen — for a very large map. |
| `layoutWorker` | `() => Worker` | — | A worker that runs elkjs off the main thread. The app provides it because each bundler creates workers its own way, and copying elkjs's worker into this package would redistribute it; the README has the recipe. |
