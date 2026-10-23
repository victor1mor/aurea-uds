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

## Examples

### Gap

The space between the items, from the density scale: tight, normal or loose.

```tsx
<Cluster gap="tight">
  <Badge>one</Badge>
  <Badge>two</Badge>
  <Badge>three</Badge>
</Cluster>
<Cluster gap="normal">
  <Badge>one</Badge>
  <Badge>two</Badge>
  <Badge>three</Badge>
</Cluster>
<Cluster gap="loose">
  <Badge>one</Badge>
  <Badge>two</Badge>
  <Badge>three</Badge>
</Cluster>
```

### Justify

Where the row sits along the line. between pushes the first and the last item to the ends.

```tsx
<Cluster justify="start">
  <Badge>one</Badge>
  <Badge>two</Badge>
  <Badge>three</Badge>
</Cluster>
<Cluster justify="center">
  <Badge>one</Badge>
  <Badge>two</Badge>
  <Badge>three</Badge>
</Cluster>
<Cluster justify="end">
  <Badge>one</Badge>
  <Badge>two</Badge>
  <Badge>three</Badge>
</Cluster>
<Cluster justify="between">
  <Badge>one</Badge>
  <Badge>two</Badge>
  <Badge>three</Badge>
</Cluster>
```

### Align

How items of different heights line up across the row. baseline lines up the text.

```tsx
<Cluster align="start">
  <Button size="lg">Large</Button>
  <Badge>Small</Badge>
</Cluster>
<Cluster align="center">
  <Button size="lg">Large</Button>
  <Badge>Small</Badge>
</Cluster>
<Cluster align="end">
  <Button size="lg">Large</Button>
  <Badge>Small</Badge>
</Cluster>
<Cluster align="baseline">
  <Button size="lg">Large</Button>
  <Badge>Small</Badge>
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
