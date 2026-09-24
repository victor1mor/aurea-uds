---
archetype: personal_productivity
patterns: AppShell, CollectionWorkbench, SchedulePlanner, ContentWorkbench
---

# Personal productivity

Tasks, notes and calendar: offline editing is recoverable and navigating
never discards unsaved work.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Composition

**AppShell** — a lean `AppShell` with navigation between tasks/notes/agenda;
`CommandPaletteShell` for quick capture and to jump to any item. `Banner`
for offline/sync state.

**CollectionWorkbench** — tasks in `DataList`/`DataGrid`: complete via a
`Checkbox`, facet via `MultiCombobox` (project, tag, deadline). `SearchField`
over everything; `SegmentedControl` list ⟷ grouped.

**SchedulePlanner** — calendar in `.schedule-grid`, appointments in
`.agenda-list`; native `Input type="date"`. A task with a deadline appears on the agenda.

**ContentWorkbench** — notes in `.doc-main`; `.doc-nav`/`TreeView` of
notebooks; `Tabs` edit ⟷ read. Autosave visible (draft saved locally).

## Capabilities

- **tasks** — `DataList` + `Checkbox`; sort/group; deadline on the agenda.
- **notes** — ContentWorkbench with autosave; search in the body.
- **calendar** — `.schedule-grid`/`.agenda-list`; native `Input type="date"`.
- **offline draft** — local editing persisted; syncs on reconnect.

## Invariants

> "offline edits remain recoverable"

Editing offline writes locally immediately; nothing depends on the network to avoid being
lost. A `Banner` shows the state; on reconnect, it syncs and flags a
conflict with an `Alert` ("view differences") instead of overwriting. Closing the tab
doesn't erase the draft.

> "navigation preserves dirty work"

Leaving a note/task with an unsaved change does NOT discard it silently:
autosave writes, or the UI warns before navigating. Switching items, going back in the
browser or closing the `Drawer` preserves the dirty work — recoverable on return.

## States

- `loading` — `Skeleton` in the lists.
- `empty` — no items: `EmptyState` with quick capture.
- `editing` — a draft/autosave indicator visible.
- `syncing` — `Badge`/`Banner`; editing continues during the sync.
- `conflict` — `Alert` with "view differences"; never overwrite blindly.
- `offline` — `Banner`; everything works locally, a sync queue.
