# Booking with days closed

The reason this component exists. A native date input cannot say "not before Thursday, and never a Sunday" — everything else about a plain date, it does better.

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
