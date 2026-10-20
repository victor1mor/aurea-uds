# Stepper

Progress through numbered steps, for a task that happens in a fixed order.

## Usage

```tsx
import {Stepper} from "@aurea-uds/react";
```

```tsx
<Stepper label="Publishing" items={[
  {label: "Configure", state: "done"},
  {label: "Permissions", state: "done"},
  {label: "Validation", state: "error"},
  {label: "Publish", optional: "Optional"},
]} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `StepItem[]` | none | REQUIRED. One entry per step: label, state, optional note, and an optional handler. The number comes from the position, so it can never drift. |
| `items[].state` | `"default" \| "active" \| "done" \| "error"` | "default" | `done` shows a check, `error` shows the error glyph in the danger colour, `active` is the one announced as current. |
| `items[].optional` | `ReactNode` | none | A note under the label, for a step that may be skipped. |
| `items[].onClick` | `() => void` | none | Makes the step a real button, for a flow the user may enter at any point. Without it the step is not interactive. |
| `label` | `string` | the provider's "Steps" | Accessible name of the whole list. |
| `className` | `string` | — | Merged onto the outermost element, after the Aurea skin — your class wins on a tie. |
