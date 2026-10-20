# Filters that stay open while you read

Filters on the left, results on the right. A dialog would cover the results the filters are changing, which is the one thing a filter panel must not do.

## Usage

```tsx
import {Drawer, Select, Button} from "@aurea-uds/react";
```

```tsx
<Drawer open={open} onClose={close} side="left" title="Filters">
  <Field label="Status"><Select>…</Select></Field>
  <Field label="Owner"><Select>…</Select></Field>
  <Button variant="primary" fullWidth onClick={apply}>Apply</Button>
</Drawer>
```
