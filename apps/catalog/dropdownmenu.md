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

## Examples

### Sides

Which side of the trigger it opens on. When there is no room on that side, it flips to the opposite one.

```tsx
<DropdownMenu label="Side top" side="top" trigger={<Button variant="outline">Side top</Button>} items={[{label: "Duplicate"}, {label: "Rename"}]} />
<DropdownMenu label="Side right" side="right" trigger={<Button variant="outline">Side right</Button>} items={[{label: "Duplicate"}, {label: "Rename"}]} />
<DropdownMenu label="Side bottom" side="bottom" trigger={<Button variant="outline">Side bottom</Button>} items={[{label: "Duplicate"}, {label: "Rename"}]} />
<DropdownMenu label="Side left" side="left" trigger={<Button variant="outline">Side left</Button>} items={[{label: "Duplicate"}, {label: "Rename"}]} />
```

### Alignment

How the menu lines up with the trigger. end puts the menu's edge on the trigger's edge — the split button of a page's actions opens this way.

```tsx
<DropdownMenu label="Align start" align="start" trigger={<Button variant="outline">Align start</Button>} items={[{label: "Duplicate"}, {label: "Rename"}]} />
<DropdownMenu label="Align center" align="center" trigger={<Button variant="outline">Align center</Button>} items={[{label: "Duplicate"}, {label: "Rename"}]} />
<DropdownMenu label="Align end" align="end" trigger={<Button variant="outline">Align end</Button>} items={[{label: "Duplicate"}, {label: "Rename"}]} />
```

### Descriptions and an end icon

description puts a line under the label, in the small muted text; trailingIcon sits at the end — arrow-square-out says a link opens another site.

```tsx
<DropdownMenu
  label="Page actions"
  align="end"
  trigger={<IconButton icon="caret-down" label="More page actions" />}
  items={[
    {kind: "link", label: "View as Markdown", description: "View page as Markdown format", leadingIcon: "file-text", href: "/page.md"},
    {kind: "link", label: "Open in a chat", description: "Ask questions about this page", leadingIcon: "chat-circle",
      trailingIcon: "arrow-square-out", href: "https://example.com", target: "_blank", rel: "noreferrer"},
  ]}
/>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `trigger` | `ReactElement` | — | The element that opens the menu. Usually a Button or an IconButton. |
| `items` | `Array<MenuItemDef \| "separator">` | — | The menu, as data: {label, onClick?, disabled?, leadingIcon?, description?, trailingIcon?}. The literal string "separator" draws a rule — a separator is not an item, so it never takes focus. description is a line under the label, in the small muted text; trailingIcon sits at the end of the item (for example, arrow-square-out on a link that opens another site). |
| `side` | `top \| right \| bottom \| left` | bottom | Preferred side; it flips when there is no room. |
| `align` | `start \| center \| end` | center | How the menu lines up with the trigger along that side. end puts the menu's edge on the trigger's edge, as on a split button. |
| `label` | `string` | — | Accessible name of the menu itself. Worth setting when a page has more than one — otherwise a screen reader lists several menus with nothing to tell them apart. |
