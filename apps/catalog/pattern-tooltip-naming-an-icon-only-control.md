# Naming an icon-only control

The IconButton already carries its accessible name; the tip is what shows that name to everyone else. Two mechanisms, one string — which is why the label and the tip must say the same thing, never two different things.

## Usage

```tsx
import {Tooltip, IconButton} from "@aurea-uds/react";
```

```tsx
<Tooltip content="Export as CSV">
  <IconButton icon="download" label="Export as CSV" />
</Tooltip>
```
