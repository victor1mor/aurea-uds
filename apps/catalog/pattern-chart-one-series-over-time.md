# One series over time

Chart is the frame, not the drawing: it carries the accessible name, the sizing and the surface, and the series comes in as a child of the chart library. That split is what lets the drawing engine be swapped without touching the page.

## Usage

```tsx
import {Chart} from "@aurea-uds/react";
```

```tsx
<Chart label="Runs per month">
  <AreaChart data={data}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <Area dataKey="runs" name="Runs" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.15} />
  </AreaChart>
</Chart>
```
