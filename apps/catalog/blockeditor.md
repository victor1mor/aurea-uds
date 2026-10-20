# BlockEditor

The frame around content blocks — order, handle, removal, and the slot where your own editor goes. Aurea does not own the rich text.

## Usage

```tsx
import {BlockEditor} from "@aurea-uds/react";
```

```tsx
const [blocks, setBlocks] = useState([
  {id: "t", kind: "Heading", children: <h2>The joke tax</h2>},
  {id: "p", kind: "Text", children: <Textarea aria-label="Paragraph" defaultValue="…" />},
  {id: "i", kind: "Image", children: (
    <figure><Image src={photo} alt="The king" ratio="16/9" /><figcaption>The king</figcaption></figure>
  )},
]);

<BlockEditor
  label="Article"
  blocks={blocks}
  onReorder={(from, to) => setBlocks(prev => {
    const next = [...prev];
    next.splice(to, 0, ...next.splice(from, 1));
    return next;
  })}
  onRemove={i => setBlocks(prev => prev.filter((_, n) => n !== i))}
/>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `blocks` | `Array<{id, kind?, children}>` | — | The blocks, in the order they are shown. `children` is your block — a textarea, your rich text editor, a figure with a caption. `kind` names it for a screen reader ("Image", "Quote"); it falls back to a generic "Block". |
| `onReorder` | `(from: number, to: number) => void` | — | Called with the two indexes. The editor is controlled and keeps no order of its own — the keyboard path and the pointer path call this same callback, so there are never two sources of truth. |
| `onRemove` | `(index: number) => void` | — | Optional. Omit it and no remove button is rendered — a button that cannot do anything is a focus target that lies to whoever uses the keyboard, which is the defect the Gallery measured in item L2. |
| `label` | `string` | Content blocks | Accessible name of the list. |
