# A code that did not match

Inside a Field with `error`, every box turns red — the border in the color of the message — and a screen reader hears "invalid" on each one. Outside a Field, pass `aria-invalid`.

## Usage

```tsx
import {OTPField, Field} from "@aurea-uds/react";
```

```tsx
<Field label="Verification code" error="That code did not match">
  <OTPField length={6} defaultValue="123" />
</Field>
```
