# Automation · workflow

A visual flow builder: nodes and edges, runs with history, version comparison. A credential is referenced, never displayed.

## Usage

```tsx
import {Card, Status, Button, Timeline, LogStream} from "@aurea-uds/react";
```

```tsx
<Card>
  <Status variant="running">running</Status>
  <Button variant="ghost" size="sm">Cancel</Button>
  <Timeline items={[
    {title: "Trigger · webhook", time: "09:14:02"},
    {title: "Transform · map fields", time: "09:14:03"},
  ]} />
  <LogStream lines={runLog} />
</Card>
```
