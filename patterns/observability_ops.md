---
archetype: observability_ops
patterns: AnalyticsWorkbench, RunSession, ResourceWorkbench, DeviceControl
---

# Observability · ops

Telemetry, logs, alerts and remediation: a live update is pausable and
remediation links to the alert and the receipt.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Composition

**AnalyticsWorkbench** — metrics in `.chart-line`/`.chart-area` with `.legend`
(unit always); `KPI`/`.pattern-kpis` for golden signals; `DataGrid` as a
tabular reading. `SegmentedControl` for the time window.

**RunSession** — live logs and runs in `LogStream`/`.event-stream`,
pausable; `.invocation`/`.trace` correlate event → cause → result;
a state `Badge`. Remediation (running a runbook) is a run with a receipt.

**ResourceWorkbench** — resources/services in a `TreeView` (`.file-list`);
`.health-matrix` of the overall state; `.usage-bars` for saturation; `Tabs` +
`CodeBlock` for config/manifest.

**DeviceControl** — a fleet of hosts/services in a `.device-grid`; `.cost-meter`
when there's a cost; a sensitive mitigation command goes through `Alert`/`.approval`.

## Capabilities

- **telemetry** — `.chart-*` + `KPI` + `DataGrid`; unit and time always.
- **logs** — a filterable and pausable `LogStream`; correlated by trace.
- **alerts** — `Alert`/`Badge` per severity; `NotificationCenter` on arrival.
- **remediation** — a runbook as a RunSession; a receipt linked to the alert that fired it.

## Invariants

> "live updates can be paused"

A live stream (`LogStream`/`.event-stream`/chart) has a pause: pausing
freezes the VIEW without losing the buffer or the underlying state. Investigating doesn't
fight the flow — resuming continues where it was. (Same decision as
`agent_ai`: the stream pauses, the state isn't lost.)

> "remediation links to alert and receipt"

Every remediation action points to the ALERT that motivated it and produces a RECEIPT of
what it did (`.trace`/`.memory-entry`: command, scope, result, time). From the
alert you reach the mitigation and its receipt, and vice versa — a closed chain,
no orphan action.

## States

- `loading` — `Skeleton` in the panels; a placeholder in the charts.
- `empty` — no signals: `EmptyState` ("no metrics in the period").
- `live` — a live `.status-dot` + a pause control present.
- `paused` — a frozen view flagged; buffer preserved.
- `alerting` — `Alert` per severity; remediation with scope.
- `error` — `Alert`; the last valid reading remains, timestamped.
