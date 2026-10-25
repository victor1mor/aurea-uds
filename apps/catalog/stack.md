# Stack

Vertical spacing/layout primitive.

## Usage

```tsx
import {Stack} from "@aurea-uds/react";
```

```tsx
<Stack>
  <Card>First</Card>
  <Card>Second</Card>
</Stack>
```

## Examples

### Gap

The space between the items, from the density scale: tight, normal or loose.

```tsx
<Stack gap="tight">
  <Card>First</Card>
  <Card>Second</Card>
</Stack>
<Stack gap="normal">
  <Card>First</Card>
  <Card>Second</Card>
</Stack>
<Stack gap="loose">
  <Card>First</Card>
  <Card>Second</Card>
</Stack>
```

### Align

Where each item sits across the column. stretch, the default, makes every item as wide as the stack.

```tsx
<Stack align="start">
  <Button>Save</Button>
  <Button variant="secondary">Cancel</Button>
</Stack>
<Stack align="center">
  <Button>Save</Button>
  <Button variant="secondary">Cancel</Button>
</Stack>
<Stack align="end">
  <Button>Save</Button>
  <Button variant="secondary">Cancel</Button>
</Stack>
<Stack align="stretch">
  <Button>Save</Button>
  <Button variant="secondary">Cancel</Button>
</Stack>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | Vertical flow: a column with --space-4 between items. The gap has three steps and no others (ADR-0051) — a layout primitive that takes any spacing is how a system stops having spacing. |
| `gap` | `"tight" \| "normal" \| "loose"` | "normal" | Three steps and no others (ADR-0051): tight is --space-2, normal is --space-4, loose is --space-6. The old rule still holds against ANY spacing; these two extra steps exist for the two measured cases — a note under its value, and a grid of filters. |
| `align` | `"start" \| "center" \| "end" \| "stretch"` | "stretch" | The cross axis. The default stretches children to the column width, as always; `start` keeps each child at its own width. |
| `className` | `string` | — | For alignment or width that this one job needs. Every other div attribute passes through. |
