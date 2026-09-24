---
archetype: iot_control
patterns: DeviceControl, AnalyticsWorkbench, RunSession, ReviewCompare
---

# IoT · control

A device fleet: telemetry, commands and calibration. An unsafe
command is gated; all telemetry carries time and unit.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Composition

**DeviceControl** — a `.device-grid` of devices; `.health-matrix` of the
fleet state; `.usage-bars` for consumption/load; `.cost-meter` when there's
a cost per use. A sensitive command triggers an `Alert`/`Dialog` of scope before
executing.

**AnalyticsWorkbench** — telemetry in `.chart-line`/`.chart-area` with
`.legend`; `KPI` for aggregates; `DataGrid` as a tabular reading. Each series
declares its unit on the axis and in the `.legend`. `SegmentedControl` for the time window.

**RunSession** — sending a command is a run: `Timeline`/`.event-stream` of
progress, `.invocation` (command → ack → result), a `Badge`
(queued/running/acked/failed), `.approval` for the dangerous-command gate.

**ReviewCompare** — a firmware/config change compares current ⟷ proposed in
`Tabs` + `CodeBlock`; applying confirms scope (which devices) in a `Dialog`.

## Capabilities

- **fleet** — `.device-grid`; group/facet by type, location, state.
- **telemetry** — `.chart-*` + `DataGrid`; unit always visible.
- **commands** — RunSession per command; ack and result traceable.
- **alerts** — `Alert`/`Badge` per severity; `NotificationCenter` on arrival.
- **calibration** — per-device fine-tuning (the physical world drifts:
  clock, sensor, actuator). `Field`/`Range` with the current value + a
  recalibrate button; the UI exposes the knob, it doesn't hide the correction.

## Invariants

> "unsafe commands are gated"

A command that changes the physical world in a risky way (restart, update
firmware, power off) goes through an `.approval`/`Dialog` that states the scope —
which devices, what happens. It doesn't execute by default or by a distracted
Enter; cancel is the same size as confirm.

> "telemetry always carries time and unit"

No telemetry value appears "bare". Each reading carries a
timestamp (`.time-display`) and a unit (°C, %, rpm) — on the axis, in the `.legend`, in the
`DataGrid` cell. A number with no unit or time is a bug, not saved space.

## States

- `loading` — `Skeleton` in the grid; a placeholder in the charts.
- `empty` — no devices: `EmptyState` with "register a device".
- `online`/`offline` — `.status-dot`/`.health-matrix`; offline doesn't zero out, it marks stale.
- `commanding` — `Badge` running + `.event-stream`; an ack is expected.
- `alert` — `Alert` per severity; a mitigation command with scope.
- `error` — `Alert`; the last valid telemetry remains, timestamped.
