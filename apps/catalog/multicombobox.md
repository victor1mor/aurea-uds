# MultiCombobox

MultiCombobox is the many-of-many Combobox: the picked options stay as chips inside the field, and typing filters what is left. It takes flat options or groups, and it accepts a remote search — you filter on your side, the component only shows and announces the result.

## Usage

```tsx
import {MultiCombobox} from "@aurea-uds/react";
```

```tsx
const [tags, setTags] = useState([]);

<MultiCombobox label="Tags" placeholder="Add a tag…" value={tags}
  onValueChange={setTags}
  items={[{value: "a11y", label: "Accessibility"}, {value: "perf", label: "Performance"}]} />
```

- Selected options live as removable chips in the field, each with its own remove control.

- Flat items or grouped items ({label, items}) for a long, sectioned list.

- onInputChange plus loading: the search can be remote and the wait is announced, not silent.

- Base UI keyboard: arrows, Enter, Escape, and Backspace removing the last chip.

- disabled reaches the chips too: no removing what you cannot add.

- The previews show the CLOSED field; the popup lives in a portal and only exists in a real app.

## Examples

### Remote search

You own the query; the component shows the state of it.

```tsx
<MultiCombobox label="People" loading={isFetching}
  onInputChange={q => search(q)}
  items={results} value={picked} onValueChange={setPicked} />
```

### Grouped options

Sections with headings, for a list long enough to need them.

```tsx
const items = [
  {label: "Actions", items: [{value: "button", label: "Button"}]},
  {label: "Inputs", items: [{value: "input", label: "Input"}]},
];

<MultiCombobox label="Components" items={items} value={picked} onValueChange={setPicked} />
```

### Disabled

The chips stay readable, and nothing can be added or removed.

```tsx
<MultiCombobox label="Tags" items={tags} value={picked} disabled />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `ComboboxOption[] \| ComboboxOptGroup[]` | — | Flat options or groups with headings. |
| `value` | `ComboboxOption[]` | — | The selected options, as chips inside the field. |
| `onValueChange` | `(v) => void` | — | Fires with the new selection. |
| `onInputChange` | `(text: string) => void` | — | For a remote search: you filter, the component only shows. |
| `loading` | `boolean` | false | Announces "Loading…" while your search is in flight. |
| `label` | `string` | — | Accessible name of the field. |
| `disabled` | `boolean` | false | Turns off the field, the buttons and the chip removals at once. |
| `empty` | `ReactNode` | "No results" | What the list shows when nothing matches. `loading` still wins over it, so the list never flashes 'No results' while a query is in flight. |
| `placeholder` | `string` | — | Shown while nothing is selected. With chips in the field it only shows on an empty selection. |
| `id` | `string` | — | Id of the INPUT, not of the container — it is what a <label htmlFor> has to point at. Without it one is generated. |
| `className` | `string` | — | Merged onto the field wrapper, not onto the input. |
| `aria-describedby` | `string` | — | Goes to the input, which is the focusable node. It is spelled out because this component unpacks a fixed list of props and silently drops anything else — that is what kept Field from reaching the input (AUD-0001). |
| `aria-invalid` | `boolean \| "true" \| "false"` | — | Same route and same reason as aria-describedby: the input carries it, the wrapper would not announce it. |
| `aria-label` | `string` | — | Accessible name when there is no visible label — a filter in a grid without labels. With `label`, prefer `label`. |
