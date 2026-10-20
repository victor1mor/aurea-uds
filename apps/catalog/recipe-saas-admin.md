# SaaS · admin

Multi-tenant admin panel: navigate, list, create/edit records, settings and roles.

## Usage

```tsx
import {Card, SearchField, Button, Table, Status, Pagination} from "@aurea-uds/react";
```

```tsx
<Card>
  <SearchField placeholder="Filter members…" />
  <Button variant="outline" leadingIcon="plus">Invite</Button>
  <Table caption="Workspace members">
    <thead><tr><th>Member</th><th>Role</th><th>State</th></tr></thead>
    <tbody>{members.map(m => (
      <tr key={m.name}>
        <td>{m.name}</td><td>{m.role}</td>
        <td><Status variant={m.state}>{m.state}</Status></td>
      </tr>))}
    </tbody>
  </Table>
  <Pagination page={page} total={4} onPageChange={setPage} />
</Card>
```
