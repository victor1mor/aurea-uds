# Detail panel beside the list

The row stays on screen and the detail slides in beside it — the reason to pick a drawer over a dialog is exactly this: the context does not disappear.

## Usage

```tsx
import {Drawer, Button, Field} from "@aurea-uds/react";
```

```tsx
<Drawer open={open} onClose={close} side="right" title="Run #4821">
  <Field label="Status"><Input readOnly value="waiting_approval" /></Field>
  <Field label="Started"><Input readOnly value="14:31" /></Field>
</Drawer>
```
