# NumberField

Numeric field with decrease and increase controls, for a quantity you nudge.

## Usage

```tsx
import {NumberField} from "@aurea-uds/react";
```

```tsx
<NumberField defaultValue={1} min={0} max={99} label="Quantity" />

<NumberField
  label="Price"
  name="price"
  defaultValue={1234.5}
  format={{style: "currency", currency: "BRL"}}
  locale="pt-BR"
/>
```

## Examples

### Drag to change

scrubbable adds a handle you pull to change the value; scrubDirection says which way. The buttons and the keys keep working.

```tsx
<NumberField scrubbable defaultValue={50} min={0} max={100} label="Opacity" scrubDirection="horizontal" />
<NumberField scrubbable defaultValue={50} min={0} max={100} label="Opacity" scrubDirection="vertical" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `value / defaultValue` | `number \| null` | none | Controlled or uncontrolled. `null` means empty, which is not the same as zero. |
| `onValueChange` | `(value: number \| null) => void` | none | Fires with the parsed number, or null when the field is cleared. |
| `min / max` | `number` | none | Bounds. The engine clamps and disables the control that would cross them. |
| `step` | `number` | 1 | How much each press moves the value. |
| `format` | `Intl.NumberFormatOptions` | — | Currency, percent or unit, formatted by the platform's Intl — {style: "currency", currency: "BRL"} replaces the money-formatting library a consumer would otherwise install for this alone. The engine formats when focus LEAVES the field, which is what accessibility guidance recommends and the opposite of a live mask. |
| `locale` | `string` | the browser's | Which locale formats the number. Pass it when the value's locale is a property of the data (a price in BRL) rather than of the reader. |
| `name` | `string` | — | Form field name. It is also what makes the engine render the hidden input carrying the RAW number, so what a form submits is 1234.5 and never the formatted text. |
| `label` | `string` | none | Accessible name of the field. Use with `Field` when there is a visible label. |
| `disabled / readOnly / required` | `boolean` | false | Standard form states, forwarded to the input and to both buttons. |
| `scrubbable / scrubDirection` | `boolean / 'horizontal' \| 'vertical'` | false / horizontal | Opt-in drag handle: pulling it changes the value, which beats forty clicks on + over a wide range. Purely additive — the two buttons, the arrow keys and Home/End are untouched, and the handle itself is aria-hidden because dragging is a pointer gesture with no keyboard equivalent to promise. The axis is a class, not a data attribute: the engine does not publish direction. |
| `className` | `string` | — | Merged onto the outermost element, after the Aurea skin — your class wins on a tie. |
| `id` | `string` | — | Id of the focusable control, which is what a <label htmlFor> has to point at. Generated when you do not pass one. |
