# A quantity the form refused

Inside a Field with `error`, the field turns red like every other field — the border in the color of the message, and the label too — and a screen reader hears "invalid". Outside a Field, pass `aria-invalid`. The fill stays the same.

## Usage

```tsx
import {NumberField, Field} from "@aurea-uds/react";
```

```tsx
<Field label="Seats" error="Pick at least one seat">
  <NumberField label="Seats" defaultValue={0} min={0} />
</Field>
```
