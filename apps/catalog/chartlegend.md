# ChartLegend

Which colour is which series, as a plain list under the chart.

## Usage

```tsx
import {Chart, ChartLegend} from "@aurea-uds/react/chart";
```

```tsx
<Chart label="Runs and errors">
  <BarChart data={data}>
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <Bar dataKey="runs" name="Runs" fill="var(--chart-2)" />
    <Bar dataKey="errors" name="Errors" fill="var(--chart-4)" />
    <ChartLegend />
  </BarChart>
</Chart>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `payload` | `Array<{value, color}>` | the series, in the engine's order | The entries to list. Worth passing: as of recharts 3.10.1 the engine sorts its own payload alphabetically by dataKey, so the legend does not follow the order the series were declared in. This prop is the way to fix that from the outside. |
| `verticalAlign` | `"top" \| "bottom"` | "bottom" | Which side of the drawing the list sits on. |
| `…Legend` | `LegendProps` | none | Everything else goes to the engine's Legend. `content` is the exception: it is what this component IS. |
