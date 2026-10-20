# TagGroup

TagGroup is a wrapping row of tags under one label. None, one or several can be selected, and each can be removed. The group is one Tab stop; the arrows move between the tags.

## Usage

```tsx
import {TagGroup} from "@aurea-uds/react";
```

```tsx
<TagGroup label="Topics" selectionMode="multiple" defaultSelectedKeys={["travel"]}
  items={[{id: "news", label: "News"}, {id: "travel", label: "Travel"},
    {id: "gaming", label: "Gaming"}, {id: "shopping", label: "Shopping"}]} />
```

- selectionMode none, single or multiple; the selected tag is in the light yellow wash.

- onRemove adds the X; Delete or Backspace remove the active tag, and the focus moves to the next.

- One Tab stop for the group; arrows, Home and End move between the tags.

- description and errorMessage under the tags, read with the group.

- Three sizes — 20, 24 and 32 high — and a variant for grey surfaces.

## Examples

### Removable

The X removes; so does Delete on the active tag.

```tsx
<TagGroup label="Filters" items={filters} onRemove={(ids) => setFilters(f => f.filter(x => !ids.includes(x.id)))}
  description="Remove a filter to widen the search" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `ReactNode` | — | REQUIRED. The group's name. labelHidden keeps it for screen readers only. |
| `labelHidden` | `boolean` | false | Hides the label from the screen, not from screen readers. |
| `items` | `TagItem[]` | — | REQUIRED. {id, label, textValue?, icon?, disabled?}. |
| `selectionMode` | `"none" \| "single" \| "multiple"` | "none" | none: a list. single/multiple: each tag toggles (aria-pressed); the selected one is in the light yellow wash. |
| `selectedKeys / defaultSelectedKeys` | `string[]` | — | The selected ids, controlled or not. |
| `onSelectionChange` | `(keys: string[]) => void` | — | Called with the new list. |
| `onRemove` | `(ids: string[]) => void` | — | With it each tag gets the X, and Delete/Backspace remove the active one; the focus goes to the neighbour. |
| `description` | `ReactNode` | — | Help under the tags, in aria-describedby. |
| `errorMessage` | `ReactNode` | — | The error under the tags, in aria-describedby. |
| `size` | `"sm" \| "md" \| "lg"` | "md" | 20, 24, 32 high — the reference library's tag. |
| `variant` | `"default" \| "surface"` | "default" | The neutral fill, or the card fill (for a tag on a grey surface). |
| `className` | `string` | — | Added to the group. |
| `id` | `string` | — | The group's id. |
