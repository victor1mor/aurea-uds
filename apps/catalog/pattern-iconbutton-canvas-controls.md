# Canvas controls

Zoom and fit in a toolbar: one tab stop for the set, a name for each glyph.

## Usage

```tsx
import {Toolbar, IconButton, ToolbarSeparator} from "@aurea-uds/react";
```

```tsx
<Toolbar label="Canvas">
  <IconButton icon="magnifying-glass-plus" label="Zoom in" variant="outline" />
  <IconButton icon="magnifying-glass-minus" label="Zoom out" variant="outline" />
  <ToolbarSeparator />
  <IconButton icon="arrows-in-simple" label="Fit to screen" variant="outline" />
</Toolbar>
```
