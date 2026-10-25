# Combobox

Combobox is a Select you can type into: the list filters as you write, and the value is still one option out of the set. It runs on Base UI, so the keyboard contract — arrows, Enter, Escape, type-ahead — is the APG one and not our improvisation. If the user never needs to type, a Select is lighter and works everywhere.

## Usage

```tsx
import {Combobox} from "@aurea-uds/react";
```

```tsx
<Combobox size="sm" aria-label="Small" placeholder="Small" items={items} />
<Combobox aria-label="Medium" placeholder="Medium (default)" items={items} />
<Combobox size="lg" aria-label="Large" placeholder="Large" items={items} />
```

- Base UI underneath: arrows move, Enter picks, Escape closes, and focus returns where it came from.

- Options are DATA ({value, label}) — no children to keep in sync with the filter.

- Typing filters the list; the value is still one option, never free text.

- An empty result says so in words, from the i18n dictionary.

- disabled goes on the whole control: field and both buttons, never one without the other.

- The list opens in a portal, above the page: type or press the arrow in the previews to open it.

## Examples

### Single choice

One option out of many, with the list filtering as you type.

```tsx
const [value, setValue] = useState<ComboboxOption | null>(null);

<Combobox label="Component" placeholder="Search…" value={value}
  onValueChange={setValue}
  items={[{value: "button", label: "Button"}, {value: "badge", label: "Badge"}]} />
```

### Inside a Field

The Field names the question; the Combobox holds the answer.

```tsx
<Field label="Assignee" hint="Who picks this up">
  <Combobox items={people} value={who} onValueChange={setWho} />
</Field>
```

### Disabled

The field and both buttons go down together — a locked field that still opens is not locked.

```tsx
<Combobox label="Component" placeholder="Search…" items={items} disabled />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `ComboboxOption[] \| ComboboxOptGroup[]` | — | The options, as data: {value, label} — or groups of them, {label, items}. Grouping is the engine's own shape: the same `items` prop takes either, and the kind is read from the first element. Do not mix flat with grouped. |
| `value` | `ComboboxOption \| null` | — | The selected option, or null. |
| `onValueChange` | `(v) => void` | — | Fires with the chosen option. |
| `placeholder` | `string` | — | Shown while nothing is selected. |
| `label` | `string` | — | Accessible name of the field. |
| `disabled` | `boolean` | false | Turns off the field and both buttons at once. |
| `empty` | `ReactNode` | "No results" | What the list shows when nothing matches. A fixed string cannot say 'no fruit by that name', and the engine always allowed the content to be written. |
| `size` | `Responsive<'sm' \| 'md' \| 'lg'>` | md | The system's size step, not the HTML character count — it paints the inner input with the same .input-sm/.input-lg skin as the rest of the field family. Responsive: it resolves in the CSS layer, so it costs no observer. |
| `id` | `string` | — | Id of the INPUT, not of the container — it is what a <label htmlFor> has to point at. Without it one is generated. |
| `className` | `string` | — | Merged onto the field wrapper, not onto the input. |
| `aria-describedby` | `string` | — | Goes to the input, which is the focusable node. It is spelled out because this component unpacks a fixed list of props and silently drops anything else — that is what kept Field from reaching the input (AUD-0001). |
| `aria-invalid` | `boolean \| "true" \| "false"` | — | Same route and same reason as aria-describedby: the input carries it, the wrapper would not announce it. |
| `aria-label` | `string` | — | Accessible name when there is no visible label — a filter in a grid without labels. With `label`, prefer `label`. |
