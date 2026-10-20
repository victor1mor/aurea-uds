# Dashboard · BI

Reading metrics: KPIs, time series, segmentation and drilldown down to the data row.

## Usage

```tsx
import {KPI, SegmentedControl, Table} from "@aurea-uds/react";
```

```tsx
<SegmentedControl label="Range" value={range} onChange={setRange}
  items={[{value: "7d", label: "7 days"}, {value: "30d", label: "30 days"}]} />
<KPI label="Revenue" value="$48.2k" trend="+12%" />
<KPI label="Active seats" value="312" trend="+4%" />
<Table caption="Revenue by plan">…</Table>
```
