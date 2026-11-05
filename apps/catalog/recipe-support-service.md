# Support · service

Inbox, case history, SLA and escalation: the identity of the case and the channel stays visible and escalating records a reason and an owner.

## Usage

```tsx
import {Card, Separator, Avatar, Icon, Text, Code, Heading, Status, SegmentedControl, DataGrid, Badge, MessageList, MessageComposer, Button} from "@aurea-uds/react";
```

```tsx
import {useState} from "react";
import {Badge, Button, Card, Heading, MessageComposer, MessageList, SegmentedControl, Separator, Status, Text} from "@aurea-uds/react";
import {DataGrid} from "@aurea-uds/react/data-grid";

export function Inbox({initialCases, initialThreads}) {
  const [cases, setCases] = useState(initialCases);
  const [threads, setThreads] = useState(initialThreads);
  const [openId, setOpenId] = useState(initialCases[0].id);
  const current = cases.find(c => c.id === openId);
  const setState = (id, state) => setCases(cs => cs.map(c => c.id === id ? {...c, state} : c));
  const reply = (id, body) => {
    setThreads(t => ({...t, [id]: [...t[id], {id: crypto.randomUUID(), author: "You", direction: "outgoing", body}]}));
    setState(id, "waiting");
  };

  return (
    <Card>
      <header><Heading level={3}>Inbox</Heading> <Status variant="warning">3 open</Status></header>
      <Separator />
      <SegmentedControl label="Queue" items={[{value: "All", label: "All"}, {value: "Open", label: "Open"}]} />
      <DataGrid
        label="Cases" data={cases} getRowId={c => c.id} filterable
        columns={[
          {accessorKey: "subject", header: "Case", cell: ({row}) => (
            <Button variant="link" onClick={() => setOpenId(row.original.id)}>{row.original.subject}</Button>
          )},
          {accessorKey: "sla", header: "SLA", cell: ({row}) => <Badge tone={row.original.tone}>{row.original.sla}</Badge>},
          {accessorKey: "state", header: "State", cell: ({getValue}) => <Status variant={variant[getValue()]}>{label[getValue()]}</Status>},
        ]}
      />
      <Card variant="outline">
        <MessageList label={`Case ${current.id}`} messages={threads[current.id]} />
        <MessageComposer label={`Reply to ${current.customer}`} onSend={text => reply(current.id, text)} />
        <Button variant="danger-ghost" onClick={() => setState(current.id, "escalated")}>Escalate</Button>
        <Button appearance="soft" tone="brand" leadingIcon="check" onClick={() => setState(current.id, "resolved")}>Resolve</Button>
      </Card>
    </Card>
  );
}
```
