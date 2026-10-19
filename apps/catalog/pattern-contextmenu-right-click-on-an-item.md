# Right-click on an item

The menu the mouse expects on an item, and the keyboard reaches with Shift+F10. It never replaces a visible control: everything here has another way in.

## Usage

```tsx
import {ContextMenu, Card} from "@aurea-uds/react";
```

```tsx
<ContextMenu label="Item actions" items={[
  {label: "Rename", leadingIcon: "pencil-simple"},
  {label: "Move to…", leadingIcon: "folder"},
  "separator",
  {label: "Delete", leadingIcon: "trash"},
]}>
  <Card>Right-click this card, or focus it and press Shift+F10.</Card>
</ContextMenu>
```
