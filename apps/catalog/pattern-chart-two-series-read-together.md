# Two series, read together

Two bars side by side answer a question one bar cannot: not how many runs, but how many of them failed. The legend is required here — with two series the colours stop being decoration and start carrying meaning.

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
    <ChartLegend />
  </BarChart>
</Chart>
```
