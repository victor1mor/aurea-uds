# Toggle

Toggle is a button that stays on. It is the Aurea component for a two-state control that is not a form field: bold in a text toolbar, list-or-grid, mute. The state is aria-pressed, so a screen reader announces it as a toggle button and says whether it is pressed.

## Usage

```tsx
import {Toggle} from "@aurea-uds/react";
```

```tsx
<Toggle defaultPressed>Bold</Toggle>
<Toggle>Italic</Toggle>
<Toggle>Underline</Toggle>
```

- It OWNS the state. Uncontrolled with defaultPressed, controlled with pressed plus onPressedChange — the Base UI engine handles keyboard, focus and aria-pressed.

- THE LABEL MUST NOT CHANGE between the two states. If the text turns from "Mute" into "Unmute", or "Play" into "Pause", this is the wrong component: use a Button. A screen reader reads the new label and the state at the same time, and the listener cannot tell whether the button describes what it IS or what it WILL DO. The rule is the APG's and one of the references', and it is the one rule that decides between the two components.

- Icon only needs a name: pass label. Without visible children and without label the component writes to the console, because an anonymous button is a dead end for a screen reader.

- It is not a Switch and not a Checkbox. A switch is a setting that applies immediately; a checkbox is a form field that gets submitted; a toggle is an action that stays on.

- `Button` also accepts a `pressed` prop. It is DEPRECATED since 0.4.0 and goes away in 1.0 — it only paints and announces, and you keep the state. Twelve reference libraries were read in August 2026 and none of them puts the pressed state on the plain button.

## Examples

### Icon only, with a name

No visible text means label is required — it becomes the accessible name. Note the name says what the control IS ("Mute"), not what pressing it will do.

```tsx
<Toggle icon="speaker-slash" label="Mute" />
```

### Ghost

The default has the neutral fill; ghost has none, for a quiet row. Pressed looks the same on both.

```tsx
<Toggle variant="ghost" icon="text-b" label="Bold" defaultPressed />
<Toggle variant="ghost" icon="text-italic" label="Italic" />
```

### Sizes

The button scale — sm, md and lg — so a toggle sits level with the controls beside it. md is the default.

```tsx
<Toggle size="sm">Small</Toggle>
<Toggle size="md">Medium</Toggle>
<Toggle size="lg">Large</Toggle>
```

### The colour of the on state

pressedStyle (ADR-0084): brand — the yellow of the primary button, the default — neutral (grey) or contrast (graphite, inverted). Each button below is pressed.

```tsx
<Toggle icon="text-b" label="Bold" defaultPressed pressedStyle="brand" />
<Toggle icon="text-b" label="Bold" defaultPressed pressedStyle="neutral" />
<Toggle icon="text-b" label="Bold" defaultPressed pressedStyle="contrast" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `pressed / defaultPressed` | `boolean` | none | Controlled or uncontrolled. The engine keeps aria-pressed in sync; you never set it. |
| `onPressedChange` | `(pressed: boolean) => void` | none | Fires with the new state. Pair with `pressed` for the controlled form. |
| `icon` | `IconName` | none | Glyph shown before the label, or alone when there are no children. |
| `label` | `string` | none | REQUIRED and non-blank when there is no visible text: an icon-only toggle with no name is unusable by screen reader. Since 2026-08-12 the ToggleProps union rejects omitted, boolean and nullish children unless label is present. Blank labels, empty strings, arrays, Fragments and decorative-only elements need a runtime guard because TypeScript/ReactNode cannot encode whether arbitrary content will render text; they emit console.error too. A custom child that receives apparently visible children but discards them remains the consumer's responsibility (AUD-0003). |
| `size` | `"sm" \| "md" \| "lg"` | "md" | Matches the button scale, so a toggle sits level with the controls beside it. |
| `disabled` | `boolean` | false | Ignores interaction and dims the control. |
| `children` | `ToggleChildren \| never` | — | What the toggle shows. With children you may omit label; with no children label is REQUIRED, because a bare icon with no accessible name is a control nobody can announce. The type enforces it — the form without a name does not compile. |
| `id` | `string` | — | Id of the focusable control, which is what a <label htmlFor> has to point at. Generated when you do not pass one. |
| `className` | `string` | — | Merged onto the outermost element, after the Aurea skin — your class wins on a tie. |
| `value` | `string` | — | What identifies this toggle inside a ToggleGroup — without it the group cannot tell which button changed. Standalone, it makes no difference. |
| `variant` | `default \| ghost` | default | default has the neutral fill; ghost has none. Pressed uses Aurea's selected language on both. |
| `pressedStyle` | `"brand" \| "neutral" \| "contrast"` | "brand" | The colour of the ON state (ADR-0084): brand — the yellow of the primary button, the default — neutral (grey) or contrast (graphite, inverted). Written as data-pressed-style; the same attribute on a container, or on <html>, sets it for every pressed button inside, and a button's own value wins. With the system's "increase contrast", neutral gets a 3:1 outline. |
