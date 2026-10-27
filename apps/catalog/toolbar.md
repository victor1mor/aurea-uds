# Toolbar

Toolbar is a set of actions with ONE tab stop: Tab enters and leaves the whole set, and the arrows move between the buttons inside it. That roving tabindex is the difference from ButtonGroup, where every button is its own tab stop. A formatting bar with twelve actions must not cost twelve presses of Tab to walk past.

## Usage

```tsx
import {Toolbar, ToolbarButton, ToolbarSeparator} from "@aurea-uds/react";
```

```tsx
<Toolbar label="Formatting">
  <ToolbarGroup label="Style">
    <ToolbarButton pressed>Bold</ToolbarButton>
    <ToolbarButton>Italic</ToolbarButton>
  </ToolbarGroup>
  <ToolbarSeparator />
  <ToolbarGroup label="Align">
    <ToolbarButton>Left</ToolbarButton>
    <ToolbarButton>Center</ToolbarButton>
  </ToolbarGroup>
</Toolbar>
```

- Roving tabindex from Base UI: Tab in and out, arrows within — the APG toolbar pattern.

- Horizontal or vertical; the orientation decides which arrows navigate and turns the separator.

- Named by aria-label: two toolbars on one page must not answer to the same name.

- ToolbarGroup labels a sub-set; ToolbarSeparator draws the divide without claiming a tab stop.

- Buttons are ghost by default — the toolbar surface already frames them.

## Examples

### Vertical

Stacked for a side rail. Up and down navigate, and the separator turns with the axis.

```tsx
<Toolbar orientation="vertical" label="Tools">
  <ToolbarButton>Select</ToolbarButton>
  <ToolbarButton>Draw</ToolbarButton>
  <ToolbarSeparator />
  <ToolbarButton>Erase</ToolbarButton>
</Toolbar>
```

### Icon only

Glyph actions still need names: each one carries its label, the bar carries its own.

```tsx
<Toolbar label="Canvas">
  <ToolbarButton render={<IconButton icon="arrow-counter-clockwise" label="Undo" />} />
</Toolbar>
```

### With a disabled action

Unavailable but still counted: it keeps its place in the roving order, so the set never shifts under the arrows.

```tsx
<Toolbar label="History">
  <ToolbarButton disabled>Undo</ToolbarButton>
  <ToolbarButton>Redo</ToolbarButton>
</Toolbar>
```

### The colour of the on state

pressedStyle on the toolbar colours every pressed button inside (ADR-0084): brand — the default — neutral or contrast. A button's own pressedStyle wins.

```tsx
<Toolbar label="Format" pressedStyle="brand">
  <ToolbarButton pressed>Bold</ToolbarButton>
  <ToolbarButton>Italic</ToolbarButton>
</Toolbar>
<Toolbar label="Format" pressedStyle="neutral">
  <ToolbarButton pressed>Bold</ToolbarButton>
  <ToolbarButton>Italic</ToolbarButton>
</Toolbar>
<Toolbar label="Format" pressedStyle="contrast">
  <ToolbarButton pressed>Bold</ToolbarButton>
  <ToolbarButton>Italic</ToolbarButton>
</Toolbar>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `orientation` | `horizontal \| vertical` | horizontal | Vertical stacks the buttons and swaps which arrows navigate. |
| `label` | `string` | Toolbar | Accessible name of the toolbar. Two toolbars on a page must not share one. |
| `children` | `ReactNode` | — | ToolbarButton, ToolbarGroup and ToolbarSeparator. |
| `className` | `string` | — | Extra classes on the surface. |
| `pressedStyle` | `"brand" \| "neutral" \| "contrast"` | "brand" | The colour of the ON state (ADR-0084): brand — the yellow of the primary button, the default — neutral (grey) or contrast (graphite, inverted). Written as data-pressed-style; the same attribute on a container, or on <html>, sets it for every pressed button inside, and a button's own value wins. With the system's "increase contrast", neutral gets a 3:1 outline. For every pressed ToolbarButton inside; each may set its own. |
