# Plan picker

One value out of a known set. Select chooses a value; a Menu would execute an action.

## Usage

```tsx
import {Field, Select} from "@aurea-uds/react";
```

```tsx
<Field label="Plan">
  <Select defaultValue="pro">
    <option value="free">Free</option>
    <option value="pro">Pro</option>
  </Select>
</Field>
```
