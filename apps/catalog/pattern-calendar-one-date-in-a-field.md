# One date in a field

One plain date in a form: DatePicker is the field that opens this calendar, in every theme and brand. Pass locale for the language; name sends the date as yyyy-mm-dd.

## Usage

```tsx
import {Field, DatePicker} from "@aurea-uds/react";
```

```tsx
<Field label="Invoice date"><DatePicker defaultValue={new Date(2026, 7, 12)} name="invoice" /></Field>
```
