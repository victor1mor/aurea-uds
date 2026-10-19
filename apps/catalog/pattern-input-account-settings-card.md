# Account settings card

A short form on a surface: text, a choice, two toggles and one primary action.

## Usage

```tsx
import {Card, Field, Input, Select, Switch, Checkbox, Button} from "@aurea-uds/react";
```

```tsx
<Card>
  <Field label="Display name"><Input defaultValue="Curator" /></Field>
  <Field label="Language"><Select defaultValue="en">…</Select></Field>
  <Switch label="Email notifications" defaultChecked />
  <Checkbox label="Public profile" />
  <Button variant="primary">Save changes</Button>
</Card>
```
