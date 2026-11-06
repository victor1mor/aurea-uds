# Commerce · finance

Cart, order, payment and reconciliation: a consequential write is idempotent and a terminal result becomes an immutable receipt.

## Usage

```tsx
import {Card, Separator, Avatar, Icon, Text, Code, Heading, Status, Button, DataList, Timeline, ConfirmDialog} from "@aurea-uds/react";
```

```tsx
import {useState} from "react";
import {Button, Card, Code, ConfirmDialog, DataList, Heading, Separator, Status, Text, Timeline} from "@aurea-uds/react";

export function Checkout({order}) {
  const [state, setState] = useState("pending");
  const [events, setEvents] = useState(order.events);
  const [confirm, setConfirm] = useState(false);
  const add = (title, description) => setEvents(e => [{title, description, time: now()}, ...e]);

  return (
    <Card>
      <header>
        <Code>{order.id}</Code>
        <Heading level={3}>{order.total}</Heading>
        <Status variant={state === "paid" ? "success" : "warning"}>{state === "paid" ? "Paid" : "Payment pending"}</Status>
        {state === "pending" && (
          <Button variant="primary" leadingIcon="credit-card"
            onClick={() => { setState("paid"); add(`Charged ${order.total}`, order.card); }}>Pay {order.total}</Button>
        )}
        {state === "paid" && <Button variant="danger-ghost" onClick={() => setConfirm(true)}>Refund</Button>}
      </header>
      <Separator />

      <Card variant="inset">
        <DataList items={order.lines.map(l => ({term: l.label, value: <Text numeric>{l.amount}</Text>}))} />
      </Card>
      <Card variant="inset">
        <Timeline variant="latest" items={events} />
      </Card>

      <div>
        <DataList items={[{term: "Order", value: <Code>{order.id}</Code>}, {term: "Idempotency key", value: <Code>{order.id}</Code>}]} />
      </div>

      <ConfirmDialog open={confirm} destructive title={`Refund ${order.total}?`} confirmLabel="Refund"
        description="The charge and this refund both stay in the history."
        onConfirm={() => { setConfirm(false); setState("refunded"); add(`Refunded ${order.total}`, order.card); }}
        onCancel={() => setConfirm(false)} />
    </Card>
  );
}
```
