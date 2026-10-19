# v0.8.0

Five new React Native components (Combobox, SearchField, NumberField, Image and Gallery), number formatting helpers and new strings, with no new dependencies.

React Native goes from 46 to 51 components with `Combobox`, `SearchField`, `NumberField`, `Image` and `Gallery`. Numbers are formatted with the device's `Intl` when the field loses focus. There are no new dependencies: everything is built on React Native's own `FlatList`, `Modal`, `TextInput` and `Image`.

## New

### React Native

- **[`Combobox`](./combobox.html)**: a field you type in to find one item, over a `FlatList` in a bottom sheet. Supports `onSearchChange`, `loading` and `onEndReached` for remote search and paging.
- **`Combobox` search mode depends on `onSearchChange`**: with it, Aurea does not filter and your app returns the results; without it, Aurea filters the items itself. On the web, remote search exists only in `MultiCombobox`.
- **[`SearchField`](./searchfield.html)**: magnifier, field and clear button in one box, with `role="search"`.
- **[`NumberField`](./numberfield.html)**: currency, decimal measures and a stepped counter. Formats on blur with the platform `Intl` and returns a plain `number`.
- **`notation: "compact"` is refused** in number formatting, with a development warning: it gives wrong results on both platforms.
- **[`Image`](./image.html)**: reserves its box before the image loads and shows a fallback when it fails to load.
- **[`Gallery`](./gallery.html)**: a grid of tiles that opens the selected image in a `Dialog`.
- **`Input.formatOnBlur`**: formats the value when the field loses focus.
- **Number helpers**: `formatarNumero`, `lerNumero` and `separadoresDoLocale`. `lerNumero` reads a formatted number back using the separators of the current locale.
- **Eight new strings** in English and Portuguese. Two of them, `comboboxSearch` and `searchClear`, exist only in React Native.

## Changed

- **Component contracts**: `Combobox`, `SearchField`, `NumberField`, `Image` and `Gallery` are marked as supported in React Native.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.8.0 @aurea-uds/core@0.8.0 @aurea-uds/fonts@0.8.0 @aurea-uds/icons@0.8.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.8.0
```
