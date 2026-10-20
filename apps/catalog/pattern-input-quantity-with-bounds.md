# Quantity with bounds

A number the browser keeps inside its range, with the limit written next to it.

## Usage

```tsx
import {Field, Input} from "@aurea-uds/react";
```

```tsx
<Field label="Seats" hint="1 to 99"><Input type="number" min={1} max={99} defaultValue={12} /></Field>
```
