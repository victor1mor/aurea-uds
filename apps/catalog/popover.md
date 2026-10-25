# Popover

Anchored floating surface with content or interaction.

## Usage

```tsx
import {Popover} from "@aurea-uds/react";
```

```tsx
<Popover
  title="Filters"
  arrow
  trigger={<Button variant="outline">Filters</Button>}
>
  <Checkbox label="Only mine" />
  <Checkbox label="Archived" />
</Popover>
```

## Examples

### Sides

Which side of the trigger it opens on. When there is no room on that side, it flips to the opposite one.

```tsx
<Popover title="Side top" side="top" arrow trigger={<Button variant="outline">Side top</Button>}>…</Popover>
<Popover title="Side right" side="right" arrow trigger={<Button variant="outline">Side right</Button>}>…</Popover>
<Popover title="Side bottom" side="bottom" arrow trigger={<Button variant="outline">Side bottom</Button>}>…</Popover>
<Popover title="Side left" side="left" arrow trigger={<Button variant="outline">Side left</Button>}>…</Popover>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `trigger` | `ReactElement` | — | One element, and it becomes the trigger — the engine merges the ref and the ARIA into it instead of wrapping it, so your button stays your button. |
| `title` | `ReactNode` | — | Optional heading inside the panel, rendered as a <strong>. |
| `children` | `ReactNode` | — | The content. This is the overlay that may hold focus and interactive elements; a Tooltip may not. |
| `side` | `top \| right \| bottom \| left` | bottom | Preferred side. It flips on its own when there is no room, so this is a preference, not a promise. |
| `arrow` | `boolean` | false | The arrow, off by default as in the reference library. Our own curve, 12 × 6, with the surface fill and the border line. |
