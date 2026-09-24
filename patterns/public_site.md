---
archetype: public_site
patterns: AppShell, ContentWorkbench, FormFlow
---

# Public site

Landing, docs, blog and portfolio: public content that reads without login and
converts whoever arrives.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Composition

**AppShell** — a lean shell: `.brand` + top navigation, `.skip-link`
first in the DOM (a screen reader jumps straight to the content). No session
bar — no `Avatar`/organization; the public doesn't authenticate. `Banner`
only for a global notice (cookies, maintenance), never for a content gate.

**ContentWorkbench** — the page being read is `.doc-main` with `.doc-section`;
`.doc-nav` (table of contents) for long docs, `TreeView` as an outline when the
page tree is deep. `CodeBlock` in code snippets; `Tabs`
for variations (e.g. installation per package manager).

**FormFlow** — conversion capture in `Field` + `Input`/`Select`/
`Textarea`: contact, newsletter, "contact sales". Per-field validation
(`.field-error`), result via `useToast` on success and `Alert` on error.

## Capabilities

- **landing** — `.hero` + `.hero-meta`; CTA as a primary `Button`.
- **docs** — ContentWorkbench with `.doc-nav`/`TreeView` outline.
- **blog** — list in `DataList` (cards) → post in `.doc-main`.
- **portfolio** — `.pattern-gallery` of items; each item opens a detail.
- **search** — `SearchField` at the top; results in `DataList`; empty with an
  `EmptyState` that suggests terms, not just "nothing found".
- **conversion** — a short FormFlow; `Badge`/`.hint` of social proof.

## Invariants

> "public content works without authentication"

No public content depends on a session to render. No `Avatar`,
no `.permission-row`, no login gate in the reading path. A CTA
may LEAD to signup, but never block content already shown.

> "reading order survives reflow"

DOM order = reading order, before any visual column. Grids
(`.pattern-gallery`, `Grid`) reflow to a single column without reordering; the
`.skip-link` comes first; nothing positioned by CSS alone out of order.

## States

- `loading` — `Skeleton` in the hero/cards; the structure doesn't jump when it loads.
- `empty` (search) — `EmptyState` with suggested terms.
- `no_results` — distinct from the initial empty; offers "clear search".
- `error` — `Alert` in the content area; navigation stays usable.
- `submitted` (form) — inline confirmation; doesn't reload the whole page.
