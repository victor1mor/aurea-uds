# Settings row

Label on the left, control on the right — the line every settings screen is made of. Until August 2026 this only came out of Aurea with ad-hoc CSS. It is a grid and not a row for one reason: in a row the error message would become a third column beside the control, and the error is about the value, so it belongs under it.

## Usage

```tsx
import {Field, Select} from "@aurea-uds/react";
```

```tsx
<Field label="Time zone" hint="used in reports" orientation="horizontal" error="Unknown zone">
  <Select aria-label="Time zone">…</Select>
</Field>
```
