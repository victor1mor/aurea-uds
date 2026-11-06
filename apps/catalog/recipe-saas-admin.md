# SaaS · admin

Multi-tenant admin panel: navigate, list, create/edit records, settings and roles.

## Usage

```tsx
import {Card, Separator, Avatar, Icon, Text, Code, Heading, Status, Button, Progress, SegmentedControl, DataGrid, Dialog, Field, Input, Select} from "@aurea-uds/react";
```

```tsx
import {useState} from "react";
import {Avatar, Button, Card, Code, Dialog, Field, Heading, Icon, Input, Progress, SegmentedControl, Select,
  Separator, Status, Text} from "@aurea-uds/react";
import {DataGrid} from "@aurea-uds/react/data-grid";

const tone = {Active: "success", Invited: "info", Suspended: "warning"};
const columns = [
  {accessorKey: "name", header: "Member",
    cell: ({row}) => (
      <>
        <Avatar size="sm" fallback={row.original.name.slice(0, 2)} />
        {row.original.name}
        <Text type="body-xs" tone="muted">{row.original.email}</Text>
      </>
    )},
  {accessorKey: "state", header: "State", cell: ({getValue}) => <Status variant={tone[getValue()]}>{getValue()}</Status>},
  {accessorKey: "role", header: "Role"},
];

export function MembersAdmin({initial, seats}) {
  const [members, setMembers] = useState(initial);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Editor");
  const [show, setShow] = useState("All");
  const [selected, setSelected] = useState(0);
  const used = members.filter(m => m.state !== "Suspended").length;

  const invite = () => {
    setMembers(m => [...m, {id: crypto.randomUUID(), name: email.split("@")[0], email, role, state: "Invited"}]);
    setOpen(false);
  };
  const suspend = (rows, clear) => {
    const ids = new Set(rows.map(r => r.id));
    setMembers(m => m.map(x => ids.has(x.id) ? {...x, state: "Suspended"} : x));
    clear();
  };

  return (
    <Card>
      <header>
        <Avatar size="lg" tone="brand" emphasis="soft" fallback={<Icon name="users" />} />
        <Text type="body-xs" tone="muted">Settings › Workspace</Text> <Code>ws_acme</Code>
        <Heading level={3}>Members</Heading> <Status variant="success">Team plan</Status>
        <Text type="body-sm" tone="muted">{members.length} members · {selected} selected</Text>
        <Button variant="primary" leadingIcon="user-plus" onClick={() => setOpen(true)}>Invite member</Button>
      </header>
      <Separator />

      <Progress value={Math.round(used / seats * 100)} label="Seats in use" showLabel detail={`${used} of ${seats}`} />

      <SegmentedControl label="Show" value={show} onChange={setShow}
        items={["All", "Active", "Invited", "Suspended"].map(v => ({value: v, label: v}))} />

      <DataGrid
        label="Workspace members"
        data={show === "All" ? members : members.filter(m => m.state === show)}
        columns={columns}
        getRowId={m => m.id}
        filterable
        selectable
        pageSize={5}
        onSelectionChange={rows => setSelected(rows.length)}
        bulkActions={[{id: "suspend", label: "Suspend", icon: "pause", onAction: suspend}]}
      />

      <Dialog open={open} onClose={() => setOpen(false)} title="Invite a member" size="sm"
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={invite}>Send invite</Button></>}>
        <Field label="Email" hint="They get a link that expires in 7 days.">
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </Field>
        <Field label="Role">
          <Select items={[{value: "Admin", label: "Admin"}, {value: "Editor", label: "Editor"}, {value: "Viewer", label: "Viewer"}]}
            value={role} onValueChange={setRole} />
        </Field>
      </Dialog>

      <Separator />

      <footer>
        <Text type="body-sm" tone="muted">Suspended members keep their history and stop using a seat.</Text>
      </footer>
    </Card>
  );
}
```
