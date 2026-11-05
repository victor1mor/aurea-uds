# Automation · workflow

A visual flow builder: nodes and edges, runs with history, version comparison. A credential is referenced, never displayed.

## Usage

```tsx
import {Card, Separator, Avatar, Icon, Text, Code, Heading, Status, Switch, Button, DependencyGraph, DataList, Badge, LogStream} from "@aurea-uds/react";
```

```tsx
import {useState} from "react";
import {Button, Card, Code, DataList, Heading, LogStream, Separator, Status, Switch} from "@aurea-uds/react";
import {DependencyGraph} from "@aurea-uds/react/graph";
import "@xyflow/react/dist/base.css";

export function Automation({flow, steps, edges, runLog, run}) {
  const [selected, setSelected] = useState(steps[0].id);
  const [enabled, setEnabled] = useState(true);
  const [lines, setLines] = useState(runLog);
  const step = steps.find(s => s.id === selected);

  return (
    <Card>
      <header>
        <Heading level={3}>{flow.name}</Heading> <Status variant={enabled ? "success" : "neutral"}>{enabled ? "On" : "Off"}</Status>
        <Switch label="Enabled" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
        <Button variant="primary" leadingIcon="play" disabled={!enabled}
          onClick={async () => setLines(l => [...l, ...await run()])}>Run now</Button>
      </header>
      <Separator />

      <Card variant="inset">
        <DependencyGraph label={`${flow.name}, step by step`} orientation="vertical" height="24rem"
          nodes={steps} edges={edges} selectedId={selected} onSelect={id => id && setSelected(id)} />
      </Card>
      <Card variant="outline">
        <LogStream lines={lines} />
      </Card>

      <div>
        <DataList items={[{term: "Step", value: step.label}, {term: "Does", value: <Code>{step.detail}</Code>}]} />
      </div>
    </Card>
  );
}
```
