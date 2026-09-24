---
archetype: mobile_pwa
patterns: AppShell, FormFlow, CollectionWorkbench
---

# Mobile · PWA

An installable, responsive app: everything works at 320px and touch and keyboard
keep parity.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Composition

**AppShell** — an `AppShell` that reflows to a single column; navigation in a `Drawer`
on narrow screens, `.skip-link` first in the DOM. `Banner` for
offline/install state. The shell never depends on hover for a function.

**FormFlow** — touch forms: `Field` + native controls
(`Input`/`Select`/`Switch`) with an adequate touch target; a `.stepper` that
stacks on narrow screens. The system keyboard doesn't cover the focused field.

**CollectionWorkbench** — lists in `DataList` (cards stack); `DataGrid`
scrolls horizontally within its own container without overflowing the page.
`SearchField` at the top; `Pagination` with large touch targets.

## Capabilities

- **reflow** — from multi-column to a single column without losing order or content.
- **touch** — adequate targets; no hover-only actions; gestures with an alternative.
- **offline** — `Banner` + a cached shell; reading works without a network.
- **installable shell** — the app-shell loads installed; content hydrates afterward.

## Invariants

> "all features work at 320 CSS pixels"

No feature requires more than 320px of width. Everything reflows: no horizontal
scroll on the page (only inside a table/code, in its own container),
no clipped content, no unreachable control. 320px is a tested floor (a rule
already applied to the toast in Phase 0), not an aspiration.

> "touch and keyboard keep parity"

Every touch action has a keyboard equivalent and vice versa. Nothing depends
on a gesture alone (swipe, long-press) without a visible alternative; focus and tab
order work. Touch and keyboard reach the same place.

## States

- `loading` — `Skeleton`; the installed shell appears before the content.
- `empty` — an `EmptyState` that fits in 320px.
- `offline` — `Banner`; cached content readable, actions queue.
- `installing`/`updating` — a discreet `Banner`; doesn't block use.
- `error` — an `Alert` that reflows; retry with a large touch target.
