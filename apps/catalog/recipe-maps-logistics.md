# Maps · logistics

Routes, layers and tracking on the map: every selection mirrors a list and offline freshness is declared.

## Usage

```tsx
import {Card, Separator, Avatar, Icon, Text, Code, Heading, Status, Button, DataList, Alert, KPI, Stepper, DataGrid} from "@aurea-uds/react";
```

```tsx
import {useState} from "react";
import {Alert, Button, Card, DataList, Heading, KPI, Separator, Status, Stepper} from "@aurea-uds/react";
import {DataGrid} from "@aurea-uds/react/data-grid";

// The map is the other half. This list is its mirror: selecting a stop here selects it there.
export function Route({stops}) {
  const [done, setDone] = useState(2);
  const [selected, setSelected] = useState(stops[done].id);
  const stop = stops.find(s => s.id === selected);

  return (
    <Card>
      <header>
        <Heading level={3}>Harbour loop</Heading> <Status variant="running">On the road</Status>
        {done < stops.length && (
          <Button variant="primary" onClick={() => setDone(d => d + 1)}>Mark {stops[done].stop} as delivered</Button>
        )}
      </header>
      <Separator />

      <Card variant="inset"><KPI variant="plain" label="Next stop ETA" value={stops[done]?.eta ?? "—"} /></Card>
      <Stepper label="Route stops"
        items={stops.map((s, i) => ({label: s.stop, optional: s.eta, onClick: () => setSelected(s.id),
          state: i < done ? "done" : i === done ? "active" : "default"}))} />
      <DataGrid label="Stops" data={stops} getRowId={s => s.id}
        columns={[{accessorKey: "stop", header: "Stop"}, {accessorKey: "address", header: "Address"}, {accessorKey: "eta", header: "ETA"}]} />

      <div>
        <DataList items={[{term: "Address", value: stop.address}, {term: "Note", value: stop.note}]} />
        <Alert variant="warning" title="Position 3 min old">The ETA uses the last known position.</Alert>
      </div>
    </Card>
  );
}
```
