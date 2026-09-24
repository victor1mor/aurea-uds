---
archetype: maps_logistics
patterns: SpatialWorkbench, CollectionWorkbench, ResourceWorkbench, SchedulePlanner
---

# Maps · logistics

Routes, layers and tracking on the map: every selection mirrors a list and
offline freshness is declared.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Composition

**SpatialWorkbench** — `.map-panel` with `.map-marker` (points) and `.map-route`
(paths). ALWAYS mirrored by a list (`DataList`/`DataGrid`): what's
on the map is in the list, and selecting in one syncs the other — it's the accessible
parity, not an extra. Layers toggle on/off via `Checkbox`/`Switch`.

**CollectionWorkbench** — the mirror list: stops, vehicles, deliveries in a
`DataGrid` (sort/filter/select). `SearchField` + faceted `MultiCombobox`
(status, region, driver). `SegmentedControl` map ⟷ list ⟷ split.

**ResourceWorkbench** — the detail of a vehicle/route: `TreeView` of segments,
`Tabs`, `.usage-bars` (load, fuel), `.health-matrix` of the fleet.

**SchedulePlanner** — delivery windows in `.schedule-grid`/`.agenda-list`;
native `Input type="date"` for the day.

## Capabilities

- **maps** — `.map-panel`; markers and routes with keyboard focus via the list.
- **routes** — `.map-route` + segments in a `TreeView`; ETA per leg.
- **layers** — layer toggles; state visible, without hiding critical data.
- **tracking** — live position in `.map-marker` + `.status-dot`; pausable.
- **ETA** — `Badge`/`.time-display`; always with a reference time.

## Invariants

> "map selection mirrors a list"

Nothing exists only on the map. Each `.map-marker`/`.map-route` has a
corresponding row in the list; selecting in one highlights the other. Those who don't use the map
(keyboard, screen reader) operate everything through the list — same information, same
actions. The map is a view, not the only door.

> "offline freshness is explicit"

Cached data shows WHEN it was updated ("3 min ago", via
`.time-display`/`Badge`). Offline doesn't pretend to be live: a `Banner` declares the
state and the age of the data. A stale position never presents itself as current.

## States

- `loading` — `Skeleton` in the list; a placeholder in the `.map-panel`.
- `empty` — no points: `EmptyState` with "add stop".
- `tracking` — a live `.status-dot`; a pause control present.
- `stale`/`offline` — `Banner` + the age of the data; nothing passes as real-time.
- `error` — `Alert`; the last known position remains, marked as such.
