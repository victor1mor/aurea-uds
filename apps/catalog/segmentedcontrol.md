# SegmentedControl

SegmentedControl is one-of-many, always visible: two to five options in a track, the chosen one raised. It carries one value and one tab stop. Past five options this becomes a Select — a track that wraps to a second line stops being a segmented control.

## Usage

```tsx
import {SegmentedControl} from "@aurea-uds/react";
```

```tsx
<SegmentedControl label="View" value={view} onChange={setView}
  items={[{value: "list", label: "List"}, {value: "board", label: "Board"}]} />
```

- One value, controlled by design: one-of-many always has an owner.

- Two to five options. More than that is a Select; many-of-many is a ButtonGroup of toggles.

- The selected option shows the system's selected language — raised capsule, brand label, yellow bar.

- The track keeps the pill; the options never fuse into a single bar.

- Switches the VIEW of the same data, never its meaning — that would be a filter.

## Examples

### Time range

Three spans over the same chart — the classic dashboard header.

```tsx
<SegmentedControl label="Range" value="7d" onChange={setRange}
  items={[{value: "24h", label: "24h"}, {value: "7d", label: "7 days"}, {value: "30d", label: "30 days"}]} />
```

### The ceiling

Five is the limit. At this width it already asks to become a Select — which is the signal to switch.

```tsx
// five options: still a track. six: use Select.
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `Array<{value, label}>` | — | The options. Two to five: past that it is a Select, not a segmented control. |
| `value` | `string` | — | The selected value. Controlled by design — one of many always has an owner. |
| `onChange` | `(v: string) => void` | — | Fires with the new value. |
| `label` | `string` | — | Accessible name of the set. |
| `fullWidth` | `boolean` | false | Fills the row: each segment grows from its own label and never shrinks below it, so no label wraps. When the options do not fit, the control scrolls, as without the prop. The name the reference library gives this prop on its toggle-button group; the same prop on native. |
