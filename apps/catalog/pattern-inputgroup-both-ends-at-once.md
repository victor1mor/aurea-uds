# Both ends at once

A currency on one side and a unit on the other, with the field between them. Two addons is the ceiling: a third leaves less room for the value than for the frame around it.

## Usage

```tsx
import {InputGroup, InputGroupAddon, Input} from "@aurea-uds/react";
```

```tsx
<InputGroup>
  <InputGroupAddon side="start" layout="inline">€</InputGroupAddon>
  <Input aria-label="Budget" defaultValue="1240.00" inputMode="decimal" />
  <InputGroupAddon side="end" layout="inline">/ month</InputGroupAddon>
</InputGroup>
```
