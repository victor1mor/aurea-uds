# v0.12.2

The BottomNav is shorter on the web and in React Native, with the icon closer to its label.

A layout change to the [`BottomNav`](./bottomnav.html), on the web and in React Native. No API changes.

## Changed

- **Shorter `BottomNav`**: outside the round indicators, the icon frame now has the icon's own height, and the gap to the label drops to `--space-05`. The bar goes from 75 to 65 tall, and the icon sits 3 points from the label.
- **Round indicators** (`circle`, `circle-raised`, `circle-outline`, `circle-bold`) keep the 32-point frame, because it becomes the circle.
- The frame stays 32 wide (it anchors the counter), and the touch area keeps a minimum height of `--control-h-lg`.
- On the web, the bar without an indicator class (plain HTML) shrinks too.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.12.2 @aurea-uds/core@0.12.2 @aurea-uds/fonts@0.12.2 @aurea-uds/icons@0.12.2
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.12.2
```
