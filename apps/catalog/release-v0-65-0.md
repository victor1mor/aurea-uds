# v0.65.0

DatePicker turns red on error and keeps the focus inside the open calendar.

## Added

- **`DatePicker` `aria-invalid`**: the trigger turns red like the other fields, and a screen reader hears "invalid". Inside a `Field` with `error`, it arrives on its own. Before, the message showed and the box stayed grey. Web only.

## Fixed

- **The calendar keeps the focus.** Tab and Shift+Tab now move around inside the open calendar, and it no longer closes on its own. Before, the first Tab left the calendar, went back to the trigger and closed it. Escape still closes it and returns the focus to the trigger.

## Documentation

- `DatePicker`: the docs list the `invalid` state, the `aria-invalid` prop and how Tab behaves inside the calendar.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.65.0 @aurea-uds/core@0.65.0 @aurea-uds/fonts@0.65.0 @aurea-uds/icons@0.65.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.65.0
```
