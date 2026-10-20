# Undo and redo

History with the unavailable step kept in place, so the arrows never renumber the set.

## Usage

```tsx
import {Toolbar, ToolbarButton} from "@aurea-uds/react";
```

```tsx
<Toolbar label="History">
  <ToolbarButton leadingIcon="arrow-counter-clockwise" disabled>Undo</ToolbarButton>
  <ToolbarButton leadingIcon="arrow-clockwise">Redo</ToolbarButton>
</Toolbar>
```
