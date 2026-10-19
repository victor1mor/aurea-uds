# Date picker

There is no DatePicker component: a picker is a trigger plus a popover plus this calendar. Three parts you already have, and the trigger is what names the field.

## Usage

```tsx
import {Button, Popover, Calendar} from "@aurea-uds/react";
```

```tsx
<Popover trigger={<Button leadingIcon="calendar">12 August 2026</Button>}>
  <Calendar mode="single" selected={date} onSelect={setDate} />
</Popover>
```
