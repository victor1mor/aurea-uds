# Booking with days closed

The reason this component exists: a native date input cannot say "not before Thursday, and never a Sunday". The calendar can, and DatePicker takes the same rules.

## Usage

```tsx
import {Calendar} from "@aurea-uds/react";
```

```tsx
<Calendar
  mode="range"
  label="Stay"
  disabled={[{before: new Date(2026, 7, 6)}, {dayOfWeek: [0]}]}
/>
```
