# Tabs

Tabs switch between views of the same thing. The arrows move between tabs, and the panel follows. Two looks, like the reference's: the capsule track, and the secondary tabs with a line under them.

## Usage

```tsx
import {Tabs} from "@aurea-uds/react";
```

```tsx
<Tabs label="Report" value={tab} onChange={setTab} tabs={tabs} />
```

- The track has 4 of padding; each tab is 32 high, 16 on each side, medium weight.

- The chosen tab is the raised capsule; in the secondary look, the Aurea selected line.

- orientation="vertical" stacks the tabs beside the panel; panel="plain" removes the box.

- activateOnFocus switches as the arrow moves; turn it off when a panel costs a network call.

## Examples

### Secondary

No track: a line under the list, and the chosen tab marked by the selected line.

```tsx
<Tabs variant="secondary" label="Report" value={tab} onChange={setTab} tabs={tabs} panel="plain" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `tabs` | `Array<{id: string; label: ReactNode; content: ReactNode}>` | — | Tab and panel together, because they are one thing: a tab with no panel is a button. |
| `value` | `string` | — | The id of the open tab. Controlled. |
| `onChange` | `(id: string) => void` | — | Fires on click and on arrow keys. |
| `label` | `string` | "Tabs" | Accessible name of the tab list. |
| `orientation` | `Responsive<'horizontal' \| 'vertical'>` | horizontal | Resolved at runtime and handed to the engine, which publishes data-orientation/aria-orientation and adapts the arrow keys. |
| `activateOnFocus` | `boolean` | true | Automatic activation: the arrow switches the panel along with focus. Set false for the APG's manual pattern — the arrow moves focus and Enter/Space activates. Use false when switching a tab is expensive. |
| `loopFocus` | `boolean` | true | Whether the arrow wraps from the last tab back to the first. |
| `panel` | `'card' \| 'plain'` | card | The panel. `card` is an inset card. `plain` drops the box, like the reference library's panel: the content starts on the same line as what is outside the Tabs, with only the space-3 gap above it. Use it when the content already has a frame (Table, DataGrid, a list of cards), which would otherwise be a box inside a box. The same prop on native. |
| `variant` | `primary \| secondary` | primary | secondary is the reference's secondary tabs: no track, a hairline under the list, the chosen tab marked by the Aurea selected line. |
