# Numbers inside a card that already exists

A KPI is a card, so three of them inside a panel would be boxes inside a box. `variant="plain"` drops the card and keeps the column: the panel is the surface, and the numbers sit on it.

## Usage

```tsx
import {Card, KPI, Grid} from "@aurea-uds/react";
```

```tsx
<Card>
  <Grid min="xs">
    <KPI variant="plain" label="Runs" value="1,284" trend="+12%" direction="up" />
    <KPI variant="plain" label="Success rate" value="98.7%" trend="+0.4pt" direction="up" />
    <KPI variant="plain" label="P95 latency" value="1.8s" trend="−4%" direction="down" tone="success" />
  </Grid>
</Card>
```
