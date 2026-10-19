# Legend above the drawing

`verticalAlign="top"` reads the names before the shapes, which is what a dashboard tile wants when the drawing is short and the reader is scanning several tiles at once. Everything else stays: the component still takes the series from the engine, never a hand-written list.

## Usage

```tsx
import {Chart, ChartLegend} from "@aurea-uds/react";
```

```tsx
<Chart label="Runs and errors">
  <BarChart data={data}>
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <YAxis width={32} tickLine={false} axisLine={false} />
    <Bar dataKey="runs" name="Runs" fill="var(--chart-2)" />
    <Bar dataKey="errors" name="Errors" fill="var(--chart-4)" />
    <ChartLegend verticalAlign="top" />
  </BarChart>
</Chart>
```
