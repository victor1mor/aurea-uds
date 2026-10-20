# ColorPicker

ColorPicker is a swatch with a name that opens a window to pick a colour: the area, the hue track and the hex field, which is always there. With swatches, ready colours too; as the swatches variation, a closed palette.

## Usage

```tsx
import {ColorPicker} from "@aurea-uds/react";
```

```tsx
<ColorPicker label="Brand colour" defaultValue="#0485f7" />
```

- The value is hex (#rrggbb): value, defaultValue, onValueChange, onValueCommitted — like ColorArea and Slider.

- The hex field applies on Enter or when it loses focus; text that is not a colour goes back.

- Swatches without a label are named by the colour's name, in the app's language.

- variant="swatches" is the closed palette: only the swatches and the hex field.

- Dragging to grey keeps the hue, and the hue track still moves the area.

- The window can be assembled: children replaces the default content, and the colour pieces inside — ColorArea, Slider with channel, ColorField — share the picker's colour.

## Examples

### With swatches

Ready colours under the hue track. Controlled: the code follows.

```tsx
const [colour, setColour] = useState("#0485f7");

<ColorPicker label="Brand colour" value={colour} onValueChange={setColour}
  swatches={[{color: "#0485f7", label: "Ocean"}, {color: "#16a34a", label: "Forest"}, …]} />
```

### A closed palette

variant="swatches": only the swatches and the hex field.

```tsx
<ColorPicker label="Tag colour" variant="swatches" defaultValue="#16a34a"
  swatches={[{color: "#0485f7", label: "Ocean"}, {color: "#16a34a", label: "Forest"}, …]} />
```

### With fields

The window assembled with children: the area, the hue, and one field per channel — the colour space chosen in a Select.

```tsx
const [space, setSpace] = useState("hsl");
const channels = {hsb: ["hue", "saturation", "brightness"], hsl: ["hue", "saturation", "lightness"], rgb: ["red", "green", "blue"]};

<ColorPicker label="Pick a colour" defaultValue="hsla(220, 90%, 50%, 0.8)">
  <ColorArea />
  <Slider label="Hue" channel="hue" />
  <Select aria-label="Colour space" value={space} onValueChange={setSpace}
    items={[{value: "hsl", label: "HSL"}, {value: "hsb", label: "HSB"}, {value: "rgb", label: "RGB"}]} />
  <div style={{display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "var(--space-2)"}}>
    {channels[space].map((channel) => (
      <ColorField key={channel} channel={channel} colorSpace={space} variant="secondary" aria-label={channel} />
    ))}
  </div>
</ColorPicker>
```

### With sliders

One track per channel, transparency included — the colour space chosen in a Select.

```tsx
const [space, setSpace] = useState("hsl");
const channels = {hsb: ["hue", "saturation", "brightness"], hsl: ["hue", "saturation", "lightness"], rgb: ["red", "green", "blue"]};

<ColorPicker label="Pick a colour" defaultValue="hsl(219, 58%, 93%)">
  <Select aria-label="Colour space" value={space} onValueChange={setSpace}
    items={[{value: "hsl", label: "HSL"}, {value: "hsb", label: "HSB"}, {value: "rgb", label: "RGB"}]} />
  {[...channels[space], "alpha"].map((channel) => (
    <Slider key={channel} label={channel} channel={channel} colorSpace={space} />
  ))}
</ColorPicker>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | REQUIRED. The name next to the swatch on the trigger ("Brand colour"). Names the trigger and the window. |
| `value` | `string` | — | The colour in hex (#rrggbb or #rgb), controlled. |
| `defaultValue` | `string` | "#ffffff" | The starting colour when you do not control it. |
| `onValueChange` | `(value: string) => void` | — | Called on every step with #rrggbb. |
| `onValueCommitted` | `(value: string) => void` | — | Called on release, on every key, when a swatch is chosen and when the hex is confirmed — the moment to save. |
| `swatches` | `(string \| {color, label?})[]` | — | Ready colours, under the hue track; with variant="swatches", in place of the area. Without a label, each is named by the colour's name in the app's language. |
| `variant` | `"full" \| "swatches"` | "full" | "swatches": the closed palette (ADR-0069, the "C") — only the swatches and the hex field. |
| `children` | `ReactNode` | area, hue, swatches, hex field | The content of the window, built by you ("with fields", "with sliders"): the colour pieces without a value of their own — ColorArea, Slider with channel, ColorField — share the picker's colour. |
| `disabled` | `boolean` | false | The trigger does not open. |
| `name` | `string` | — | Sends the colour with a form, as #rrggbb. |
| `id` | `string` | — | Id of the trigger. |
| `className` | `string` | — | Merged onto the trigger, after the Aurea skin. |
