# Commerce · finance

Cart, order, payment and reconciliation: a consequential write is idempotent and a terminal result becomes an immutable receipt.

## Usage

```tsx
import {Card, DataList, Alert, Button, Badge} from "@aurea-uds/react";
```

```tsx
<Card>
  <Badge variant="warning">Payment pending</Badge>
  <DataList items={[
    {term: "Subtotal", value: "$240.00"},
    {term: "Tax", value: "$21.60"},
    {term: "Total", value: "$261.60"},
  ]} />
  <Alert variant="info">Charging twice is impossible: the order id is the idempotency key.</Alert>
  <Button variant="primary">Pay $261.60</Button>
</Card>
```
