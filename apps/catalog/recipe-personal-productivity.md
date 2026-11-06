# Personal productivity

Tasks, notes and calendar: offline editing is recoverable and navigating never discards unsaved work.

## Usage

```tsx
import {Card, Separator, Avatar, Icon, Text, Code, Heading, Status, Switch, ProgressCircle, DataList, Banner, Field, Input, Button, Checkbox, SortableList} from "@aurea-uds/react";
```

```tsx
import {useState} from "react";
import {Banner, Button, Card, Checkbox, Field, Heading, Input, ProgressCircle, Separator, SortableList, Status, Switch} from "@aurea-uds/react";

export function Today({initial}) {
  const [tasks, setTasks] = useState(initial);
  const [draft, setDraft] = useState("");
  const [offline, setOffline] = useState(false);
  const open = tasks.filter(t => !t.done);
  const add = () => { if (draft.trim()) setTasks(t => [...t, {id: crypto.randomUUID(), label: draft.trim(), done: false}]); setDraft(""); };
  const move = (from, to) => setTasks(ts => {
    const o = ts.filter(t => !t.done); const [x] = o.splice(from, 1); o.splice(to, 0, x); return [...o, ...ts.filter(t => t.done)];
  });

  return (
    <Card>
      <header>
        <Heading level={3}>Today</Heading> <Status variant={offline ? "warning" : "success"}>{offline ? "Offline" : "Synced"}</Status>
        <Switch label="Work offline" checked={offline} onChange={e => setOffline(e.target.checked)} />
      </header>
      <Separator />

      {offline && <Banner variant="info" title="Offline — your changes are saved here">They sync when the connection returns.</Banner>}
      <Field label="Task">
        <Input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} />
      </Field>
      <Button variant="primary" leadingIcon="plus" onClick={add}>Add</Button>
      {tasks.map(t => (
        <Checkbox key={t.id} label={t.label} checked={t.done}
          onChange={e => setTasks(ts => ts.map(x => x.id === t.id ? {...x, done: e.target.checked} : x))} />
      ))}
      <SortableList label="Open tasks by priority" items={open} onReorder={move} />

      <div>
        <ProgressCircle label="Done today" value={(tasks.length - open.length) / tasks.length * 100} size="lg" />
      </div>
    </Card>
  );
}
```
