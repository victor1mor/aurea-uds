# The direction, not just the sign

`trend` takes a node, so the comparison can carry a status of its own. Colour alone would fail WCAG 1.4.1 — the arrow and the words are what make the direction readable without it.

## Usage

```tsx
import {KPI, Status} from "@aurea-uds/react";
```

```tsx
<KPI
  label="Failed runs"
  value="17"
  trend={<Status variant="danger">up 6 since Monday</Status>}
/>
```
