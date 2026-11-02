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

## Examples

### Path

variant="path" is a path you choose on: big numbered dots on one thick rail, the chosen one inverted and larger, and two ends that do not click. On a narrow container, four per row and no rail.

```tsx
<Stepper variant="path" label="Before 1.0" startContent="0.x" endContent="1.0" items={[
  {label: "Finish the open requests", onClick: () => {}},
  {label: "Review every component", state: "active", onClick: () => {}},
  {label: "Run on iOS devices", onClick: () => {}},
  {label: "An independent audit", onClick: () => {}},
]} />
```

### Bar

variant="bar" is progress in parts: each part is the link to its step and turns green when the step is done. startContent names the bar; endContent counts, and is announced when it changes.

```tsx
<Stepper variant="bar" label="Setup progress" startContent="Your setup" endContent="2 of 4 done" items={[
  {label: "Install, done", state: "done", href: "#install"},
  {label: "Import the styles, done", state: "done", href: "#styles"},
  {label: "Add the provider", href: "#provider"},
  {label: "Your first component", href: "#first"},
]} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `StepItem[]` | none | REQUIRED. One entry per step: label, state, optional note, and an optional handler. The number comes from the position, so it can never drift. |
| `items[].state` | `"default" \| "active" \| "done" \| "error"` | "default" | `done` shows a check, `error` shows the error glyph in the danger colour, `active` is the one announced as current. |
| `items[].optional` | `ReactNode` | none | A note under the label, for a step that may be skipped. |
| `items[].onClick` | `() => void` | none | Makes the step a real button, for a flow the user may enter at any point. Without it the step is not interactive. |
| `items[].href` | `string` | — | Makes the step a link (in the bar, each part leads to its step). |
| `label` | `string` | the provider's "Steps" | Accessible name of the whole list. |
| `variant` | `"default" \| "path" \| "bar"` | "default" | path: a path you choose on — 50 dots (--control-h-xl) on the card with the small shadow, numbers in the code font, one 8 rail (--fill-2) end to end, the chosen step inverted and 56; the labels stay for screen readers; under a 30rem container, four per row and no rail. bar: progress in parts — each step is a 12 part of the bar, 6 apart, the link or button of its step, green when done; the label stays for screen readers. |
| `startContent / endContent` | `ReactNode` | — | path: the two ends that do not click (the start one in the brand yellow). bar: the name before the bar (600) and the count after it (code font, role=status, announced when it changes). |
| `className` | `string` | — | Merged onto the outermost element, after the Aurea skin — your class wins on a tie. |
