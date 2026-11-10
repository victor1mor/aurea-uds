# v0.64.0

Checkbox draws the indeterminate state — the "select all" of a table with some rows selected — and takes an indeterminate prop.

## Added

- **`Checkbox` `indeterminate`**: some, not all — the "select all" of a list with part of it selected. The box shows a dash and a screen reader hears "mixed". Your app controls it: a click checks or clears the box, and your app says whether it stays indeterminate. It also works with `variant="pill"`. Web only.

## Fixed

- **The indeterminate state is drawn.** Before, it looked exactly like an unchecked box, so the "select all" of a `DataGrid` with some rows selected looked empty. Now it has the checked fill, with a dash where the check mark goes. The dash is drawn the same way as the check mark, at the same thickness, so the row does not move when the state changes. It also shows in Windows high contrast (forced colours).

## Documentation

- `SegmentedControl`: when the options do not fit, the control runs past its container. It does not scroll, as the docs used to say. Use `wrap` to break it onto more lines.
- `DataGrid`: the header box shows the indeterminate dash when some rows are selected.
- `Checkbox`: a new "Indeterminate" example, with a working "Select all".

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.64.0 @aurea-uds/core@0.64.0 @aurea-uds/fonts@0.64.0 @aurea-uds/icons@0.64.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.64.0
```
