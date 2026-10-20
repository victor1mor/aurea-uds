# Side rail

A column of tools beside a canvas: up and down navigate, the separator turns with the axis.

## Usage

```tsx
import {Toolbar, IconButton, ToolbarSeparator} from "@aurea-uds/react";
```

```tsx
<Toolbar orientation="vertical" label="Tools">
  <IconButton icon="pencil-simple" label="Draw" />
  <IconButton icon="image" label="Place image" />
  <ToolbarSeparator />
  <IconButton icon="trash" label="Erase" variant="danger-ghost" />
</Toolbar>
```
