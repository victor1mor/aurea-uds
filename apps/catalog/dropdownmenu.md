# DropdownMenu

Menu of actions triggered by a control.

## Usage

```tsx
import {DropdownMenu} from "@aurea-uds/react";
```

```tsx
<DropdownMenu
  label="Record actions"
  trigger={<Button variant="outline" trailingIcon="caret-down">Actions</Button>}
  items={[
    {label: "Duplicate", leadingIcon: "copy"},
    {label: "Rename", leadingIcon: "pencil-simple"},
    "separator",
    {label: "Delete", leadingIcon: "trash"},
  ]}
/>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `trigger` | `ReactElement` | — | The element that opens the menu. Usually a Button or an IconButton. |
| `items` | `Array<MenuItemDef \| "separator">` | — | The menu, as data: {label, onClick?, disabled?, leadingIcon?}. The literal string "separator" draws a rule — a separator is not an item, so it never takes focus. |
| `side` | `top \| right \| bottom \| left` | bottom | Preferred side; it flips when there is no room. |
| `label` | `string` | — | Accessible name of the menu itself. Worth setting when a page has more than one — otherwise a screen reader lists several menus with nothing to tell them apart. |
