# SortableList

Reorder by dragging — and by keyboard, which is the reason it may exist at all.

## Usage

```tsx
import {SortableList} from "@aurea-uds/react";
```

```tsx
const [items, setItems] = useState([
  {id: "a", label: "Draft"},
  {id: "b", label: "In review"},
  {id: "c", label: "Published"},
]);

<SortableList
  label="Pipeline stages"
  items={items}
  onReorder={(from, to) => setItems(prev => {
    const next = [...prev];
    next.splice(to, 0, ...next.splice(from, 1));
    return next;
  })}
/>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `Array<{id, label}>` | — | The rows, in the order they are shown. Data and not children, the same idiom as Timeline, Stepper and Sidebar. |
| `onReorder` | `(from: number, to: number) => void` | — | Called with the two indexes. The list is controlled and keeps no order of its own — the keyboard path and the pointer path call this same callback, so there are never two sources of truth about the order. |
| `label` | `string` | Sortable list | Accessible name of the list. |
