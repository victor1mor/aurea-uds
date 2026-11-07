# v0.61.0

Breakpoints follow the browser font size, more selected items in Windows high contrast, and Header passes item clicks.

## Changed

- **Breakpoints follow the font size.** Every screen breakpoint is now in `em`, in the CSS and in the JavaScript that asks about the screen (`AppShell`, responsive props and the drawer script `aurea.js`). People who enlarge the browser's default font — instead of zooming — get the same layout zoom gives them: with the font doubled, a 1280px screen behaves like a 640px one. At the default font size nothing changes. Container queries stay in px.
- **Windows high contrast:** the pressed button (`Toggle`, `ToggleGroup`, `Button pressed`), the selected tag in `TagGroup`, the selected `ListBox` item, the selected day in `Calendar` and `DatePicker`, and the selected `Table`/`DataGrid` row use the system highlight colour, like the segment and the tab in v0.60.0. The `Carousel` dots no longer disappear: they use the system text colour, and the current one the highlight. Web only.
- **`Header`** calls the item's `onClick`, like `Sidebar` does with the same item type.

## Includes v0.60.0

- **Windows high contrast** — the selected segment of `SegmentedControl` and the selected tab of `Tabs` use the system highlight colour; the `Badge` status dot no longer disappears.
- **Right-to-left pages** — `CodeBlock` keeps the code left-to-right, with the line numbers before it.

## Includes v0.59.1

- The `CodeEditor` focus ring follows `--focus-width`, like every other component.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.61.0 @aurea-uds/core@0.61.0 @aurea-uds/fonts@0.61.0 @aurea-uds/icons@0.61.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.61.0
```
