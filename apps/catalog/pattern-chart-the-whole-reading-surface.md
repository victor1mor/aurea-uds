# The whole reading surface

Grid, axis, legend and tooltip on one chart — the assembled form, so the pieces are seen doing their jobs together instead of one at a time. `defaultIndex` pins the tooltip because a static page has no pointer; in an application it is not needed.

## Usage

```tsx
import {Chart, ChartLegend, ChartTooltip} from "@aurea-uds/react";
```

```tsx
<Chart label="Runs and errors per month">
  <AreaChart data={data}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <Area dataKey="runs" name="Runs" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.15} />
    <Area dataKey="errors" name="Errors" stroke="var(--chart-4)" fill="var(--chart-4)" fillOpacity={0.15} />
    <ChartTooltip />
    <ChartLegend />
  </AreaChart>
</Chart>
```
