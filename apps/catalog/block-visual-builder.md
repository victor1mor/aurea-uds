# Visual builder

A canvas with an ordered outline that says the same thing, so building never requires a mouse: add from the palette, move in the outline, connect in the inspector. Credentials appear as references and never as values. Undo and redo sit beside whatever the state machine actually allows right now.

## Usage

```tsx
import {DependencyGraph, Status, Alert, Button, DataList, Field, Select, Toolbar, ToolbarButton} from "@aurea-uds/react";
```

```tsx
// Which actions exist is a fact about the FLOW, so it comes from its own state machine.
// Seven of the ten actions have no transition — add, connect, configure, move, delete,
// undo, redo — because editing the canvas changes the drawing, not the machine. And the
// reverse happens too: edit and resume are transitions that are NOT in actions, so no
// button offers them.
const actions = allowedFrom(flow.state);   // idle -> ["run"]

<div className="stack">
  {/* the palette adds by BUTTON: in a drag-only palette, whoever cannot drag builds nothing */}
  <div role="group" aria-label="Palette" className="cluster">
    {kinds.map(k => <Button key={k} leadingIcon="plus" onClick={() => add(k)}>{k}</Button>)}
    <Status variant={tone[flow.state]}>{label[flow.state]}</Status>
  </div>

  {/* "validation errors link to nodes": the message names the node, and the node exists */}
  {flow.state === "invalid" && <Alert variant="danger" title="1 problem">{error.text}</Alert>}

  <div className="grid" style={{gridTemplateColumns:"1fr 15rem"}}>
    {/* height is a PROP of the graph (Part H), so no core change was needed here */}
    <DependencyGraph label="Canvas" height="9rem" nodes={nodes} edges={edges}
      selectedId={selected} onSelect={setSelected} />

    {/* "canvas has an equivalent ordered outline" — ONE source feeds both, and the outline is
        where moving happens without dragging: every row has up and down */}
    <div role="group" aria-label="Outline">
      <ol>{nodes.map((n, i) =>
        <li key={n.id}>
          <span>{n.label}</span>
          {i > 0 && <Button variant="ghost" aria-label={"Move " + n.label + " up"}>↑</Button>}
          {i < nodes.length - 1 && <Button variant="ghost" aria-label={"Move " + n.label + " down"}>↓</Button>}
        </li>)}</ol>
    </div>
  </div>

  <div className="grid" style={{gridTemplateColumns:"1fr 1fr"}}>
    {/* the inspector is where CONNECTING happens without dragging: a select of valid targets
        does by keyboard what a dragged edge does by mouse */}
    <div role="group" aria-label="Inspector">
      <DataList items={[{term:"Node",value:node.label},{term:"Detail",value:node.detail}]} />
      <Field label="Connect to">
        <Select value={target} onChange={connect} aria-label={"Connect " + node.label + " to"}>…</Select>
      </Field>
    </div>

    {/* "credentials are referenced never exposed" — the value is not here, not even masked:
        a mask is a value with tape on it, and it is still in the DOM */}
    <div role="group" aria-label="Variables"><DataList items={variables} /></div>
  </div>

  <div className="grid" style={{gridTemplateColumns:"1fr auto"}}>
    <div role="group" aria-label="Run history"><DataList items={history} /></div>
    {/* "undo redo and versioning cover structural edits" — they exist always, beside whatever
        the transition table permits right now */}
    <div role="group" aria-label="Actions">
      <Toolbar label="Builder actions">
        <ToolbarButton>Undo</ToolbarButton><ToolbarButton>Redo</ToolbarButton>
        {actions.map(a => <ToolbarButton key={a} onClick={() => send(a)}>{label[a]}</ToolbarButton>)}
      </Toolbar>
    </div>
  </div>
</div>
```
