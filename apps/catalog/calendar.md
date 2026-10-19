# Calendar

Month grid for picking a day, a range, or several days.

## Usage

```tsx
import {Calendar} from "@aurea-uds/react/calendar";
```

```tsx
<Calendar
  mode="range"
  label="Stay"
  defaultMonth={new Date(2026, 7, 1)}
  selected={{from: new Date(2026, 7, 12), to: new Date(2026, 7, 18)}}
  disabled={{before: new Date(2026, 7, 6)}}
/>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `mode` | `"single" \| "range" \| "multiple"` | none | What a click does. `single` picks one day, `range` picks a start and an end, `multiple` collects days that need not touch. |
| `selected` | `Date \| DateRange \| Date[]` | none | The current selection. Its shape follows `mode`. |
| `onSelect` | `(value) => void` | none | Called with the new selection. Without it the calendar is read-only, which is a legitimate use: a month with days marked. |
| `disabled` | `Matcher \| Matcher[]` | none | Days that cannot be picked — a date, a range, `{before}`/`{after}`, weekdays, or a function. This is what a native date input cannot do, and the reason this component exists. |
| `label` | `string` | none | Names the whole calendar, for when the month name is not enough to tell it apart — two of them side by side would both announce "August 2026". Inside a popover the trigger already says it, so leave it out. |
| `showOutsideDays` | `boolean` | true | Fills the first and last week with the neighbouring month's days. On by default: a grid with holes at the edges shifts shape when the month changes. |
| `className` | `string` | none | Added to the calendar box. |
| `…DayPicker` | `ComponentProps<typeof DayPicker>` | none | Everything else goes to the engine — `numberOfMonths`, `month`, `locale`, `weekStartsOn`, `fromDate`/`toDate`, `modifiers`. `classNames` merges over the Aurea names instead of replacing them. |
