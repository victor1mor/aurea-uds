# v0.8.1

React Native fixes for NumberField focus and width, the Combobox sheet hidden behind the iOS keyboard, and hard-coded sheet heights.

A patch with fixes only, all in React Native. `NumberField` shows focus and hugs its content, and the `Combobox` sheet no longer disappears behind the keyboard on iOS. No API was removed; upgrading from v0.8.0 needs only the version number.

## Fixed

### React Native

- **[`NumberField`](./numberfield.html) had no focus state.** Tapping it changed nothing on screen. The border now goes to `focusStrong`, in the same order as other fields: invalid first, focus last.
- **[`NumberField`](./numberfield.html) stretched to fill the row**, pushing the minus and plus buttons to the edges. It now hugs its content, like the web, and accepts **`fullWidth`** when you need the full width (for example, formatted currency).
- **[`Combobox`](./combobox.html): on iOS the keyboard covered the results list.** The sheet is now wrapped in `KeyboardAvoiding`, so you see the results while typing. Android already resized the window.
- **The `Combobox` sheet height now comes from tokens**, replacing fixed percentages.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.8.1 @aurea-uds/core@0.8.1 @aurea-uds/fonts@0.8.1 @aurea-uds/icons@0.8.1
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.8.1
```
