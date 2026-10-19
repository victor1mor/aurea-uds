# A list you act on in bulk

Selection turns a table into a work surface: pick the rows, then act once. The header checkbox selects the page, never the whole dataset — a promise a static table cannot keep.

## Usage

```tsx
import {DataGrid} from "@aurea-uds/react";
```

```tsx
<DataGrid
  label="Members"
  selectable
  filterable
  pageSize={10}
  onSelectionChange={setSelected}
  getRowId={row => row.name}
  data={members}
  columns={[
    {accessorKey: "name", header: "Name"},
    {accessorKey: "role", header: "Role"},
    {accessorKey: "runs", header: "Runs"},
  ]}
/>
```
