# A row of tiles across the top of a dashboard

Three or four side by side is the shape a dashboard opens with: the numbers that decide whether to keep reading. Past four they stop being a summary and become a table that forgot it was one.

## Usage

```tsx
import {KPI} from "@aurea-uds/react";
```

```tsx
<div className="grid">
  <KPI label="Runs" value="1,284" trend="+12%" />
  <KPI label="Success rate" value="98.7%" trend="+0.4pt" />
  <KPI label="P95 latency" value="1.8s" trend="−4%" />
</div>
```
