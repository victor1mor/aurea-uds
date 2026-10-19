# Previewing what a link leads to

`side="top"` when the trigger sits low in the viewport and a card below it would be cut off. The rest is unchanged: the preview saves a navigation, it does not replace one.

## Usage

```tsx
import {HoverCard, Badge} from "@aurea-uds/react";
```

```tsx
<HoverCard side="top" trigger={<a href="/runs/8814">Run #8814</a>}>
  <strong>Nightly sweep</strong>
  <p className="muted">Finished 09:13 · 1m 48s · 0 errors</p>
  <Badge variant="success">Succeeded</Badge>
</HoverCard>
```
