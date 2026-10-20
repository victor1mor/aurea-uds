# ContextMenu

Actions menu opened by right-click or long-press.

## Usage

```tsx
import {ContextMenu} from "@aurea-uds/react";
```

```tsx
<ContextMenu label="Row actions" items={[
  {label: "Rename", leadingIcon: "pencil-simple"},
  "separator",
  {label: "Delete", leadingIcon: "trash"},
]}>
  <Card>Right-click me, or focus and press Shift+F10.</Card>
</ContextMenu>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | The region that answers the right button. It is rendered focusable (tabIndex 0) on purpose: the keyboard route into a context menu is Shift+F10 or the Menu key, and the browser only fires those over a FOCUSED element. Without that, the menu is mouse-only. |
| `items` | `Array<MenuItemDef \| "separator">` | — | The menu, as data: {label, onClick?, disabled?, leadingIcon?}. The literal string "separator" draws a rule — a separator is not an item, so it never takes focus. |
| `label` | `string` | — | Names both the trigger region and the menu. A right-click target with no name is announced as nothing at all. |
| `className` | `string` | — | Goes on the trigger region, which is the element you can see. |
