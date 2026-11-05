# Projects · CRM/ERP

Records, pipeline, assignments and automation: an audited history is append-only and bulk scope is shown before mutating.

## Usage

```tsx
import {Card, Separator, Avatar, Icon, Text, Code, Heading, Status, Button, KPI, DataGrid, Badge, Dialog, Field, Input, NumberField, Select} from "@aurea-uds/react";
```

```tsx
import {useState} from "react";
import {Avatar, Badge, Button, Card, Dialog, Field, Heading, Input, KPI, NumberField, Select, Separator, Status, Text} from "@aurea-uds/react";
import {DataGrid} from "@aurea-uds/react/data-grid";

const tone = {Lead: "neutral", Qualified: "info", Proposal: "violet", Negotiation: "warning", Won: "success", Lost: "danger"};
const columns = [
  {accessorKey: "deal", header: "Deal"},
  {accessorKey: "stage", header: "Stage", cell: ({getValue}) => <Badge tone={tone[getValue()]}>{getValue()}</Badge>},
  {accessorKey: "owner", header: "Owner", cell: ({getValue}) => <><Avatar size="sm" fallback={getValue().slice(0, 2)} /> {getValue()}</>},
  {accessorKey: "amount", header: "Amount", cell: ({getValue}) => <Text numeric>{money(getValue())}</Text>},
  {accessorKey: "close", header: "Close"},
];

export function Pipeline({initial}) {
  const [deals, setDeals] = useState(initial);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({deal: "", amount: 10000, stage: "Lead"});
  const openDeals = deals.filter(d => d.stage !== "Won" && d.stage !== "Lost");
  const markWon = (rows, clear) => {
    const ids = new Set(rows.map(r => r.id));
    setDeals(ds => ds.map(d => ids.has(d.id) ? {...d, stage: "Won"} : d));
    clear();
  };

  return (
    <Card>
      <header>
        <Heading level={3}>Q4 pipeline</Heading> <Status variant="info">On track</Status>
        <Button variant="primary" leadingIcon="plus" onClick={() => setOpen(true)}>New deal</Button>
      </header>
      <Separator />
      <Card variant="inset">
        <KPI variant="plain" label="Open pipeline" value={money(sum(openDeals))} trend={`${openDeals.length} deals`} />
      </Card>
      <DataGrid label="Deals" data={deals} columns={columns} getRowId={d => d.id} filterable selectable
        bulkActions={[{id: "won", label: "Mark as won", icon: "check", onAction: markWon}]} />
      <Dialog open={open} onClose={() => setOpen(false)} title="New deal" size="sm"
        footer={<Button variant="primary" onClick={() => { setDeals(d => [...d, {...draft, id: crypto.randomUUID()}]); setOpen(false); }}>Add deal</Button>}>
        <Field label="Deal"><Input value={draft.deal} onChange={e => setDraft({...draft, deal: e.target.value})} /></Field>
        <NumberField label="Amount" value={draft.amount} onValueChange={amount => setDraft({...draft, amount})}
          format={{style: "currency", currency: "USD", maximumFractionDigits: 0}} />
        <Field label="Stage">
          <Select items={["Lead", "Qualified", "Proposal", "Negotiation"].map(v => ({value: v, label: v}))}
            value={draft.stage} onValueChange={stage => setDraft({...draft, stage})} />
        </Field>
      </Dialog>
    </Card>
  );
}
```
