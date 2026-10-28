# v0.46.0

New styles for the pressed button, the selected segment, the timeline and the current item of the bottom bar — and a bottom bar of one height in every shape.

Four components gain a style prop, and every default stays as it was: nothing changes until you choose a style. The bottom bar is the one exception — it now has the same height in all nine shapes. Read "Look and feel" if you use the round or capsule indicators.

## Look and feel

- **The bottom bar has one height in every shape.** With `circle`, `circle-raised`, `circle-outline` and `capsule`, the circle and the capsule are 28 high instead of 32 and reach 2 past the item, above and below; with `circle-bold`, the disc no longer has a minimum height. Every bar is now as high as the `none` one.
- **On React Native, the timeline rail** uses the `input` colour, as on the web since 0.45.0.

## New

- **`pressedStyle`** on `Toggle`, `ToggleGroup`, `Toolbar` and `ToolbarButton`: `brand` (the default), `neutral` or `contrast`. Web only.
- **`selectedStyle`** on `SegmentedControl`: `current` (the default), `neutral`, `contrast`, `brand`, `ring` or `dot`. Web and React Native.
- **`variant`** on `Timeline`: `default`, `ring`, `latest`, `time` or `contrast`. Web and React Native.
- **`currentStyle`** on `BottomNav`, the colour of the current item (the `indicator` is its shape): `current` (the default), `neutral`, `contrast`, `brand`, `ring`, `plain`, `brand-white`, `white-ring`, `brand-gradient`, `bar-ink`, `bar-ring`, `bar-plain` or `bar-light`. Floating and edge bars alike. Web and React Native. `brand-white` fails WCAG (white on the yellow measures 1.91:1).
- **The same choice for a whole area:** `data-pressed-style`, `data-segment-style`, `data-timeline-style` or `data-current-style` on a container, or on `<html>`, sets the style for every component inside; a component's own prop wins.

## Changed

- **`brand-gradient` is the one gradient in a navigation component**, and the ring styles draw a ring — both only when you choose them. On React Native without gradients, `brand-gradient` is solid yellow.

## The `lory` brand

- **The new styles do not apply to it**; it keeps its colours. The bottom bar has the same height there too.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.46.0 @aurea-uds/core@0.46.0 @aurea-uds/fonts@0.46.0 @aurea-uds/icons@0.46.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.46.0
```
