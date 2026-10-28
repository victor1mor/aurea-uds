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

### Sizes

sm is the low capsule — the switch at the end of this site's areas row; md, the default, is the control height.

```tsx
<SegmentedControl size="sm" label="View" value={view} onChange={setView} items={views} />
<SegmentedControl size="md" label="View" value={view} onChange={setView} items={views} />
```

### As navigation

With href on every item it is a <nav> of links: going to another page is navigation, and the current one is marked with aria-current="page" — the Web | Native switch at the top of this site.

```tsx
<SegmentedControl size="sm" label="Platform" value="web" items={[
  {value: "web", label: "Web", href: "/button.html"},
  {value: "native", label: "Native", href: "/native-button.html"},
]} />
```

### The colour of the selected segment

selectedStyle (ADR-0084): current — the raised capsule with the yellow line, the default — neutral, contrast (graphite), brand (yellow), ring (a yellow ring) and dot (a yellow dot before the label; its place is kept in every segment, so the width does not jump).

```tsx
<SegmentedControl selectedStyle="current" label="View" value={view} onChange={setView} items={views} />
<SegmentedControl selectedStyle="neutral" label="View" value={view} onChange={setView} items={views} />
<SegmentedControl selectedStyle="contrast" label="View" value={view} onChange={setView} items={views} />
<SegmentedControl selectedStyle="brand" label="View" value={view} onChange={setView} items={views} />
<SegmentedControl selectedStyle="ring" label="View" value={view} onChange={setView} items={views} />
<SegmentedControl selectedStyle="dot" label="View" value={view} onChange={setView} items={views} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `Array<{value, label, href?}>` | — | The options. Two to five: past that it is a Select, not a segmented control. With href on EVERY item, the control is a <nav> of links — the current one gets aria-current="page" — instead of a choice: going to another page is navigation, and a screen reader hears "link", not "option". It is the Web \| Native switch of this site. |
| `value` | `string` | — | The selected value. Controlled by design — one of many always has an owner. |
| `onChange` | `(v: string) => void` | — | Fires with the new value. Not needed when the items are links (href). |
| `label` | `string` | — | Accessible name of the set. |
| `fullWidth` | `boolean` | false | Fills the row: each segment grows from its own label and never shrinks below it, so no label wraps. When the options do not fit, the control scrolls, as without the prop. The name the reference library gives this prop on its toggle-button group; the same prop on native. |
| `size` | `"sm" \| "md"` | md | sm is the low capsule of the reference's documentation switch: 24 tabs, 14 text. |
| `selectedStyle` | `"current" \| "neutral" \| "contrast" \| "brand" \| "ring" \| "dot"` | "current" | The colour of the selected segment (ADR-0084): current — the raised capsule with the yellow line, the default (on React Native, the yellow capsule) — neutral (the raised capsule, no line), contrast (graphite), brand (yellow), ring (the neutral capsule with a yellow ring) or dot (the neutral capsule with a yellow dot before the label; the dot's place is kept in every segment so the width does not jump). Written as data-segment-style; the same attribute on a container, or on <html>, sets it for every segmented control inside. Web and React Native. |
