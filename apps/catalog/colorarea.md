# ColorArea

ColorArea is the square where you pick two channels of a colour for the third one fixed — saturation (across) and brightness (up) by default, or any pair of HSB, HSL or RGB. It works by pointer, touch and keyboard, and the screen reader hears the channels and the colour's name.

## Usage

```tsx
import {ColorArea} from "@aurea-uds/react";
```

```tsx
<ColorArea defaultValue="#0485f7" aria-label="Fill" />
```

- The value is hex (#rrggbb), like the browser's colour input: value, defaultValue, onValueChange, onValueCommitted.

- Arrows move one step (Shift: ten); Page Up/Down change the brightness, Home/End the saturation.

- Two hidden range inputs, one per axis, announced as a 2D slider, with the colour's name in the app's language.

- colorSpace, xChannel and yChannel choose the pair: hue and saturation in HSL, red and blue in RGB…

- showDots draws a grid of dots over the area, to see the position.

- Dragging to grey keeps the hue: the area does not jump to red.

## Examples

### With dots

showDots: a grid of dots over the area.

```tsx
<ColorArea defaultValue="#7c3aed" showDots aria-label="Fill" />
```

### Colour spaces and channels

Any pair of channels, and the third one stays fixed: hue and saturation in HSL, red and blue in RGB, hue and brightness in HSB.

```tsx
<ColorArea colorSpace="hsl" xChannel="hue" yChannel="saturation" defaultValue="hsl(200, 80%, 50%)" aria-label="HSL" />
<ColorArea colorSpace="rgb" xChannel="red" yChannel="blue" defaultValue="rgb(120, 40, 220)" aria-label="RGB" />
<ColorArea xChannel="hue" yChannel="brightness" defaultValue="#16a34a" aria-label="HSB" />
```

### Disabled

The area does not move, and the keyboard skips it.

```tsx
<ColorArea defaultValue="#e11d48" disabled aria-label="Fill" />
```

### With the value

Controlled: the swatch and the code follow the area.

```tsx
const [colour, setColour] = useState("#0485f7");

<ColorArea value={colour} onValueChange={setColour} aria-label="Accent" />
<ColorSwatch color={colour} label="Accent" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | — | The colour, in hex or rgb()/hsl()/hsb(), controlled. |
| `defaultValue` | `string` | "#ffffff" | The starting colour when you do not control it. |
| `onValueChange` | `(value: string) => void` | — | Called on every step with #rrggbb. |
| `onValueCommitted` | `(value: string) => void` | — | Called when the pointer is released and on every key — the moment to save. |
| `colorSpace` | `"hsb" \| "hsl" \| "rgb"` | "hsb" | The colour space of the area. Without it, the one the channels ask for. |
| `xChannel` | `ColorChannel` | saturation (HSB, HSL) · red (RGB) | The channel across. |
| `yChannel` | `ColorChannel` | brightness (HSB) · lightness (HSL) · green (RGB) | The channel up. |
| `showDots` | `boolean` | false | A grid of dots over the area, as in the reference — it helps to see the position. |
| `disabled` | `boolean` | false | The area does not move. |
| `name` | `string` | — | Sends the colour with a form, as #rrggbb. |
| `id` | `string` | — | Id of the group. |
| `aria-label` | `string` | strings.colorPicker | What the colour is for ("Background"). The inputs are named "Background, Color picker"; without it, "Color picker". |
| `aria-labelledby` | `string` | — | Names the group and the inputs by another element's id. |
| `aria-describedby` | `string` | — | Goes to the inputs. |
| `className` | `string` | — | Merged onto the area, after the Aurea skin. |
