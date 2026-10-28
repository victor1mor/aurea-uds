# Timeline

Chronological sequence of events.

## Usage

```tsx
import {Timeline} from "@aurea-uds/react";
```

```tsx
<Timeline items={[
  {title: "Created", description: "by Curator", time: "09:00"},
  {title: "Shipped", time: "14:20"},
]} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `Array<{title: ReactNode; description?: ReactNode; time?: ReactNode}>` | — | The events, rendered as an <ol> because the order IS the information. `time` is a node, so an absolute date and a relative one are equally welcome. |
| `variant` | `"default" \| "ring" \| "latest" \| "time" \| "contrast"` | "default" | The style (ADR-0084), all on the fixed rail that runs under the dots and stops at the last one: default (the solid yellow dot), ring (a hollow dot with a yellow ring), latest (muted dots, only the last one yellow with a halo), time (the time in a column on the left, right-aligned; the rail moves with the dot) or contrast (dots in the text colour). Written as data-timeline-style. Web and React Native; on React Native an item with an icon keeps its frame in every style. |
