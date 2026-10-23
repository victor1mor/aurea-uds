# Slider

Slider picks a number by dragging a thumb along a track: label and value on top, the track with its fill, a capsule thumb in the brand colour. One value or a range of two, horizontal or vertical, with the number written by the platform's Intl. It speaks numbers — onValueChange(value) — where Range speaks the browser's change event.

## Usage

```tsx
import {Slider} from "@aurea-uds/react";
```

```tsx
<Slider label="Volume" defaultValue={40} />
```

- The label names the thumbs; with two values, thumbLabels gives each one its own name.

- Arrows step, Page Up/Down and Shift + arrow take the large step, Home and End jump to the ends.

- onValueChange on every step; onValueCommitted when the thumb is released — the moment to save.

- format and locale write the value (percent, currency…) with Intl, as NumberField does.

- Range stays for the browser's own slider, with its change event.

- channel makes it a colour track — hue, saturation, brightness, lightness, red, green, blue or alpha: painted with the channel, the thumb in the colour.

- On a colour track the value is the colour (hex, rgb(), hsl(), hsb()), so several tracks share one colour; onValueChange gives the hex.

## Examples

### A range of two

Pass a list: two thumbs, and the fill between them. Each thumb has its own name.

```tsx
<Slider label="Price" defaultValue={[200, 800]} min={0} max={1000} step={50}
  thumbLabels={["Minimum", "Maximum"]} format={{style: "currency", currency: "BRL"}} locale="pt-BR" />
```

### Formatted

A percentage, written by Intl. The stored value stays the raw number.

```tsx
<Slider label="Discount" defaultValue={0.25} min={0} max={1} step={0.05} format={{style: "percent"}} />
```

### Vertical

Value on top, track in the middle, label below. The height is --range-vertical-size.

```tsx
<Slider label="Level" orientation="vertical" defaultValue={60} />
```

### Colour track

The hue, from 0 to 360 degrees. The screen reader hears the colour's name with the number.

```tsx
<Slider label="Hue" channel="hue" defaultValue="hsl(210, 100%, 50%)" />
```

### Colour track, disabled

Unavailable, not hidden.

```tsx
<Slider label="Hue" channel="hue" defaultValue="hsl(120, 100%, 40%)" disabled />
```

### Colour track, vertical

Standing up, like the number slider.

```tsx
<Slider label="Hue" channel="hue" orientation="vertical" defaultValue="hsl(280, 90%, 55%)" />
<Slider label="Brightness" channel="brightness" orientation="vertical" defaultValue="hsl(280, 90%, 55%)" />
```

### Colour track with the value

Controlled: the value is the colour, and onValueChange gives the hex.

```tsx
const [colour, setColour] = useState("hsl(30, 100%, 50%)");

<Slider label="Hue" channel="hue" value={colour} onValueChange={setColour} />
<ColorSwatch color={colour} label="The colour" />
```

### HSL channels

Three tracks share one colour: each one is painted with the other two.

```tsx
const [colour, setColour] = useState("hsl(200, 80%, 50%)");

<Slider label="Hue" channel="hue" colorSpace="hsl" value={colour} onValueChange={setColour} />
<Slider label="Saturation" channel="saturation" colorSpace="hsl" value={colour} onValueChange={setColour} />
<Slider label="Lightness" channel="lightness" value={colour} onValueChange={setColour} />
```

### Transparency

The alpha track, from transparent to solid, over a checkerboard. With transparency, the hex has eight digits.

```tsx
const [colour, setColour] = useState("rgba(4, 133, 247, 0.6)");

<Slider label="Alpha" channel="alpha" value={colour} onValueChange={setColour} />
```

### RGB channels

Red, green and blue, from 0 to 255.

```tsx
const [colour, setColour] = useState("rgb(240, 194, 0)");

<Slider label="Red" channel="red" value={colour} onValueChange={setColour} />
<Slider label="Green" channel="green" value={colour} onValueChange={setColour} />
<Slider label="Blue" channel="blue" value={colour} onValueChange={setColour} />
```

### Disabled

Unavailable, not hidden.

```tsx
<Slider label="Brightness" defaultValue={70} disabled />
```

### One colour space for a whole picker

colorSpace="rgb" on every track of a picker: red, green and blue are RGB channels already, and beside them a hue track reads rgb as hsb. So one value serves every track, and the picker passes it once.

```tsx
const [colour, setColour] = useState("rgb(4, 133, 247)");

<Slider label="Hue" channel="hue" colorSpace="rgb" value={colour} onValueChange={setColour} />
<Slider label="Red" channel="red" colorSpace="rgb" value={colour} onValueChange={setColour} />
<Slider label="Green" channel="green" colorSpace="rgb" value={colour} onValueChange={setColour} />
<Slider label="Blue" channel="blue" colorSpace="rgb" value={colour} onValueChange={setColour} />
<ColorSwatch color={colour} label="The colour" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `ReactNode` | — | REQUIRED. Names the thumbs. labelHidden keeps it for screen readers only. |
| `labelHidden` | `boolean` | false | Hides the label from the screen, keeps it as the accessible name. |
| `value / defaultValue` | `number \| number[]` | — | A number, or a list of two for a range (two thumbs). With channel, the colour (hex or rgb()/hsl()/hsb()). |
| `onValueChange` | `(value) => void` | — | Called on every step with the number (or the list). |
| `onValueCommitted` | `(value) => void` | — | Called when the thumb is released — the moment to save. |
| `min / max / step` | `number` | 0 / 100 / 1 | The scale. |
| `largeStep` | `number` | 10 | The step for Page Up/Down and Shift + arrow. |
| `orientation` | `horizontal \| vertical` | horizontal | Vertical stacks value, track and label; its height is --range-vertical-size. |
| `format / locale` | `Intl.NumberFormatOptions / string` | — | How the value is written (currency, percent…), by the platform's Intl. |
| `showValue` | `boolean` | true | Shows the value next to the label. |
| `thumbLabels` | `string[]` | — | With two values, each thumb's name, in order ("Minimum", "Maximum"). |
| `disabled` | `boolean` | false | Disables the slider. |
| `name` | `string` | — | For the form: the engine renders the hidden input with the raw value. |
| `channel` | `ColorChannel` | — | The colour track (ADR-0069), a variation of this Slider: hue, saturation, brightness, lightness, red, green, blue or alpha. The value becomes the COLOUR (hex), as in the reference, so several tracks share one colour; the track is painted with the channel, the thumb shows the colour, alpha has the checkerboard, and the screen reader hears the channel and the colour's name. |
| `colorSpace` | `"hsb" \| "hsl" \| "rgb"` | "hsb" | With channel: the space of hue and saturation. The other channels already say theirs (red, green and blue are rgb), so one colorSpace serves every track of a picker; with hue or saturation, rgb reads as hsb. |
| `className` | `string` | — | Merged onto the outermost element, after the Aurea skin. |
| `id` | `string` | — | The id of the slider root. |
