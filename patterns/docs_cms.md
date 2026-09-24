---
archetype: docs_cms
patterns: AppShell, ContentWorkbench, CollectionWorkbench
---

# Docs · CMS

Content authoring: edit, version, publish. Draft and published
are distinct, visible states.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Composition

**AppShell** — `AppShell` with `.doc-sidebar` (content tree) and
a `.doc-topbar` of actions; `Breadcrumb` of the position in the hierarchy.
`CommandPaletteShell` to jump to any page. Author `Avatar` in the
shell (there IS a session here — it's an authoring tool, not a public site).

**ContentWorkbench** — the editor occupies `.doc-main`; `.doc-nav` shows the
outline (`TreeView`) that updates with the headings. `Tabs` separate
Edit ⟷ Preview; `CodeBlock` for the content's code blocks.
`.doc-actions` pins Save and Publish as SEPARATE actions.

**CollectionWorkbench** — the library of pages/articles is a `DataGrid`:
title, author, state (draft/published), version, updated. Filter
by state via faceted `MultiCombobox`; `SearchField` over content.
`.file-list` for the attached assets.

## Capabilities

- **search** — `SearchField` over content and metadata; results in a `DataGrid`.
- **outline** — `TreeView` in `.doc-nav`, derived from the headings.
- **assets** — `FileInput` to upload; `.file-list`/`.file-item` to manage;
  each asset shows where it's used before allowing removal.
- **versioning** — `Timeline` of versions per page; each point is a version
  with author/time; comparing two opens a diff (`Tabs` + `CodeBlock`).
- **publishing** — `.doc-actions`: Publish is a primary `Button` distinct from
  Save; a state `Badge` (draft/published/scheduled) always visible.

## Invariants

> "save is distinct from publish"

Save writes a draft; Publish makes it public. They are two different
controls, labeled, never the same button. Save NEVER publishes as a
side effect; the state (`Badge`) says which version is public.

> "restores preserve version provenance"

Restoring an old version creates a NEW version that points to the origin
("restored from v3"), in the `Timeline`. History is neither rewritten nor
erased; the provenance of each restore is recorded.

## States

- `loading` — `Skeleton` in the list and the editor.
- `empty` — `EmptyState` with "create first page".
- `draft` — `Badge` draft; the public version (if any) stays live.
- `published` — `Badge` published + time; permalink visible.
- `conflict` — two authors on the same page: `Alert` with "view differences",
  never overwrite silently.
- `error` — `Alert` in the editor; the local draft isn't lost.
