# Naming the colours of a stacked series

Stacking hides which band is which, so the legend stops being optional: it is the only place the reader learns that the darker band is the failures. It sits under the drawing by default, where it does not compete with the axis for the first read.

## Usage

```tsx
import {Chart, ChartLegend} from "@aurea-uds/react";
```

```tsx
<Chart label="Runs by outcome">
  <BarChart data={data}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <Bar dataKey="runs" name="Succeeded" stackId="a" fill="var(--chart-2)" />
    <Bar dataKey="errors" name="Failed" stackId="a" fill="var(--chart-4)" />
    <ChartLegend />
  </BarChart>
</Chart>
```
