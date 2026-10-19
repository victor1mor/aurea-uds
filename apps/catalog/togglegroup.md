# ToggleGroup

Several toggles sharing one state, with arrow-key navigation between them.

## Usage

```tsx
import {ToggleGroup} from "@aurea-uds/react";
```

```tsx
<ToggleGroup label="Text style" multiple defaultValue={["bold"]}>
  <Toggle value="bold">Bold</Toggle>
  <Toggle value="italic">Italic</Toggle>
  <Toggle value="underline">Underline</Toggle>
</ToggleGroup>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `React.ReactNode` | — | The Toggles that share the state. |
| `value` | `string[]` | — | Controlled selection. An array even in single mode, which is the engine's shape. |
| `defaultValue` | `string[]` | — | Seeds the selection without controlling it. |
| `onValueChange` | `(value: string[]) => void` | — | Fires with the new selection. |
| `multiple` | `boolean` | false | More than one toggle pressed at a time. |
| `orientation` | `Responsive<Orientation>` | horizontal | Stacks the toggles, and the arrow keys follow the axis. Responsive. |
| `label` | `string` | — | Accessible name of the group. Without it the group is a set of buttons with no subject. |
| `disabled` | `boolean` | false | Turns every toggle off at once. |
| `className` | `string` | — | Merged onto the outermost element, after the Aurea skin — your class wins on a tie. |
| `size` | `sm \| md \| lg` | — | The size of every toggle inside; a toggle may set its own. |
| `fullWidth` | `boolean` | false | Fills the parent's width, and the toggles share it equally. |
| `detached` | `boolean` | false | Loose toggles with a 4 gap, instead of joined in one capsule. |
