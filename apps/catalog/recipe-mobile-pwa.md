# Mobile · PWA

An installable, responsive app: everything works at 320px and touch and keyboard keep parity.

## Usage

```tsx
import {Card, Separator, Avatar, Icon, Text, Code, Heading, Status, Switch, DataList, Banner, Alert, NumberField, Button, TaskQueue, EmptyState, BottomNav, Badge} from "@aurea-uds/react";
```

```tsx
import {useState} from "react";
import {Alert, Badge, Banner, BottomNav, Button, EmptyState, Heading, NumberField, Status, TaskQueue} from "@aurea-uds/react";

// 320px is the target, not the exception: one column, the action full width, touch targets never under 44px.
export function MeterApp({online, save}) {
  const [tab, setTab] = useState("new");
  const [value, setValue] = useState(41.2);
  const [queue, setQueue] = useState([]);

  return (
    <>
      {tab === "new" && (
        <>
          <Heading level={1}>New reading</Heading>
          {!online && <Banner variant="warning" title="Offline">Saved on this phone, queued to send.</Banner>}
          <NumberField label="Meter reading (m³)" value={value} onValueChange={setValue} step={0.1} min={0} />
          <Button variant="primary" fullWidth onClick={async () => online ? save(value) : setQueue(q => [...q, value])}>Save reading</Button>
        </>
      )}
      {tab === "sync" && (queue.length
        ? <TaskQueue label="Waiting to send" tasks={queue.map((v, i) => ({id: String(i), title: `${v} m³`, state: "queued"}))} />
        : <EmptyState icon="cloud-check" title="Nothing waiting" />)}

      <BottomNav label="Meter reader" current={tab} items={[
        {id: "list", label: "Readings", icon: "list", onClick: () => setTab("list")},
        {id: "new", label: "New", icon: "plus", onClick: () => setTab("new")},
        {id: "sync", label: "Sync", icon: "cloud-slash", badge: queue.length ? <Badge size="xs" variant="danger" emphasis="solid">{queue.length}</Badge> : undefined, onClick: () => setTab("sync")},
      ]} />
    </>
  );
}
```
