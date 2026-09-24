---
archetype: catalog_gallery
patterns: CollectionWorkbench, MediaLibrary, FormFlow
---

# Catalog · gallery

A navigable visual collection: facet, toggle grid/list, select and
act in bulk. The query survives the view switch.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Composition

**CollectionWorkbench** — the core. `SearchField` + `MultiCombobox` for
facets (category, tag, range). `SegmentedControl` toggles grid ⟷ table:
grid is `.pattern-gallery`, table is `DataGrid`. `Pagination` below;
`EmptyState`/`Skeleton` for empty and loading. Bulk selection via the
`DataGrid` checkboxes (which already emit the original rows in the callback).

**MediaLibrary** — each item is a visual piece: `.media-library-art`
(thumb) + `.media-library-copy`. Opening enlarges it in a `Dialog` as a lightbox
(focus trapped, Escape closes, arrows navigate). `.media-compact` in the dense list.

**FormFlow** — edit an item's metadata in a `Drawer`: `Field` +
`Input`/`Select`/`MultiCombobox` (tags). Bulk actions confirm scope
("edit 12 items") in a `Dialog` before applying.

## Capabilities

- **facets** — `MultiCombobox` per dimension; chips show the active filter.
- **saved views** — a combination of facets + a named view; switched by
  `SegmentedControl`/`Select`; the URL carries the query.
- **gallery** — responsive `.pattern-gallery`; thumb with `aspect-ratio`.
- **lightbox** — `Dialog` enlarges the piece; navigates without closing; caption visible.
- **selection** — checkbox per item; a persistent selected count.
- **bulk actions** — an action bar appears with selection > 0; each action
  confirms scope.

## Invariants

> "view changes preserve the query"

Toggling grid ⟷ table or reordering does NOT clear facets or search. The
query is the state; the view is only presentation. Returning to the grid brings
the same filtered items, on the same page.

> "selection remains explicit across pagination"

Selecting is always per checked item, never an implicit "all 4000".
When paginating, the previous selection persists and the counter shows how many —
the `DataGrid` returns the original rows, so the selection survives
filter and page. "Select all" marks the PAGE and says so.

## States

- `loading` — `Skeleton` in the grid cells (keeps the template).
- `empty` — `EmptyState`: an empty catalog, with an import action.
- `no_results` — facets with no return; `EmptyState` with "clear facets".
- `selecting` — bulk action bar; counter visible.
- `error` — `Alert`; the already-loaded items remain.
