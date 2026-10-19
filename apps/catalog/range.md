# Range

Range is a value picked along a line: volume, opacity, a threshold. It is the native input, themed by tokens — the drag, the arrow keys and the touch behaviour are the platform's. Use it when the approximate value is the point; when the exact number matters, pair it with a field.

## Usage

```tsx
import {Range, Field} from "@aurea-uds/react";
```

```tsx
<Field label="Volume"><Range defaultValue={60} /></Field>
```

- For the drawn slider — label and value on top, the fill, a range of two thumbs, formatted values — use Slider. Range is the browser's own control, with the change event.

- Native input: dragging, arrow keys, Home and End all work without a line of our JS.

- The thumb and the track wear the tokens — the accent colour is the brand's, in both themes.

- min, max and step pass through; the browser enforces them.

- Show the number next to it when the value is meant to be read, not only felt.

- Two thumbs (a min–max band) is not this component: use two fields until a real demand appears.

## Examples

### With the number

When the exact value matters, the slider sets it and the field states it.

```tsx
<div className="cluster">
  <Range min={0} max={100} defaultValue={72} />
  <Input type="number" defaultValue={72} min={0} max={100} />
</div>
```

### Steps

A coarse step turns a continuous line into a small set of allowed values.

```tsx
<Range min={0} max={4} step={1} defaultValue={2} />
```

### Disabled

Locked value: still readable, not draggable.

```tsx
<Range defaultValue={30} disabled />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `min / max / step` | `number` | 0 / 100 / 1 | Native bounds. The thumb is themed by tokens; the behaviour is the browser's. |
| `value / defaultValue` | `number` | — | Controlled or uncontrolled. |
| `disabled` | `boolean` | false | Native disabled. |
| `className` | `string` | — | Extra classes. Pair it with a text field when the exact number matters. |
| `orientation` | `Responsive<RangeOrientation>` | horizontal | A vertical slider. The engine publishes the orientation and the arrow keys follow it, so this is not only a rotation. |
