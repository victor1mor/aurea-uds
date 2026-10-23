# OTPField

One box per character, for a verification code the user types or pastes.

## Usage

```tsx
import {OTPField} from "@aurea-uds/react";
```

```tsx
<OTPField length={6} label="Verification code" />
<OTPField length={6} groupSize={3} label="Verification code, in two groups" />
```

## Examples

### Variants

primary is the field on the page; secondary is the one inside a card or a dialog, a step darker.

```tsx
<OTPField length={6} variant="primary" label="Code, primary" />
<OTPField length={6} variant="secondary" label="Code, secondary" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `length` | `number` | — | REQUIRED. How many characters the code has. Without it the field cannot know when it is complete. |
| `value / defaultValue` | `string` | — | Controlled or uncontrolled. The whole code as one string, not one value per box. |
| `onValueChange` | `(value: string) => void` | — | Fires on every character, including when a full code is pasted at once. |
| `mask` | `boolean` | false | Hides the characters, the way a password does. |
| `groupSize` | `number` | — | The dash between groups: one every groupSize boxes (3 for a 6-digit code), as the reference's showcase. Drawing only — the screen reader goes box by box. |
| `variant` | `"primary" \| "secondary"` | "primary" | secondary gives the boxes the neutral background of the secondary Input, for a field inside a card. |
| `label` | `string` | — | Accessible name of the group — what the code is for. |
| `disabled / required` | `boolean` | false | Standard form states, forwarded to every box. |
| `className` | `string` | — | Merged onto the outermost element, after the Aurea skin — your class wins on a tie. |
| `id` | `string` | — | Id of the focusable control, which is what a <label htmlFor> has to point at. Generated when you do not pass one. |
