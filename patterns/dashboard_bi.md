---
archetype: dashboard_bi
patterns: AppShell, AnalyticsWorkbench, CollectionWorkbench
---

# Dashboard · BI

Reading metrics: KPIs, time series, segmentation and drilldown down to the
data row.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Composition

**AppShell** — navigation between dashboards; the global filter (time range,
segment) lives in the shell's context header, not inside each
chart.

**AnalyticsWorkbench** — a row of `KPI` at the top (`.pattern-kpis`);
charts with `.chart`/`.chart-line`/`.chart-area` + `.legend`.
`SegmentedControl` for the time range (7d/30d/90d); a pair of
native `Input type="date"` for a custom range (step 5 decision:
platform before library).

**CollectionWorkbench** — the drilldown ends in a `DataGrid`: clicking a
point/segment opens the list of rows behind the number, with the same
filters applied.

## Capabilities

- **KPI** — `KPI` with delta; the change is never color alone (arrow + sign in text).
- **time range** — `SegmentedControl` + native dates; the active range appears
  spelled out near the title ("Jun 1–30").
- **segments** — faceted `MultiCombobox` in the header; chips show the
  active selection.
- **drilldown** — chart → filtered `DataGrid`; `Breadcrumb` marks the level.
- **export** — button in the table toolbar; exports what the current filter
  shows, and says so in the label ("Export 214 rows").

## Invariants

> "every chart has a tabular alternative"

Every chart has a "view as table" toggle (`SegmentedControl`
chart ⟷ table) that renders the SAME data in `Table`/`DataGrid`.
Not a hidden a11y shortcut: a first-class view.

> "filter scope persists through drilldown"

Time range and segments live in a single state at the shell level.
The drilldown inherits that state and displays it (chips at the top of the table);
going back (`Breadcrumb`) resets nothing.

## States

- `loading` — `Skeleton` in the chart's shape (not a generic spinner).
- `empty` — `EmptyState` explaining the range/segment with no data.
- `partial`/`stale` — `Badge` "updated X ago" near the title;
  `refreshing` doesn't wipe the previous chart.
- `error` — `Alert` with retry per widget; the rest of the dashboard survives.
