# An address the form refused

Inside a Field with `error`, the whole group turns red — the border in the color of the message — and the field in the middle tells a screen reader it is invalid. Outside a Field, pass `aria-invalid` to the group; a field that says its own `aria-invalid` keeps it.

## Usage

```tsx
import {InputGroup, InputGroupAddon, Input, Field} from "@aurea-uds/react";
```

```tsx
<Field label="Website" error="Enter a full address">
  <InputGroup>
    <InputGroupAddon>https://</InputGroupAddon>
    <Input defaultValue="example" />
  </InputGroup>
</Field>
```
