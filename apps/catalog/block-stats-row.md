# Stats row

Four numbers of equal weight above a dashboard. Trend beside the value, never a chart without a number.

## Usage

```tsx
import {KPI} from "@aurea-uds/react";
```

```tsx
<div className="grid">
  <KPI label="Revenue" value="$48.2k" trend="+12%" />
  <KPI label="Active seats" value="312" trend="+18" />
  <KPI label="Churn" value="1.8%" trend="-0.3%" />
  <KPI label="Tickets" value="27" trend="+4" />
</div>
```
