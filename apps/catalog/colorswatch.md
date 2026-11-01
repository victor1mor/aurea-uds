# ColorSwatch

ColorSwatch shows a colour as a round sample. A thin ring inside keeps a colour that matches the background visible. It is an image for screen readers, named by label.

## Usage

```tsx
import {ColorSwatch} from "@aurea-uds/react";
```

```tsx
<ColorSwatch color="#f0c200" size="xs" label="Aurea yellow" />
<ColorSwatch color="#f0c200" size="sm" label="Aurea yellow" />
<ColorSwatch color="#f0c200" label="Aurea yellow" />
<ColorSwatch color="#f0c200" size="lg" label="Aurea yellow" />
<ColorSwatch color="#f0c200" size="xl" label="Aurea yellow" />
```

- Any CSS colour: hex, oklch(), or a token such as var(--primary).

- Five sizes from the reference library: 16, 24, 32, 36 and 40.

- Round only. A transparent colour shows a checkerboard underneath.

- role="img" named by label; without it, the colour value is read.

- With options, a group of swatches to pick one from: native radio buttons, so the choice and the arrows work without JavaScript.

## Examples

### A palette

Tokens work too; the ring keeps the background colour visible.

```tsx
<ColorSwatch color="var(--primary)" label="Primary" />
<ColorSwatch color="var(--success)" label="Success" />
<ColorSwatch color="var(--background)" label="Background" />
```

### Pick from a palette

options turns the swatch into a group to pick one colour. The chosen one gets the ring in its own colour and a check in the ink that contrasts most.

```tsx
<ColorSwatch
  name="accent"
  label="Accent colour"
  defaultValue="#0485f7"
  options={[
    {color: "#0485f7", label: "Ocean"},
    {color: "#16a34a", label: "Forest"},
    {color: "#f0c200", label: "Aurea yellow"},
    {color: "#e11d48", label: "Ruby"},
    {color: "#7c3aed", label: "Violet"},
  ]}
/>
```

### Transparency

A colour with alpha below 1 — hex of eight digits, rgba(), hsla() — shows the checkerboard underneath.

```tsx
<ColorSwatch color="#0485f7" label="Solid" />
<ColorSwatch color="#0485f7aa" label="Two thirds" />
<ColorSwatch color="rgba(4, 133, 247, 0.35)" label="A third" />
<ColorSwatch color="#0485f700" label="Transparent" />
```

### A name for the screen reader

The swatch is an image. label names it; without it, the screen reader reads the colour's code.

```tsx
<ColorSwatch color="#16a34a" label="Forest green" />
<ColorSwatch color="#16a34a" />
```

### Options in sizes

The group takes the same five sizes.

```tsx
<ColorSwatch size="sm" name="small" label="Small" defaultValue="#0485f7" options={options} />
<ColorSwatch name="medium" label="Medium" defaultValue="#0485f7" options={options} />
<ColorSwatch size="xl" name="large" label="Large" defaultValue="#0485f7" options={options} />
```

### A colour you cannot pick

disabled on one option: the others stay available. disabled on the group turns off all of them.

```tsx
<ColorSwatch name="plan" label="Plan colour" defaultValue="#0485f7" options={[
    {color: "#0485f7", label: "Ocean"},
    {color: "#16a34a", label: "Forest"},
    {color: "#f0c200", label: "Aurea yellow", disabled: true},
    {color: "#e11d48", label: "Ruby"},
  ]} />
```

### In a column

layout="stack": one under the other.

```tsx
<ColorSwatch layout="stack" name="stack" label="Status colour" defaultValue="#16a34a"
  options={[
    {color: "#0485f7", label: "Ocean"},
    {color: "#16a34a", label: "Forest"},
    {color: "#f0c200", label: "Aurea yellow"},
    {color: "#e11d48", label: "Ruby"},
    {color: "#7c3aed", label: "Violet"},
  ]} />
```

### Starting value

defaultValue picks one when the page opens; without it, none is picked.

```tsx
<ColorSwatch name="start" label="Theme colour" defaultValue="#7c3aed" options={options} />
<ColorSwatch name="none" label="No colour yet" options={options} />
```

### Options with the value

Controlled: onChange is the browser's event, as in Radio — event.target.value is the colour.

```tsx
const [colour, setColour] = useState("#e11d48");

<ColorSwatch name="label-colour" label="Label colour" value={colour}
  onChange={(e) => setColour(e.target.value)} options={[
    {color: "#0485f7", label: "Ocean"},
    {color: "#16a34a", label: "Forest"},
    {color: "#f0c200", label: "Aurea yellow"},
    {color: "#e11d48", label: "Ruby"},
    {color: "#7c3aed", label: "Violet"},
  ]} />
```

### Another mark

indicator replaces the check on the chosen colour; it gets the ink that contrasts most.

```tsx
<ColorSwatch name="favourite" label="Favourite colour" defaultValue="#e11d48"
  indicator={<Icon name="heart" />} options={options} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `color` | `string` | — | REQUIRED without options. Any CSS colour: hex (#f0c200), a name, the CSS colour functions (rgb(), hsl(), oklch(), color()…) or var(--primary). Anything else (with ;, braces, quotes, a comment or url()) is not written into the style. |
| `size` | `"xs" \| "sm" \| "md" \| "lg" \| "xl"` | "md" | 16, 24, 32, 36, 40 — the reference library's scale. Round only (Victor's decision); the checkerboard shows only under a transparent colour. |
| `label` | `string` | color | The name a screen reader announces ("Aurea yellow"); without it, the colour value. With options, the name of the group ("Accent colour"), and REQUIRED. |
| `options` | `(string \| {color, label?})[]` | — | The picker variation (ADR-0069): the colours to pick from, as a colour string or {color, label?, disabled?}. Turns the swatch into a radio group; a disabled option cannot be chosen. |
| `name` | `string` | — | With options, REQUIRED: the group's name in a form, and what makes the swatches one group (the arrows move between them). |
| `value` | `string` | — | With options: the chosen colour, controlled. |
| `defaultValue` | `string` | — | With options: the colour chosen at the start. |
| `onChange` | `ChangeEventHandler<HTMLInputElement>` | — | With options: the browser's event, as in Radio — event.target.value is the chosen colour. |
| `layout` | `"grid" \| "stack"` | "grid" | With options: in a wrapping row (grid) or in a column (stack), as in the reference. |
| `indicator` | `ReactNode` | the check | With options: the mark of the chosen colour, in place of the check (an Icon, for example). It takes the ink that contrasts most. |
| `showLabels` | `boolean` | false | With options: each colour's name under it (its label, or the colour value), like the reference's theme picker. The whole item picks; the name is only for the eyes — the radio already has it. |
| `disabled` | `boolean` | false | With options: no colour can be chosen. |
| `id` | `string` | — | With options: the id of the group. |
| `className` | `string` | — | Added to the swatch. |
