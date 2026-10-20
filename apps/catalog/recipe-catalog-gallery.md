# Catalog · gallery

A navigable visual collection: facet, toggle grid/list, select and act in bulk. The query survives the view switch.

## Usage

```tsx
import {SegmentedControl, Badge, Button, Grid, Card, Checkbox} from "@aurea-uds/react";
```

```tsx
<SegmentedControl label="View" value={view} onChange={setView}
  items={[{value: "grid", label: "Grid"}, {value: "list", label: "List"}]} />
<Badge variant="primary">2 selected</Badge>
<Button variant="outline">Export</Button>
<Grid>{items.map(i => (
  <Card key={i.id} variant={selected.has(i.id) ? "selected" : "base"}>
    <Checkbox label={`Select ${i.name}`} />
    {i.name}
  </Card>))}
</Grid>
```
