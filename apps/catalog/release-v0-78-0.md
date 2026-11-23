# v0.78.0

Tooltip is inverted and opens and closes after 0.1 s; a Sidebar item darkens while pressed.

## Changed

- **`Tooltip` is inverted.** The text color becomes the background and the page color becomes the text: dark on a light page, light on a dark one. The arrow takes the same color. This includes the tooltips of a collapsed `Sidebar`. The `Chart` hover card does not change.
- **`Tooltip` waits 0.1 s to open and 0.1 s to close.** These are the new defaults of `delay` and `closeDelay` (they were 1.5 s and 0.5 s). From the keyboard it still opens at once. If you pass `delay` or `closeDelay`, nothing changes for you.
- **A `Sidebar` item darkens while pressed**, with the mouse, touch or a pen: its background becomes a little darker than on hover. On touch screens, where there is no hover, this is how the item shows it responded. The current item and a disabled item do not change.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.78.0 @aurea-uds/core@0.78.0 @aurea-uds/fonts@0.78.0 @aurea-uds/icons@0.78.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.78.0
```
