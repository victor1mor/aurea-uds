# Dashboard · BI

Reading metrics: KPIs, time series, segmentation and drilldown down to the data row.

## Usage

```tsx
import {Card, Separator, Avatar, Icon, Text, Heading, Status, SegmentedControl, Button, KPI, Chart, DataGrid} from "@aurea-uds/react";
```

```tsx
import {useState} from "react";
import {Avatar, Button, Card, Heading, Icon, KPI, SegmentedControl, Separator, Status, Text} from "@aurea-uds/react";
import {Chart} from "@aurea-uds/react/chart";
import {DataGrid} from "@aurea-uds/react/data-grid";
import {Bar, BarChart, CartesianGrid, XAxis} from "recharts";

// The same series twice: as bars and as numbers. Changing the period changes both.
export function RevenueDashboard({periods, plans, onExport}) {
  const [period, setPeriod] = useState("30d");
  const {series, kpis} = periods[period];

  return (
    <Card>
      <header>
        <Avatar size="lg" tone="brand" emphasis="soft" fallback={<Icon name="chart-bar" />} />
        <Text type="body-xs" tone="muted">Analytics</Text>
        <Heading level={3}>Revenue</Heading> <Status variant="success">Up to date</Status>
        <SegmentedControl label="Period" value={period} onChange={setPeriod}
          items={[{value: "7d", label: "7 days"}, {value: "30d", label: "30 days"}, {value: "90d", label: "90 days"}]} />
        <Button variant="secondary" leadingIcon="download-simple" onClick={() => onExport(period)}>Export {period}</Button>
      </header>
      <Separator />

      {kpis.map(k => (
        <Card key={k.label} variant="inset">
          <KPI variant="plain" label={k.label} value={k.value} trend={k.trend} direction={k.direction} tone={k.tone} />
        </Card>
      ))}

      <Card variant="inset">
        <Chart label="Revenue over the period, in thousands of dollars">
          <BarChart data={series}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="x" tickLine={false} axisLine={false} interval={0} />
            <Bar dataKey="revenue" name="Revenue" fill="var(--chart-2)" />
          </BarChart>
        </Chart>
      </Card>

      <DataGrid label="Revenue by plan" data={plans[period]}
        columns={[{accessorKey: "plan", header: "Plan"}, {accessorKey: "revenue", header: "Revenue ($k)"},
          {accessorKey: "seats", header: "Seats"}]} />

      <Separator />

      <footer>
        <Text type="body-sm" tone="muted">The grid carries the same numbers as the bars.</Text>
      </footer>
    </Card>
  );
}
```
