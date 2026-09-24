---
archetype: saas_admin
patterns: AppShell, CollectionWorkbench, FormFlow, IdentityAccess
---

# SaaS · admin

Multi-tenant admin panel: navigate, list, create/edit records, settings and
roles.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Composition

**AppShell** — `AppShell` with side navigation, `.skip-link` first in the DOM,
`Breadcrumb` in the context header. `CommandPaletteShell` to jump to any
record. Global `Banner` for degraded/offline state.

**CollectionWorkbench** — `DataGrid` is the center: sort, global filter,
pagination and selection come built in. `SearchField` composed in the toolbar;
`MultiCombobox` for facets (status, plan, role). `SegmentedControl`
toggles table ⟷ cards (`DataList`).

**FormFlow** — create/edit in a `Drawer` (simple record) or a dedicated route
(large record). `Field` + `Input`/`Select`/`Textarea`/`Switch`;
per-field error via `Field` (`.field-error`), result via `useToast`.

**IdentityAccess** — `Avatar` + organization name ALWAYS at the top of the shell.
Roles in `.permission-row`; switching role/organization confirms in a
`Dialog` with explicit scope.

## Capabilities

- **navigation** — `AppShell` side nav + `CommandPaletteShell` + `Breadcrumb`.
- **CRUD** — `DataGrid` (R) + `Drawer`/route with FormFlow (C/U) +
  confirmation `Dialog` (D — never delete without confirming).
- **settings** — dedicated route with FormFlow; sections in `Tabs`.
- **roles** — `.permission-row` per role; `Badge` of the active role in the shell.

## Invariants

> "writes expose validation and result"

Every submit shows: per-field validation (`Field` with error), `loading`
state on the button, and a result (`useToast` on success, `Alert` on server
error). Never close the Drawer without a visible result.

> "active organization and role stay visible"

Organization and role stay in the shell (top), outside the scrolling content.
Switching organization is an explicit action with a `Dialog` — never a side
effect of navigation.

## States

- `loading` — `Skeleton` in the grid rows.
- `empty` — `EmptyState` with a primary action ("Create the first…").
- `no_results` — a distinct `EmptyState`, with "clear filters".
- `error` — `Alert` with retry; the previous grid stays visible if there was data.
- `offline`/`degraded` — global `Banner` in the shell, not per widget.
