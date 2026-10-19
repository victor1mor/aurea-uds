# Menubar

The application menu row — File, Edit, View — where an open menu hands over to its neighbour.

## Usage

```tsx
import {Menubar} from "@aurea-uds/react";
```

```tsx
<Menubar label="Main" menus={[
  {label: "File", items: [{label: "New"}, {label: "Open"}, "separator", {label: "Quit"}]},
  {label: "Edit", items: [{label: "Undo"}, {label: "Redo"}]},
  {label: "View", items: [{label: "Zoom in"}, {label: "Zoom out"}]},
]} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `menus` | `Array<{ label: ReactNode; items: MenuEntry[]; disabled?: boolean; }>` | — | The bar, as data: one entry per top-level menu, each with its own MenuEntry list. Passing them together is what lets an open menu hand over to its neighbour on the arrow key. |
| `label` | `string` | — | Accessible name of the bar. |
| `orientation` | `Responsive<MenubarOrientation>` | horizontal | A vertical menubar is the side-panel shape. Responsive. |
| `loopFocus` | `boolean` | true | The arrow wraps from the last menu back to the first. |
| `modal` | `boolean` | true | While a menu is open the rest of the page is inert. Turn it off for a bar that stays usable with a menu down. |
| `disabled` | `boolean` | false | Turns the whole bar off. |
| `className` | `string` | — | Merged onto the outermost element, after the Aurea skin — your class wins on a tie. |
