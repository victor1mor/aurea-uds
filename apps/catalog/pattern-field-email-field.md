# Email field

Label, control and hint bound together — the hint is read by the screen reader, not painted beside it.

## Usage

```tsx
import {Field, Input} from "@aurea-uds/react";
```

```tsx
<Field label="Email" hint="We never share it.">
  <Input type="email" placeholder="you@example.com" />
</Field>
```
