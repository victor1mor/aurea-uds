# ToolbarGroup

ToolbarGroup names a sub-set inside a Toolbar. Without it a bar of twelve buttons is one flat list; with it a screen reader can say "Align, three items" before reading them. It changes the announcement and the spacing — never the tab order, which belongs to the Toolbar.

## Usage

```tsx
import {Toolbar, ToolbarGroup, ToolbarButton} from "@aurea-uds/react";
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
    <ToolbarButton>Right</ToolbarButton>
  </ToolbarGroup>
</Toolbar>
```

- Groups by intent — style, align, history — so a long bar reads as a few short lists.

- The label is the announcement; a group with no label is only visual spacing.

- Does not create a tab stop: the arrows still cross the whole toolbar in one sweep.

- Pairs with ToolbarSeparator: the group carries the meaning, the separator the line.

## Examples

### Vertical rail

In a vertical toolbar the groups stack and the separator turns with the axis.

```tsx
<Toolbar orientation="vertical" label="Tools">
  <ToolbarGroup label="Draw">…</ToolbarGroup>
  <ToolbarSeparator />
  <ToolbarGroup label="View">…</ToolbarGroup>
</Toolbar>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Names the sub-group. Without it the group is only visual. |
| `children` | `ReactNode` | — | Buttons that belong together inside the toolbar. |
| `className` | `string` | — | Extra classes on the group. |
