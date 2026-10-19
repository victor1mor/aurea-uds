# Cluster

Horizontal wrapping/layout primitive.

## Usage

```tsx
import {Cluster} from "@aurea-uds/react";
```

```tsx
<Cluster>
  <Badge>one</Badge>
  <Badge>two</Badge>
  <Badge>three</Badge>
</Cluster>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | Horizontal flow that wraps: centred on the cross axis, --space-3 between items. It is the row of chips, buttons or tags — the one layout that must never cause sideways scrolling, which is why wrapping is not optional. |
| `gap` | `"tight" \| "normal" \| "loose"` | "normal" | Three steps and no others (ADR-0051): tight is --space-2, normal is --space-3, loose is --space-6. The old rule still holds against ANY spacing; these two extra steps exist for the two measured cases — a note under its value, and a grid of filters. |
| `align` | `"start" \| "center" \| "end" \| "baseline"` | "center" | The cross axis (vertical). Same names as the native Cluster. |
| `justify` | `"start" \| "center" \| "end" \| "between"` | "start" | The main axis. `between` spreads the free space: a name on the left, a button on the right. |
| `wrap` | `boolean` | true | The row wraps by default. `false` keeps everything on one line. |
| `className` | `string` | — | For justification or width. Every other div attribute passes through. |
