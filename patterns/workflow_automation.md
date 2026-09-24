---
archetype: workflow_automation
patterns: VisualBuilder, RunSession, ReviewCompare
---

# Automation · workflow

A visual flow builder: nodes and edges, runs with history,
version comparison. A credential is referenced, never displayed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Composition

**VisualBuilder** — the canvas is `.builder-canvas` with `.builder-node` (steps)
and `.builder-edge` (connections). `.builder-outline` is the keyboard/reader
alternative required by the contract: the SAME topology as a navigable and
editable list, not a decorative extra. Editing a node opens a `Drawer`
with `Field`/`Input`/`Select`.

**RunSession** — each run is a `Timeline` of traversed nodes; a node in a
`Badge` (accepted → running → done/failed). `LogStream` for output;
`.invocation` per step (input/output in `CodeBlock`); `.trace` links
node → run → result. `.event-stream` for the live run.

**ReviewCompare** — flow versions compare before/after in `Tabs` +
`CodeBlock`; publishing a change confirms in a `Dialog` that states the
scope (which nodes changed). `Timeline` keeps the version history.

## Capabilities

- **node graph** — `.builder-canvas`/`-node`/`-edge` + `.builder-outline`.
- **variables** — `Field`/`Input` on the node; referenced by name, resolved at run.
- **credentials** — a named reference (`Select` of a registered credential);
  the value NEVER appears in the UI, only the label.
- **debug** — run a single node in isolation; `.invocation` shows input/output;
  filterable `LogStream`.
- **run history** — `Timeline`/`DataGrid` of runs: id, trigger,
  result, duration; opening one reconstructs that run's `Timeline`.

## Invariants

> "credentials are referenced never displayed"

A secret enters by reference to a registered credential and is shown
as a label (`Badge`/`Select`), never in clear text — not in a field, log,
`.invocation` or diff. Editing replaces the reference; revealing the value
is not a UI action.

> "canvas actions have keyboard alternatives"

Every canvas action (add node, connect, move, delete) has a keyboard path
via `.builder-outline` — the list is editable, not read-only. Nothing
depends exclusively on dragging with the mouse; `.builder-canvas` is the
view, the outline is the accessible parity.

## States

- `loading` — `Skeleton` in the canvas and the outline.
- `empty` — a new flow: `EmptyState` in the canvas with "add first node".
- `running` — active nodes with a pulsing `Badge`; live `.event-stream`.
- `failed` — the failed node highlighted in the `Timeline` and outline, with the cause.
- `debug` — an isolated node run is flagged; doesn't count in the real run history.
- `error` — `Alert`; the saved flow stays editable.
