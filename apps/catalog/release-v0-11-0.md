# v0.11.0

React Native fixes for Android (clipped button text, lists that did not scroll, sheets behind system buttons), new Badge sizes and centred Radio and Checkbox marks.

A React Native release focused on Android. Button text no longer loses its descenders, `Select` and `Combobox` lists scroll, and bottom sheets stay clear of the system buttons. It also changes some appearance: `Radio` and `Checkbox` marks are vertically centred, and `Badge` follows new sizes.

## New

- **`justify` on [`SegmentedControl`](./segmentedcontrol.html) and [`Tabs`](./tabs.html)**: `start` (default), `center` or `end`, to place the row when it fits on the line. Wrapping them in a centred `Cluster` had no effect. New type: `AureaFilaJustify`.
- **`align` on [`Radio`](./radio.html) and [`Checkbox`](./checkbox.html)**: `center` (default) or `start`. With `start`, a multi-line label keeps the mark centred on its first line.
- **`searchKeyboardType` on [`Combobox`](./combobox.html)**: the keyboard for the sheet's search field, for example `"number-pad"` to search for a year. Without it, the regular text keyboard.

## Changed

- **`Radio` and `Checkbox` marks are centred on the text height.** They used to sit at the top of the label with a fixed 1-point offset.
- **[`Badge`](./badge.html) sizes**: `sm` 8 by 2 padding, 12-point text, 16 line; `md` 12 by 4, 14-point text, 20 line; `lg` 16 by 6, 16-point text, 24 line; 4-point gap. Heights grow from 20 to 22, 24 to 30 and 28 to 38. The `xs` counter stays 16 tall, now with 12-point text. The capsule radius is unchanged.
- **Inside `Card variant="brand"`**, a solid button with a tone (success, danger, warning, info) keeps its colour and gets an outline in the card's ink colour, so it stands out from the yellow. Outline and ghost buttons stay in the ink colour.
- **Bottom sheets** (`Select`, `Combobox`, `BottomSheet`) inset their bottom edge with `SafeAreaView`, like `Screen`: only as much as the sheet actually sits behind the Android button bar, and zero otherwise.

## Fixed

- **[`Button`](./button.html) clipped descenders** (g, p, ç) on Android. The label used a line height of 1.0; it now uses the normal 1.5, which fits at every size and density. `Badge` had the same problem and is fixed by its new sizes.
- **`Select` and `Combobox` lists did not scroll on Android.** A wrapper claimed the touch and kept it from the inner scroll view. That redundant handler is removed from `Select`, `Combobox`, `Dialog` and `Drawer`.
- **`Combobox` with a selected value**: the clear button and the arrow sat at different heights on Android. The arrow now has the same touch box as the clear button (44-point minimum height, centred), so both line up with the field, and its touch target grows from 16 to 44.

## Breaking changes

- **Appearance**: `Radio` and `Checkbox` marks move to the middle of the text, and `Badge` heights grow. Check screens that depend on these sizes.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.11.0 @aurea-uds/core@0.11.0 @aurea-uds/fonts@0.11.0 @aurea-uds/icons@0.11.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.11.0
```
