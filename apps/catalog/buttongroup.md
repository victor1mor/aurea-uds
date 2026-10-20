# ButtonGroup

ButtonGroup binds buttons of the same kind into one coordinated set. It groups visually and semantically — every button stays tabbable, which is exactly what separates it from a Toolbar. Pick by the keyboard behaviour you want, never by how it looks.

## Usage

```tsx
import {ButtonGroup, Button} from "@aurea-uds/react";
```

```tsx
<ButtonGroup label="Range">
  <Button>Day</Button>
  <Button>Week</Button>
  <Button>Month</Button>
</ButtonGroup>
```

- role="group" with an accessible name: a set with no name is a pile of buttons to a screen reader.

- Every button keeps its own tab stop. For arrow-key navigation with a single tab stop use Toolbar.

- Joined into one capsule: no gap, rounded only at the ends, a hairline between buttons. `detached` keeps them as loose pills with a small gap.

- variant, size and disabled set on the group reach every button; a button may still set its own.

- fullWidth stretches the group and shares the width equally.

- Selection: one-of-many is SegmentedControl; many-of-many is ToggleGroup.

- Disabling one item does not disable the set, and the disabled item keeps its place.

## Examples

### With leading icons

The glyph repeats the verb of each button; the group still reads as one unit.

```tsx
<ButtonGroup label="Export">
  <Button leadingIcon="download">Download</Button>
  <Button leadingIcon="share">Share</Button>
  <Button leadingIcon="link-simple">Copy link</Button>
</ButtonGroup>
```

### Variant and size from the group

Set once on the group; every button follows. Here the outline look in the small size.

```tsx
<ButtonGroup label="Zoom" variant="outline" size="sm">
  <Button leadingIcon="minus">Out</Button>
  <Button>100%</Button>
  <Button leadingIcon="plus">In</Button>
</ButtonGroup>
```

### Detached

Loose pills with a small gap, for buttons that belong together but are not one control.

```tsx
<ButtonGroup label="Actions" detached>
  <Button>Duplicate</Button>
  <Button>Move</Button>
  <Button>Archive</Button>
</ButtonGroup>
```

### Single selection

The same job with the right component: SegmentedControl carries one value and one tab stop.

```tsx
<SegmentedControl label="View" value="board" onChange={setView}
  items={[{value: "list", label: "List"}, {value: "board", label: "Board"}]} />
```

### Disabled item

One unavailable option does not disable the set, and it keeps its place so the row never shifts.

```tsx
<ButtonGroup label="Plan">
  <Button>Monthly</Button>
  <Button>Yearly</Button>
  <Button disabled>Lifetime</Button>
</ButtonGroup>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | Options | Accessible name of the group. Falls back to the i18n string, but a real name beats a generic one. |
| `children` | `ReactNode` | — | Buttons of the same kind. Mixing controls here breaks the promise of a group. |
| `className` | `string` | — | Extra classes on the wrapper. |
| `orientation` | `Responsive<Orientation>` | horizontal | Stacks the buttons instead of lining them up. Visual only — it changes no order, no semantics and no keyboard — so it resolves in the CSS layer and costs no observer. |
| `variant` | `ButtonVariant \| danger-soft` | — | The look of every button inside; a button may set its own. |
| `size` | `xs \| sm \| md \| lg \| xl` | — | The size of every button inside; a button may set its own. Accepts a responsive value. |
| `fullWidth` | `boolean` | false | Fills the parent's width, and the buttons share it equally. |
| `disabled` | `boolean` | false | Disables every button inside. |
| `detached` | `boolean` | false | Loose capsules with a 4 gap that wrap, instead of joined. |
