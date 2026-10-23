# ColorField

ColorField is the field for a colour: the swatch in front and the code — hex, rgb(), hsl() or hsb(). The code applies on Enter or when the field loses focus; text that is not a colour goes back. With channel, it edits one channel as a number. It is the same Input, with the same sizes and variants, and Field gives it the label.

## Usage

```tsx
import {ColorField} from "@aurea-uds/react";
```

```tsx
<Field label="Colour">
  <ColorField defaultValue="#0485f7" />
</Field>
```

- The value is hex (#rrggbb, or #rrggbbaa with transparency): value, defaultValue, onValueChange, onValueCommitted — like ColorArea and ColorPicker.

- Without defaultValue the field starts empty; clearing it calls onValueChange with "".

- channel edits one channel — hue, saturation, brightness, lightness, red, green, blue or alpha — announced as a number with the colour's name.

- Inside a Field, the label, the description and the error are the Field's, as in every Aurea field.

- Inside a ColorPicker, without a value of its own, it edits the picker's colour.

- name sends the colour with a form, as hex.

## Examples

### Variants

Since 0.34.0 neither has a line: both are a translucent fill of the text colour — the same two as Input.

```tsx
<Field label="Primary"><ColorField defaultValue="#0485f7" /></Field>
<Field label="Secondary"><ColorField variant="secondary" defaultValue="#0485f7" /></Field>
```

### In a card

On a card the field background disappears; variant="secondary" keeps it visible.

```tsx
<Card>
  <Field label="Background"><ColorField variant="secondary" defaultValue="#7c3aed" /></Field>
</Card>
```

### Sizes

sm, md and lg — the same steps as Input and Button.

```tsx
<ColorField size="sm" defaultValue="#e11d48" aria-label="Small" />
<ColorField defaultValue="#e11d48" aria-label="Medium" />
<ColorField size="lg" defaultValue="#e11d48" aria-label="Large" />
```

### With a description

The Field's hint describes the field.

```tsx
<Field label="Link colour" hint="Hex, rgb() or hsl(). Enter applies it.">
  <ColorField defaultValue="#0485f7" />
</Field>
```

### Required

The Field's required marks the field.

```tsx
<Field label="Brand colour" required>
  <ColorField placeholder="#0485f7" />
</Field>
```

### Disabled and read-only

Disabled does not take input and is skipped by the keyboard; read-only is shown and focusable.

```tsx
<Field label="Theme colour"><ColorField defaultValue="#f0c200" disabled /></Field>
<Field label="Inherited colour"><ColorField defaultValue="#f0c200" readOnly /></Field>
```

### Width

The whole line, like the other fields. width sets another one.

```tsx
<Field label="Full line"><ColorField defaultValue="#16a34a" /></Field>
<Field label="Narrow"><ColorField defaultValue="#16a34a" width="12rem" /></Field>
```

### Validation

The Field's error marks the field invalid and is read with it. Here, while the field is empty.

```tsx
const [colour, setColour] = useState("");

<Field label="Brand colour" required error={colour === "" ? "Pick a colour — hex, rgb() or hsl()." : undefined}>
  <ColorField value={colour} onValueChange={setColour} placeholder="#0485f7" />
</Field>
```

### One channel

channel edits one channel as a number: arrows, Page Up/Down, Home and End. Three fields share one colour.

```tsx
const [colour, setColour] = useState("#0485f7");

<Field label="Hue"><ColorField channel="hue" value={colour} onValueChange={setColour} /></Field>
<Field label="Saturation"><ColorField channel="saturation" value={colour} onValueChange={setColour} /></Field>
<Field label="Brightness"><ColorField channel="brightness" value={colour} onValueChange={setColour} /></Field>
```

### With the value

Controlled: the code follows the field, and the button sets it from outside.

```tsx
const [colour, setColour] = useState("#16a34a");

<Field label="Accent"><ColorField value={colour} onValueChange={setColour} /></Field>
<Button onClick={() => setColour("#0485f7")}>Reset</Button>
```

### In a form

name sends the colour as hex.

```tsx
<form onSubmit={save}>
  <Field label="Brand colour" required>
    <ColorField name="brand" defaultValue="#f0c200" />
  </Field>
  <Button type="submit">Save</Button>
</form>
```

### HSL channels

colorSpace="hsl" makes hue and saturation the HSL ones, beside lightness. Three fields share one colour.

```tsx
const [colour, setColour] = useState("hsl(200, 80%, 50%)");

<Field label="Hue"><ColorField channel="hue" colorSpace="hsl" value={colour} onValueChange={setColour} width="6rem" /></Field>
<Field label="Saturation"><ColorField channel="saturation" colorSpace="hsl" value={colour} onValueChange={setColour} width="6rem" /></Field>
<Field label="Lightness"><ColorField channel="lightness" colorSpace="hsl" value={colour} onValueChange={setColour} width="6rem" /></Field>
<ColorSwatch color={colour} label="The HSL colour" />
```

### RGB channels and alpha

Red, green and blue from 0 to 255, and alpha. They are RGB channels with or without colorSpace="rgb"; the prop only changes hue and saturation, so one value can go to every field of a picker.

```tsx
const [colour, setColour] = useState("rgba(240, 194, 0, 0.8)");

<Field label="Red"><ColorField channel="red" colorSpace="rgb" value={colour} onValueChange={setColour} width="6rem" /></Field>
<Field label="Green"><ColorField channel="green" colorSpace="rgb" value={colour} onValueChange={setColour} width="6rem" /></Field>
<Field label="Blue"><ColorField channel="blue" colorSpace="rgb" value={colour} onValueChange={setColour} width="6rem" /></Field>
<Field label="Alpha"><ColorField channel="alpha" colorSpace="rgb" value={colour} onValueChange={setColour} width="6rem" /></Field>
<ColorSwatch color={colour} label="The RGB colour" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | — | The colour, in hex or rgb()/hsl()/hsb(); "" is the empty field. Controlled. |
| `defaultValue` | `string` | — | The starting colour when you do not control it. Without it, the field starts empty. |
| `onValueChange` | `(value: string) => void` | — | Called when the code is applied (Enter or leaving the field) and on every key in a channel, with the hex — or "" when it is cleared. |
| `onValueCommitted` | `(value: string) => void` | — | Called with onValueChange — the moment to save. |
| `channel` | `ColorChannel` | — | One channel, as a number, in place of the code: hue, saturation, brightness, lightness, red, green, blue or alpha. |
| `colorSpace` | `"hsb" \| "hsl" \| "rgb"` | "hsb" | With channel: the space of hue and saturation. |
| `swatch` | `boolean` | true for the code, false for a channel | The swatch in front. |
| `size` | `Responsive<sm \| md \| lg>` | md | The field height, the same scale as Input. |
| `variant` | `"primary" \| "secondary"` | "primary" | secondary is the neutral background, for a field inside a card — the same as Input. |
| `width` | `string` | 100% | The field width — "20rem" or "auto". Without it, the whole line, like the other fields. |
| `disabled` | `boolean` | false | The field does not take input. |
| `readOnly` | `boolean` | false | Shown and focusable, not editable. |
| `required` | `boolean` | false | Inside a Field, Field's required does it. |
| `name` | `string` | — | Sends the colour with a form, as hex. |
| `placeholder` | `string` | — | Shown while the field is empty. |
| `id` | `string` | — | Id of the input — what a label points at. Inside a Field, the Field gives it one. |
| `aria-label` | `string` | — | Names the field when there is no visible label. |
| `aria-labelledby` | `string` | — | Names the field by another element's id. |
| `aria-describedby` | `string` | — | Goes to the input. Inside a Field, the description and the error are added. |
| `aria-invalid` | `boolean` | — | Marks the value as rejected. Inside a Field, the error does it. |
| `className` | `string` | — | Merged onto the group, after the Aurea skin. |
