# Date range in one field

From and to in ONE field: DatePicker with range opens the Aurea calendar, the first pick is one end and the second the other. Pass locale for the language; name sends the range as yyyy-mm-dd/yyyy-mm-dd.

## Usage

```tsx
import {Field, DatePicker} from "@aurea-uds/react";
```

```tsx
<Field label="Period">
  <DatePicker range defaultValue={{from: new Date(2026, 6, 1), to: new Date(2026, 6, 24)}} name="period" />
</Field>
```
