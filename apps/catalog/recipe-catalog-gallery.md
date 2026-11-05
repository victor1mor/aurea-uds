# Catalog · gallery

A navigable visual collection: facet, toggle grid/list, select and act in bulk. The query survives the view switch.

## Usage

```tsx
import {Card, Separator, Avatar, Icon, Text, Code, Heading, Status, SegmentedControl, Button, Image, DataList, Gallery, DataGrid, ConfirmDialog} from "@aurea-uds/react";
```

```tsx
import {useState} from "react";
import {Button, Card, ConfirmDialog, DataList, Gallery, Heading, Image, SegmentedControl, Separator, Status} from "@aurea-uds/react";
import {DataGrid} from "@aurea-uds/react/data-grid";

export function Catalog({initial, remove}) {
  const [items, setItems] = useState(initial);
  const [selected, setSelected] = useState([]);
  const [current, setCurrent] = useState(initial[0].id);
  const [view, setView] = useState("grid");
  const [confirm, setConfirm] = useState(false);
  const item = items.find(i => i.id === current);

  return (
    <Card>
      <header>
        <Heading level={3}>Brand assets</Heading> <Status variant="success">{items.length} items</Status>
        <SegmentedControl label="View" value={view} onChange={setView}
          items={[{value: "grid", label: "Grid", icon: "squares-four"}, {value: "list", label: "List", icon: "list"}]} />
        <Button variant="danger-ghost" leadingIcon="trash" disabled={!selected.length} onClick={() => setConfirm(true)}>Remove</Button>
      </header>
      <Separator />

      {view === "grid"
        ? <Gallery label="Brand assets" items={items} selectionMode="multiple" selectedIds={selected}
            onSelectionChange={setSelected} selected={current} onSelect={setCurrent} />
        : <DataGrid label="Brand assets" data={items} getRowId={i => i.id} selectable
            rowSelection={Object.fromEntries(selected.map(id => [id, true]))}
            onRowSelectionChange={s => setSelected(Object.keys(s).filter(k => s[k]))}
            columns={[{accessorKey: "caption", header: "Name"}, {accessorKey: "size", header: "Size"}]} />}

      <div>
        <Image src={item.src} alt={item.alt} ratio="3/2" />
        <DataList items={[{term: "Type", value: item.kind}, {term: "Size", value: item.size}]} />
      </div>

      <ConfirmDialog open={confirm} destructive title={`Remove ${selected.length} items?`} confirmLabel="Remove"
        onConfirm={() => { remove(selected); setItems(i => i.filter(x => !selected.includes(x.id))); setSelected([]); setConfirm(false); }}
        onCancel={() => setConfirm(false)} />
    </Card>
  );
}
```
