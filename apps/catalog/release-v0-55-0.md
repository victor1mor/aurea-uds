# v0.55.0

A split button that keeps its round end with the menu open, and menu items with a description and an end icon.

New options on the web menu, and a fix to `ButtonGroup`. Nothing changes unless you use the new options.

## New

- **`DropdownMenu align`** — `"start"`, `"center"` (the default) or `"end"`: how the menu lines up with its trigger. `"end"` puts the menu's edge on the trigger's edge, as on a split button.
- **`description` and `trailingIcon` on menu items** — a line under the label in the small muted text, and an icon at the end of the item (`arrow-square-out` says a link opens another site). Screen readers hear the label as the item's name and the description separately.

## Fixed

- **`ButtonGroup`** — the first and last *buttons* get the round ends. With a menu open inside the group, its focus markers no longer flatten the end of a split button or hide the divider. `ToggleGroup` too.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.55.0 @aurea-uds/core@0.55.0 @aurea-uds/fonts@0.55.0 @aurea-uds/icons@0.55.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.55.0
```
