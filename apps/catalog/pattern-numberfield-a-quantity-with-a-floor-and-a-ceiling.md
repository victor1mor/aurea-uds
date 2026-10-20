# A quantity with a floor and a ceiling

The steppers are for small corrections and the keyboard is for big ones — both hit the same bounds. Bounds on the field, not in a message after submit: the refusal should never be a surprise.

## Usage

```tsx
import {NumberField} from "@aurea-uds/react";
```

```tsx
<NumberField label="Retries" defaultValue={3} min={0} max={10} step={1} />
```
