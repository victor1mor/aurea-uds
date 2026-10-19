# v0.9.0

Layout props for the web primitives, Button, Card, Separator and Dialog. The default Dialog width changes from 560 to 448.

A web release with layout props across the primitives and several components. One change is not additive: a `Dialog` without a `size` is now narrower.

## New

- **[`Stack`](./stack.html), [`Cluster`](./cluster.html) and [`Grid`](./grid.html)**: `gap` with three steps (`tight` 8, `normal`, `loose` 24); `align` and `justify` with the same names as the React Native `Cluster`; `wrap` on `Cluster`; `min` and `columns` on `Grid`. Without these props, no class changes.
- **`width` on [`SearchField`](./searchfield.html) and [`InputGroup`](./inputgroup.html)**, so a search field no longer takes the full width of a toolbar.
- **`aria-label` on [`Combobox`](./combobox.html) and [`MultiCombobox`](./multicombobox.html)**, for filters without a visible label.
- **[`Button`](./button.html) `grow`**, plus `target`, `rel` and `download` on a `Button` with `href`.
- **[`Separator`](./separator.html) `spacing`**, with the same three steps as `gap`.
- **[`Card`](./card.html) `padding="none"`**: the cover sits flush with the edge, clipped to the 22 radius.
- **[`Dialog`](./dialog.html) `size`**: `xs` 320, `sm` 384, `md` 448, `lg` 512, plus `xl` 1024 and `full`.
- **`Dialog` `dismissible={false}`**: neither Escape nor an outside click closes it, and the close button is disabled.

## Breaking changes

- **A `Dialog` without `size` is now 448 wide instead of 560**, 112 pixels narrower. For something close to the old width, pass `size="lg"` (512). [`ConfirmDialog`](./confirmdialog.html) stays at 420.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.9.0 @aurea-uds/core@0.9.0 @aurea-uds/fonts@0.9.0 @aurea-uds/icons@0.9.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.9.0
```
