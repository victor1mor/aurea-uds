---
archetype: project_crm_erp
patterns: CollectionWorkbench, FormFlow, SchedulePlanner, ConversationChannel, VisualBuilder
---

# Projects · CRM/ERP

Records, pipeline, assignments and automation: an audited history is
append-only and bulk scope is shown before mutating.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Composition

**CollectionWorkbench** — the record core: `DataGrid` (sort/filter/
select), `SearchField` + faceted `MultiCombobox`. `SegmentedControl`
toggles table ⟷ pipeline kanban (`DataList` in columns per stage).

**FormFlow** — create/edit a record in a `Drawer`/route: `Field` +
`Input`/`Select`/`MultiCombobox`; per-field validation (`.field-error`).
Bulk actions confirm scope before applying.

**SchedulePlanner** — deadlines and activities in `.schedule-grid`/`.agenda-list`;
native `Input type="date"`. An assignment shows the owner (`Avatar`).

**ConversationChannel** — notes and comments per record in `.message` +
`Avatar`; `NotificationCenter` notifies the owner on a mention/assignment.

**VisualBuilder** — automations (rules "when X → do Y") in
`.builder-canvas`/`-node`/`-edge`, with `.builder-outline` as the editable keyboard
parity — not decoration.

## Capabilities

- **records** — `DataGrid`; detail in a `Drawer`/route with FormFlow.
- **pipeline** — kanban per stage; moving confirms if it triggers an effect.
- **assignments** — owner in `Avatar`/`Badge`; reassigning is audited.
- **history** — append-only `Timeline` per record; who/when/what.
- **automation** — VisualBuilder; test before activating; run history.

## Invariants

> "history is append-only for audited changes"

An audited change does NOT rewrite the past: it edits by creating a new event in the
`Timeline` ("field X: A → B, by Alex, at 2:00 PM"). Correcting is a new
record that points to the previous one; nothing disappears from history, nothing is edited in place.

> "bulk scope is shown before mutation"

A bulk action states the scope BEFORE applying — a `Dialog` with "this changes
128 records", the filter that selected them and the change. No blind "apply to all";
the selection is explicit (the `DataGrid` returns the original rows).

## States

- `loading` — `Skeleton` in the grid/kanban.
- `empty` — no records: `EmptyState` with "create the first".
- `no_results` — facets with no return; `EmptyState` with "clear filters".
- `selecting` — a bulk bar with the scope visible.
- `saving` — button in `loading`; result via `useToast`/`Alert`.
- `error` — `Alert` with retry; the previous data remains.
