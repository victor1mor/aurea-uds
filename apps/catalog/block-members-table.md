# Members table

The full collection surface: filter, selection, status per row, row actions and pagination.

## Usage

```tsx
import {Card, SearchField, Table, Checkbox, Status, Button, Pagination} from "@aurea-uds/react";
```

```tsx
<Card>
  <div className="cluster"><SearchField placeholder="Filter members…" /><Button variant="outline">Invite</Button></div>
  <Table caption="Workspace members">
    <thead><tr><th><span className="sr-only">Select</span></th><th>Member</th><th>State</th><th>Actions</th></tr></thead>
    <tbody>{rows.map(r => (
      <tr key={r.name}>
        <td><Checkbox label={`Select ${r.name}`} labelHidden /></td>
        <td>{r.name}</td>
        <td><Status variant={r.state}>{r.state}</Status></td>
        <td><Button variant="ghost" size="sm">Remove</Button></td>
      </tr>))}
    </tbody>
  </Table>
  <Pagination page={1} total={4} onPageChange={setPage} />
</Card>
```
