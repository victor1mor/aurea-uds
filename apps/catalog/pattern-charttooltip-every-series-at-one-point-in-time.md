# Every series at one point in time

With more than one series the tooltip becomes a small table: the label is the point on the axis, and each row is a series with its colour swatch. This is the comparison the drawing cannot make, because two bars of different heights do not tell you their difference.

## Usage

```tsx
import {Chart, ChartTooltip} from "@aurea-uds/react";
```

```tsx
<Chart label="Runs and errors">
  <BarChart data={data}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <Bar dataKey="runs" name="Runs" fill="var(--chart-2)" />
    <Bar dataKey="errors" name="Errors" fill="var(--chart-4)" />
    <ChartTooltip />
  </BarChart>
</Chart>
```
