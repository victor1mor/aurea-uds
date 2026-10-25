# Analytics workbench

The period, the filters, the segments and the export scope on one line; the number, the curve and the same curve as a table below it. The table is not a fallback and not a tab: a chart without its numbers excludes whoever cannot read the chart.

## Usage

```tsx
import {SegmentedControl, Status, Select, Button, KPI, Chart, Table, Alert} from "@aurea-uds/react";
```

```tsx
// Which actions exist is a fact about the DATA, so it comes from its own state machine.
// This contract has no "actions" region: seven of its eight actions have no transition,
// because changing the range does not change the STATE — it refetches. The regions ARE
// the controls, and `refresh` lives with the range, which is what owns freshness.
const actions = allowedFrom(view.state);   // ready -> ["refresh"]

<div className="stack" style={{"--chart-h":"8rem"} as CSSProperties}>
  <div className="cluster">
    <div role="group" aria-label="Time range">
      <SegmentedControl label="Time range" items={RANGES} value={view.range} onChange={setRange} />
      {/* two of the seven states are UNIVERSAL (ADR-0018): pass the state and the
          sentence comes from the vocabulary, so the tela never invents a second wording */}
      {isUniversal(view.state)
        ? <Status state={view.state} />
        : <Status variant={tone[view.state]}>{label[view.state]}</Status>}
      {actions.map(a => <Button key={a} size="sm" onClick={() => send(a)}>{label[a]}</Button>)}
    </div>
    <div role="group" aria-label="Filters"><Select value={view.filter} /* … */ /></div>
    <div role="group" aria-label="Segments"><Select value={view.segment} /* … */ /></div>
    {/* "export records scope and freshness": both in the LABEL, because whoever clicks
        needs to know what comes out before it comes out. Keep it SHORT — this row holds four
        control groups on one line, and a label that wraps costs the box 43px of height */}
    <div role="group" aria-label="Export">
      <Button>Export {view.rangeLabel} · {view.asOf}</Button>
    </div>
  </div>

  {/* announced by ROLE, never by moving focus — Alert is role="status" on its own */}
  {view.notice && <Alert variant={view.notice.variant}>{view.notice.text}</Alert>}

  <div className="grid" style={{gridTemplateColumns:"minmax(9rem,1fr) 3fr"}}>
    <div role="group" aria-label="Indicators"><KPI label="Runs" value={view.total} trend={view.trend} /></div>
    {/* the Chart names itself with `label`, so it IS the visualization region */}
    <Chart label="Runs per day">
      <AreaChart data={view.series}>…</AreaChart>
    </Chart>
  </div>

  {/* "visualization always has a tabular alternative" — a sibling region, not a tab.
      A tab panel that is not rendered is an alternative that does not exist. */}
  <Table caption="Runs per day, as numbers">…</Table>

  <div role="group" aria-label="Annotations"><div className="hint">{view.annotations}</div></div>
</div>
```
