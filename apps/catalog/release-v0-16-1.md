# v0.16.1

Fixes the BottomNav circle-bold indicator, which collapsed into a thin line in the browser and cut the label on the compact bar.

A small fix for the [`BottomNav`](./bottomnav.html) `circle-bold` indicator, on the web and in React Native. No API changes.

## Fixed

- **React Native in the browser**: the yellow circle of the selected `circle-bold` item shrank to about 8 points wide, with the icon squeezed inside. The selected item now spells out `flexGrow: 0`, `flexShrink: 0` and `flexBasis: "auto"` instead of `flex: 0`, so it measures 56 on devices and in the browser alike.
- **Web and React Native, compact bar (`width="content"`)**: the label inside the selected circle was truncated, because the item added extra side padding inside the 56-point circle. The selected `circle-bold` item now keeps its regular padding, so short labels fit.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.16.1 @aurea-uds/core@0.16.1 @aurea-uds/fonts@0.16.1 @aurea-uds/icons@0.16.1
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.16.1
```
