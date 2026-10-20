# useReorder

The accessible drag-and-drop reordering protocol, shared by SortableList and BlockEditor.

## Usage

```tsx
import {useReorder} from "@aurea-uds/react";
```

```tsx
const {itens, aoSoltar, propsDoItem} = useReorder(lista, setLista);

// Reordenar sem ponteiro: pegar (Space), mover (setas), soltar (Space),
// cancelar (Escape) — e cada passo é anunciado por live region.
<ul>{itens.map((it, i) => <li key={it.id} {...propsDoItem(i)}>{it.label}</li>)}</ul>
```
