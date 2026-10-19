# The exact value under the pointer

An area chart shows a shape, not a number; the tooltip is where the number lives. It reuses the same `.tooltip` surface as the rest of the system, so a value read on a chart looks like a value read anywhere else.

## Usage

```tsx
import {Chart, ChartTooltip} from "@aurea-uds/react";
```

```tsx
<Chart label="Runs per month">
  <AreaChart data={data}>
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <Area dataKey="runs" name="Runs" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.15} />
    <ChartTooltip />
  </AreaChart>
</Chart>
```
