# Projects · CRM/ERP

Records, pipeline, assignments and automation: an audited history is append-only and bulk scope is shown before mutating.

## Usage

```tsx
import {Card, SearchField, Table, Badge, Avatar, Pagination} from "@aurea-uds/react";
```

```tsx
<Card>
  <SearchField placeholder="Filter deals…" />
  <Table caption="Pipeline">
    <thead><tr><th>Deal</th><th>Stage</th><th>Owner</th></tr></thead>
    <tbody><tr><td>Acme · renewal</td><td><Badge variant="info">Negotiation</Badge></td>
      <td><Avatar fallback="AN" size="sm" /></td></tr></tbody>
  </Table>
  <Pagination page={page} total={9} onPageChange={setPage} />
</Card>
```
