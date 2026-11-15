# v0.70.0

A vertical Stepper, reading modes on native, a panel that keeps its corners under the top bar, and a set of measurement fixes.

## Added

- **`orientation` on `Stepper`** — `"horizontal"` (the default) or `"vertical"`, on the web and on native. Vertical puts one step under the other for a narrow column: the dot on the start side, the label beside it, and the line running down between the dots, yellow up to the current step. Only with `variant="default"`.
- **Reading modes on the native `AureaProvider`** — `highContrast` and `textSize` (`"md"` or `"lg"`), the same modes the web `AppShell` has. High contrast adds darker supporting text, an outline on cards and buttons, and always-underlined links on top of what the system's increase-contrast setting does. Large text raises every type step from `xs` to `2xl` by 2. A nested provider without them keeps the outer ones.
- **Native `Input` and `Field` closer to the web** — `variant` on `Input` and `Textarea` (`"secondary"`, the grey field), `required` on `Field` (the asterisk after the label), `invalid` on `Input` itself, and the text selection colour.

## Changed

- **`AppShell`**: with the flush top bar, the panel no longer gets cut in a straight line under the bar when the page scrolls; its rounded corners always show. A `DataGrid` with `stickyHeader="page"` now stops below that gap.
- **Native `Card` with `accent`**: the top stroke follows the curve of the corner and thins out, as on the web.
- **`Prose`**: a wide table scrolls inside itself instead of widening the page.
- **`SearchField`, `InputGroup` and `ColorField`** are now the same height as an `Input` next to them, in all three sizes.
- **`Toolbar`**: the separator is half the button height, centred, with only the toolbar gap around it.
- **`ListBox`**: the item corner matches the menu item (18), also on two-line items.
- **`Tabs variant="secondary"`**: a light line under the whole row, which now fills the line (the tabs stay at the start), on the web and on native. **`ListBox`**, and through it `Select` and `Combobox`: a light line between groups.
- **`Select`, `Combobox` and the menus** (`DropdownMenu`, `ContextMenu`, `Menubar`): the mark of the chosen item moves to the end of the row and turns grey, as in `ListBox`, on the web and on native.
- **`BottomNav`**: an item that is a link keeps its colour on hover. **`NumberField`**: the read-only +/− buttons no longer light up.
- Each theme now declares its `color-scheme`, so the browser's own scrollbars and controls follow the theme.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.70.0 @aurea-uds/core@0.70.0 @aurea-uds/fonts@0.70.0 @aurea-uds/icons@0.70.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.70.0
```
