# TraceTimeline

How long each step took, as a waterfall.

## Usage

```tsx
import {TraceTimeline} from "@aurea-uds/react";
```

```tsx
<TraceTimeline spans={[
  {id: "1", label: "invoke", start: 0, end: 900},
  {id: "2", label: "retrieve", start: 40, end: 380, depth: 1, kind: "tool"},
]} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `spans` | `TraceSpan[]` | — | Each bar is offset by (start-min)/(max-min) and sized by (end-start)/(max-min) — the maths of the reference. This is NOT the Timeline component: that one is a column of moments, this is a waterfall of DURATIONS, where position and width are the data. `depth` indents to show who called whom. `kind` is TEXT: the reference paints eleven span categories in eleven colours, and colour-per-category on a locked palette is unreadable for anyone who does not separate them. |
| `label` | `string` | "Trace" | Accessible name of the list. |
| `className` | `string` | — | On the list. |
