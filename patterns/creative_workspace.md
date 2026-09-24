---
archetype: creative_workspace
patterns: VisualBuilder, ContentWorkbench, MediaLibrary, ConversationChannel
---

# Creative workspace

Canvas, assets, versions and comments: every canvas operation has
an outline alternative and versions compare and restore.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Composition

**VisualBuilder** — the canvas in `.builder-canvas`/`-node`/`-edge`;
`.builder-outline` is the SAME composition as a navigable and editable tree —
the keyboard/reader alternative required by the contract, not an extra. Editing
a layer opens a `Drawer` with `Field`/controls.

**ContentWorkbench** — the work's text/code in `.doc-main`; `Tabs`
edit ⟷ preview; `.doc-nav`/`TreeView` of sections/layers.

**MediaLibrary** — assets (images, audio, video) in `.media-library-row`/
`.media-compact`; opening enlarges in a `Dialog` (lightbox). `FileInput` to upload.

**ConversationChannel** — anchored comments in `.message` + `Avatar`;
`NotificationCenter` notifies of a mention/requested review.

## Capabilities

- **canvas** — `.builder-canvas` + `.builder-outline` (keyboard parity).
- **assets** — MediaLibrary + `FileInput`; each asset shows where it's used.
- **versions** — a `Timeline` of versions; compare (`Tabs`) and restore.
- **comments** — `.message` anchored to a node/passage; resolving marks a state.
- **review** — request/give a review via a scope `Dialog` + comments.

## Invariants

> "every canvas operation has an outline alternative"

Every canvas operation — add, move, group, delete — also exists
in `.builder-outline`, editable by keyboard. Nothing depends on dragging with
the mouse alone; a screen reader user does the same work through the list. The canvas is
the view; the outline is the parity.

> "versions support compare and restore"

A version is not just a stamp: you can COMPARE two (`Tabs` + diff) and
RESTORE one. Restoring creates a new version pointing to the origin (it doesn't rewrite the
history) — same provenance as `docs_cms`. Comparing before restoring is the way.

## States

- `loading` — `Skeleton` in the canvas and the outline.
- `empty` — a new project: `EmptyState` in the canvas with "add first element".
- `editing` — autosave/draft visible; focus on the active element.
- `commenting` — an anchored comment; a counter of unresolved ones.
- `reviewing` — a version comparison; approve/request changes with scope.
- `error` — `Alert`; the work on the canvas isn't lost.
