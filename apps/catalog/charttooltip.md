# ChartTooltip

Values under the pointer, on the same tooltip surface as the rest of Aurea.

## Usage

```tsx
import {Chart, ChartTooltip} from "@aurea-uds/react/chart";
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

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `defaultIndex` | `number` | none | Pins the tooltip to one data point instead of following the pointer. Written for a page with no pointer — a static preview, a print, a screenshot. |
| `cursor` | `object \| false` | the Aurea cursor line | The mark the engine draws under the pointer. `false` removes it. |
| `…Tooltip` | `ComponentProps<typeof Tooltip>` | none | Everything else goes to the engine's Tooltip. `content` is the exception: it is what this component IS, so passing it would replace the Aurea surface. |
