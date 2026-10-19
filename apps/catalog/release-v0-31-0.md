# v0.31.0

Editing for the DependencyGraph - drag, align and pin nodes, undo, containers that collapse, routed edges, tree and radial layouts, and options for large graphs.

The second round of the [DependencyGraph](./dependencygraph.html): you can now edit the graph. Nodes can be dragged, aligned, distributed and pinned, with undo and redo. Containers group nodes and collapse, edges avoid crossing nodes, and there are two new layouts. Nothing is removed. The read-only graph's keyboard behavior changes, and step edges in the layered layout are drawn differently.

## New

### Editing

- **`editable`**: drag on an empty area to lasso; Shift, Ctrl or Cmd add to the selection; dragging moves all selected nodes, snapping to a 16px grid (`grid`). A toolbar (the Aurea `Toolbar`) aligns by six edges, distributes with the ends fixed, pins and re-runs the layout.
- **Keyboard and panning in edit mode**: arrow keys move the selection one grid step (four with Shift). Pan with the middle or right mouse button, or Space + drag. With `editable` off, the graph is read-only as before.
- **Undo and redo**: buttons, Ctrl+Z, Ctrl+Shift+Z and Ctrl+Y, with the last 100 steps.
- **`onLayoutChange`**: called on every step (forward or back) with the position of every node and the pinned ones. Saving is up to the app. Also `onSelectionChange`.
- **`pinned`**: a pinned node cannot be dragged, and re-running the layout moves every node except it. Nodes that would land on a pinned one move aside.

### Edges and labels

- **Edges that avoid nodes.** In the layered layout, step edges follow the route computed by `elkjs`, at right angles with parallel edges spaced apart. After manual arranging (or with saved positions), an edge that would cross a node detours around it.
- **New optional dependency `@tisoap/react-flow-smart-edge`** (5.0, MIT, no dependencies) computes the detour; the drawing stays Aurea's. Without it, edges stay as they were and the console warns once.
- **Bridges at crossings**: the later edge jumps over the earlier one in a small arc.
- **Labels that hide**: no label covers another label or a node. The one with higher `priority` stays; on a tie, the one earlier in the list. Below 60% zoom, edge text hides.

### Containers and layouts

- **Containers (`parentId`)**: a box around child nodes (site, floor, rack) with a collapse button, icon and name. In the layered layout, children go inside it. One parent per node.
- **`collapsed` and `onCollapseChange`**: a collapsed container hides its children and shows how many ("+4"). Their edges leave from the container, and edges between the same pair merge into one with a count.
- **`collapsible`**: a button in the node's corner hides what can only be reached through it. With redundant links, a node reachable another way does not hide.
- **`shape: "cloud"`**: for the internet, public clouds and remote sites.
- **`layout="tree"`** (a compact tree) and **`layout="radial"`** (the root in the center, straight edges). In these layouts, open containers are not drawn as boxes; children appear on their own.

### Large graphs and export

- **`visibleOnly`**: draws only what is on screen.
- **`layoutWorker`**: runs the layout off the main thread, with a worker your app provides (the Vite recipe is in the README). Zoom out now goes down to 10%.
- **`.drawio` export** includes containers (with their children inside), cloud shapes and bends.
- **`apiRef`**: `undo()`, `redo()`, `align(edge)`, `distribute(axis)`, `relayout()` and `getLayout()`. New types: `GraphLayoutChange` and `GraphAlign`.

## Changed

- **Layered layout with `edgeShape="step"`**: edges follow the route from the layout engine instead of the renderer's default step. These edges look different, and no longer pass through nodes.
- **HTML edge labels** (the pill and the port name) render above edges and nodes (`--graph-label-z`). Inside a container, port names used to appear under the container box.
- **The `@xyflow/react` peer now requires `^12.11.3`** (was `^12.11.2`): 12.11.3 fixes touch dragging together with the lasso, which edit mode uses. Tested on 12.12.0.
- **Nodes with ports** send the position of each port to the layout engine (not just the order), so routes start at the drawn handle.

## Fixed

- **Keyboard on the read-only graph.** Each node had two Tab stops, and every edge received Tab, with an English name from the renderer and an instruction to delete it. Now each node is one stop. An edge is a stop only with `onEdgeSelect`, gets a name built from the two nodes it links, and Enter selects it. All text shown by the renderer comes from the Aurea strings.

## Breaking changes

- **`AureaStrings` (web) has 22 new keys**: `graphArrange`, `graphUndo`, `graphRedo`, `graphAlignLeft`, `graphAlignCenter`, `graphAlignRight`, `graphAlignTop`, `graphAlignMiddle`, `graphAlignBottom`, `graphDistributeH`, `graphDistributeV`, `graphPin`, `graphPinned`, `graphRelayout`, `graphExpand`, `graphCollapse`, `graphHidden`, `graphEdge`, `graphEdgeHelp`, `graphHandle`, `graphNodeHelp` and `graphMoved`. If you build the whole object yourself, add them. Passing only some strings to `AureaProvider` is unaffected.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.31.0 @aurea-uds/core@0.31.0 @aurea-uds/fonts@0.31.0 @aurea-uds/icons@0.31.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.31.0
```
