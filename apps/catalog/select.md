# Select

Select chooses a VALUE from a known list. A Menu executes an ACTION — that is the line between them, and it decides which one you need. This is the native element: the list is the platform's, which is why it works with a screen reader, on a phone, and with the keyboard you already know.

## Usage

```tsx
import {Select, Field} from "@aurea-uds/react";
```

```tsx
<Select size="sm">…</Select>
<Select>…</Select>
<Select size="lg">…</Select>
```

- Native <select>: the option list is the platform's own, on every device, with no JS to load.

- Choosing a value is Select; running a command is DropdownMenu. Never swap them for looks.

- <optgroup> works, so a long list can be sectioned without a custom widget.

- The chevron is drawn by the field and mirrors itself in RTL.

- When the user needs to type to find the option, that is Combobox — not a longer Select.

## Examples

### A plain choice

Short list, one value. The Field names the question.

```tsx
<Field label="Plan">
  <Select defaultValue="pro">
    <option value="free">Free</option>
    <option value="pro">Pro</option>
    <option value="scale">Scale</option>
  </Select>
</Field>
```

### Grouped options

optgroup sections a long list; the browser reads the group name before the options.

```tsx
<Select defaultValue="fra">
  <optgroup label="Europe"><option value="fra">Paris</option></optgroup>
  <optgroup label="Americas"><option value="gru">São Paulo</option></optgroup>
</Select>
```

### Disabled

The whole field, or a single option that exists but cannot be picked yet.

```tsx
<Select disabled defaultValue="pro">…</Select>
<option value="lifetime" disabled>Lifetime (soon)</option>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | <option> and <optgroup> elements, read the way the browser reads them: an option without value uses its text. Kept so code written for the native <select> keeps working; the list itself is drawn by the Aurea. |
| `value / defaultValue` | `string` | — | The chosen value, as a string. Without value, defaultValue or placeholder the first enabled option is chosen, which is what the native <select> did. |
| `items` | `SelectOption[] \| SelectOptGroup[]` | — | The list as data: { value, label, disabled? } or groups { label, items }. Use it instead of <option> children when the list comes from data. |
| `onChange` | `(e: { target: { value, name } }) => void` | — | Called with an event-shaped object, so handlers written for the native <select> (reading e.target.value) keep working. |
| `onValueChange` | `(value: string) => void` | — | Called with the chosen value directly. |
| `placeholder` | `ReactNode` | — | Shown in the trigger while nothing is chosen. Giving one also stops the first option from being chosen by default. |
| `name` | `string` | — | Form field name. The value is submitted through a hidden input, as the native element did. |
| `required` | `boolean` | false | The form will not submit without a value. |
| `disabled` | `boolean` | false | Native disabled. |
| `className` | `string` | — | Extra classes. Choosing a VALUE is Select; executing an ACTION is a Menu. |
| `size` | `Responsive<FieldSize>` | md | The system's size step, NOT the HTML size attribute — that one is how many options show at once, and it is deliberately shadowed here. |
