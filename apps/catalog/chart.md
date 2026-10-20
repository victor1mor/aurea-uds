# Chart

Sized, named surface that hosts a Recharts chart wearing Aurea tokens.

## Usage

```tsx
import {Chart} from "@aurea-uds/react/chart";
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

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactElement` | none | REQUIRED. One Recharts chart element (AreaChart, BarChart, LineChart…). Aurea does not wrap the chart types: the engine draws, this component holds. |
| `label` | `string` | the provider's "Chart" | Accessible name of the whole drawing. Say what it plots, not that it is a chart. |
| `className` | `string` | none | Added to the box. The height is CSS, not a prop — a dimension comes from a class, so density still reaches it and nobody writes a raw pixel. To make the axis and legend text bigger — for low vision, for example — set `--chart-text` on the chart or any ancestor, such as `var(--text-sm)` or `var(--text-base)`; the default is `var(--text-xs)`. It is a CSS valve, like DataGrid's `--datagrid-max-h`: the rule is CSS and overrides the engine's own `tick` font size. |
