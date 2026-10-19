# v0.12.4

React Native components running in the browser now expose their state to screen readers through aria attributes.

An accessibility fix for apps that run the React Native package in a web browser. Component state (checked, selected, disabled, expanded, busy) now reaches screen readers there too. No API changes, and nothing changes on devices.

## Fixed

- **React Native state on the web**: components reported their state only through `accessibilityState`, which is not translated in the browser. A `RadioGroup` there, for example, had no `aria-checked`, so screen readers could not tell which option was selected.
- State is now reported in both forms, `accessibilityState` and the matching `aria-*` attribute, with the same value. This covers 20 components (`Button`, `IconButton`, `Input`, `Radio`, `Checkbox`, `RadioGroup`, `Switch`, `SegmentedControl`, `Select`, `Combobox`, `SearchField`, `NumberField`, `Card`, `Tabs`, `BottomNav`, `NavList`, `Stepper`, `Chart`, `Gallery`, `DataState`) plus `DatePicker` and `PhotoInput` from `@aurea-uds/native/system`.
- **Toggle buttons** (`pressed` on `Button` and `IconButton`) stay `checked` on devices, as before, and become `aria-pressed` on the web, which screen readers announce on buttons.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.12.4 @aurea-uds/core@0.12.4 @aurea-uds/fonts@0.12.4 @aurea-uds/icons@0.12.4
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.12.4
```
