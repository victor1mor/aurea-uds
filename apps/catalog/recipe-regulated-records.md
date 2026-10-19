# Regulated records

Consent, audit, error prevention and retention: least privilege is visible and a consequential submission includes review and a receipt.

## Usage

```tsx
import {Card, Alert, Checkbox, DataList, Button} from "@aurea-uds/react";
```

```tsx
<Card>
  <Alert variant="danger" title="This cannot be undone">
    Deleting a record breaks the retention chain. It is logged with your name.
  </Alert>
  <DataList items={[
    {term: "Consent", value: "given 12/03/2026"},
    {term: "Retention", value: "7 years"},
    {term: "Last access", value: "Curator · 09:14"},
  ]} />
  <Checkbox label="I understand the consequence" />
  <Button variant="danger" disabled>Delete record</Button>
</Card>
```
