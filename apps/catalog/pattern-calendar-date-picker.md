# Date picker

In a form, DatePicker is this already. Underneath it is a trigger plus a popover plus this calendar: compose them yourself when the trigger is not a field, like this button.

## Usage

```tsx
import {Button, Popover, Calendar} from "@aurea-uds/react";
```

```tsx
<Popover trigger={<Button leadingIcon="calendar">12 August 2026</Button>}>
  <Calendar mode="single" selected={date} onSelect={setDate} />
</Popover>
```
