# Regulated records

Consent, audit, error prevention and retention: least privilege is visible and a consequential submission includes review and a receipt.

## Usage

```tsx
import {Card, Separator, Avatar, Icon, Text, Code, Heading, Status, Button, Banner, Tabs, DataList, Timeline, EmptyState, Dialog, Checkbox} from "@aurea-uds/react";
```

```tsx
import {useState} from "react";
import {Banner, Button, Card, Checkbox, DataList, Dialog, Heading, Separator, Status, Tabs, Text, Timeline} from "@aurea-uds/react";

export function Record({record}) {
  const [deleted, setDeleted] = useState(false);
  const [open, setOpen] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const [log, setLog] = useState(record.log);
  const remove = () => {
    setDeleted(true); setOpen(false);
    setLog(l => [{title: "Record deleted by you", description: "this entry stays for 7 years", time: now()}, ...l]);
  };

  return (
    <Card>
      <header>
        <Heading level={3}>{record.name}</Heading>
        <Status variant={deleted ? "danger" : "success"}>{deleted ? "Deleted" : "Retention active"}</Status>
        <Button variant="danger-ghost" leadingIcon="trash" disabled={deleted} onClick={() => setOpen(true)}>Delete record</Button>
      </header>
      <Separator />
      {deleted && <Banner variant="danger" title="This record was deleted">The audit log keeps the fact.</Banner>}
      <Tabs label="Record" panel="plain" tabs={[
        {id: "details", label: "Details", content: <DataList items={record.fields} />},
        {id: "audit", label: "Audit log", content: <Timeline items={log} />},
      ]} />
      <Dialog open={open} onClose={() => setOpen(false)} title="Delete this record?" icon="warning" iconTone="danger"
        footer={<Button variant="danger" disabled={!understood} onClick={remove}>Delete record</Button>}>
        <Text>It cannot be undone, and it is logged with your name.</Text>
        <Checkbox label="I understand the consequence" checked={understood} onChange={e => setUnderstood(e.target.checked)} />
      </Dialog>
    </Card>
  );
}
```
