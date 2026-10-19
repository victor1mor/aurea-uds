# Support · service

Inbox, case history, SLA and escalation: the identity of the case and the channel stays visible and escalating records a reason and an owner.

## Usage

```tsx
import {Card, Table, Badge, Status, Button} from "@aurea-uds/react";
```

```tsx
<Card>
  <Table caption="Inbox">
    <thead><tr><th>Case</th><th>SLA</th><th>State</th></tr></thead>
    <tbody><tr><td>#3412 · cannot sign in</td>
      <td><Badge variant="danger">12 min left</Badge></td>
      <td><Status variant="busy">with support</Status></td></tr></tbody>
  </Table>
  <Button variant="outline">Escalate</Button>
</Card>
```
