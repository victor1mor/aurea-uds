# A unit that belongs to the value

The suffix is not a label and not a hint: it is part of reading the number. Putting "ms" inside the group keeps it welded to the field at every width, where a paragraph beside it would wrap away on a phone.

## Usage

```tsx
import {InputGroup, InputGroupAddon, Input} from "@aurea-uds/react";
```

```tsx
<InputGroup>
  <Input aria-label="Timeout" defaultValue="30000" inputMode="numeric" />
  <InputGroupAddon side="end" layout="inline">ms</InputGroupAddon>
</InputGroup>
```
