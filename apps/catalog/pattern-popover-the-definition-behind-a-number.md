# The definition behind a number

A popover, not a tooltip: the content is rich, it stays open, and the pointer can travel into it to select text. A tooltip that needs a second sentence should have been this.

## Usage

```tsx
import {Popover, IconButton} from "@aurea-uds/react";
```

```tsx
<Popover
  title="How P95 is measured"
  trigger={<IconButton variant="ghost" size="sm" icon="info" label="About P95" />}
>
  The slowest 5% of runs are excluded. The window is the last 30 minutes,
  recalculated every minute.
</Popover>
```
