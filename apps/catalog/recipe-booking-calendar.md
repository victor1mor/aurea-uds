# Booking · calendar

Book a time slot: availability, customer details, payment and confirmation.

## Usage

```tsx
import {Card, Radio, Field, Input, Button, Badge} from "@aurea-uds/react";
```

```tsx
<Card>
  <Badge>Europe/Lisbon</Badge>
  <Radio name="slot" label="09:00 – 09:30" defaultChecked />
  <Radio name="slot" label="11:00 – 11:30" />
  <Field label="Name"><Input defaultValue="Curator" /></Field>
  <Button variant="primary">Confirm booking</Button>
</Card>
```
