# v0.81.0

Switch reports true or false; Combobox and MultiCombobox submit with the form; useResponsiveValue is the new name of useValorResponsivo; spinners keep turning, slower, with reduced motion.

## Added

- **`onCheckedChange` on `Switch`**, on the web and in React Native: called with the new value, `true` or `false`. It is the same name the checkbox item of the menu already uses. On the web, `onChange` still works and still receives the input event; with both, both run, `onCheckedChange` first. In React Native, `onChange` keeps receiving the value.
- **`name`, `required` and `defaultValue` on `Combobox` and `MultiCombobox`** (web). With a `name`, the chosen option goes out with the form as its `value` (one value per chip on `MultiCombobox`); `required` stops an empty submit and is announced; `defaultValue` starts with an option chosen, with no state in the app. The `required` of a surrounding `Field` now reaches the `Combobox` too.
- **`useResponsiveValue`**: the English name of the hook that resolves a `Responsive<T>`, like the other public hooks.

## Changed

- **With reduced motion, `Spinner` and the indeterminate `ProgressCircle` keep turning**, at a third of their speed (2.1 s and 3 s a turn), instead of stopping — stopped, they read as nothing loading. In React Native, the `Spinner` does the same. Every other animation still stops, and the indeterminate `Progress` bar still shows whole and dimmed.

## Deprecated

- **`useValorResponsivo`** is now the old name of `useResponsiveValue`. It is the same hook and keeps working in 1.0; you do not need to change it.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.81.0 @aurea-uds/core@0.81.0 @aurea-uds/fonts@0.81.0 @aurea-uds/icons@0.81.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.81.0
```
