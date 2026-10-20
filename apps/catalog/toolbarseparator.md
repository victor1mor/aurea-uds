# ToolbarSeparator

ToolbarSeparator draws the divide between sets of actions in a Toolbar. It is one hairline and nothing else: no tab stop, no action, no name to announce. The meaning of the division belongs to ToolbarGroup; the line only makes it visible.

## Usage

```tsx
import {Toolbar, ToolbarSeparator} from "@aurea-uds/react";
```

```tsx
<Toolbar label="Formatting">
  <ToolbarButton>Bold</ToolbarButton>
  <ToolbarSeparator />
  <ToolbarButton>Left</ToolbarButton>
</Toolbar>
```

- Reads the toolbar's orientation: a vertical line between columns, a horizontal one between rows.

- Never focusable — arrow keys skip it, so it costs the keyboard nothing.

- One hairline of --border, the same the surfaces use; no shadow, no double rule.

- Use with ToolbarGroup: the group says what the sets are, the separator shows where they split.

## Examples

### Turned by the axis

The same component in a vertical toolbar: it becomes a horizontal rule, without a prop.

```tsx
<Toolbar orientation="vertical" label="Tools">
  <ToolbarButton>Select</ToolbarButton>
  <ToolbarSeparator />
  <ToolbarButton>Erase</ToolbarButton>
</Toolbar>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | — | Extra classes. Orientation is read from the toolbar, not passed in. |
