# Observability · ops

Telemetry, logs, alerts and remediation: a live update is pausable and remediation links to the alert and the receipt.

## Usage

```tsx
import {Card, Separator, Avatar, Icon, Text, Code, Heading, Status, Button, DataList, Link, EventStream, Alert, KPI, Chart, HealthMatrix, LogStream} from "@aurea-uds/react";
```

```tsx
import {useState} from "react";
import {Alert, Button, Card, DataList, EventStream, HealthMatrix, Heading, KPI, LogStream, Separator, Status} from "@aurea-uds/react";
import {Chart} from "@aurea-uds/react/chart";
import {Area, AreaChart, CartesianGrid, XAxis} from "recharts";

export function OnCall({incident, services, latency, events: initialEvents, tail}) {
  const [phase, setPhase] = useState("open");
  const [events, setEvents] = useState(initialEvents);
  const [paused, setPaused] = useState(false);

  return (
    <Card>
      <header>
        <Heading level={3}>{incident.service}</Heading> <Status variant="danger">Incident</Status>
        {phase === "open" && <Button variant="primary" onClick={() => setPhase("ack")}>Acknowledge</Button>}
        {phase === "ack" && <Button variant="primary" onClick={() => setPhase("ok")}>Mitigate: roll back</Button>}
      </header>
      <Separator />

      {phase !== "ok" && <Alert variant="danger" title={incident.title}>{incident.cause}</Alert>}
      <Card variant="inset"><KPI variant="plain" label="p95 latency" value={incident.p95} direction="up" tone="danger" /></Card>
      <Card variant="inset">
        <Chart label="p95 latency over the last 20 minutes">
          <AreaChart data={latency}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="t" tickLine={false} axisLine={false} />
            <Area dataKey="ms" name="p95" stroke="var(--chart-4)" fill="var(--chart-4)" fillOpacity={0.15} />
          </AreaChart>
        </Chart>
      </Card>
      <Card variant="inset"><HealthMatrix label="Services" entries={services} /></Card>
      <Card variant="outline">
        <Button appearance="soft" tone="brand" size="sm" onClick={() => setPaused(p => !p)}>{paused ? "Resume live tail" : "Pause live tail"}</Button>
        <LogStream lines={tail} />
      </Card>

      <div>
        <DataList items={[{term: "Severity", value: incident.severity}, {term: "Owner", value: incident.owner}]} />
        <EventStream label="Events" events={events} />
      </div>
    </Card>
  );
}
```
