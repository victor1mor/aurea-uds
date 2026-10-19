# A prefix that cannot be typed away

The scheme and host are fixed; only the path is the user's. Showing them as an addon instead of pre-filling the field means the reader can never delete them by holding backspace, and the value you read back is only ever the part you asked for.

## Usage

```tsx
import {InputGroup, InputGroupAddon, Input} from "@aurea-uds/react";
```

```tsx
<InputGroup>
  <InputGroupAddon side="start" layout="inline">aureauds.dev/</InputGroupAddon>
  <Input aria-label="Path" defaultValue="components/button" />
</InputGroup>
```
