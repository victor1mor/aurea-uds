# Formatting bar

Style and align in named groups, one tab stop for the whole bar.

## Usage

```tsx
import {Toolbar, ToolbarGroup, ToolbarButton, ToolbarSeparator} from "@aurea-uds/react";
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
