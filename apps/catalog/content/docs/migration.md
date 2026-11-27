---
title: Migration
description: The old names removed in 0.76.0 and the DataGrid move to TanStack Table 9 in 0.83.0, ahead of 1.0, and how to move before you upgrade.
icon: arrow-fat-lines-up
sources: none
---

Version 0.76.0 removes a short list of old names, ahead of 1.0. Each one had been deprecated for several versions and has a replacement. They all still work in 0.75.0 and earlier, so you can move to the new names first and then upgrade without anything breaking.

## Before you upgrade

1. While you are still on 0.75.0 or earlier, search your code for each old name below and replace it.
2. Upgrade all seven packages together, to the same version.
3. After the upgrade, run the TypeScript compiler: it flags every `pressed` left. It cannot flag a CSS variable, so search your stylesheets too.

## What leaves in 0.76.0

| Old name | Use instead | Where |
|---|---|---|
| `--text-md` | `--text-sm` | CSS |
| `textMd` | `textSm` | React Native |
| `--font-editorial` | `--font-ui` | CSS |
| `font.editorial`, `font="editorial"` on `Text` and `fontFamilies.editorial` | `font.ui`, `font="ui"` and `fontFamilies.ui` | React Native |
| `FONT_FAMILIES.editorial` | `FONT_FAMILIES.ui` | `@aurea-uds/fonts/native` |
| `--brand-yellow-foreground` | `--brand-yellow-ink` | CSS |
| `--brand-yellow-text` | `--foreground` | CSS |
| `pressed` on `Button` and `IconButton` | `Toggle` | React |

## From pressed to Toggle

With `pressed`, the button only paints the on state and you keep the state yourself. `Toggle` keeps the state, reports each change and requires an accessible name when it shows only an icon.

```jsx
<Button pressed={on} onPress={() => setOn(!on)}>Bold</Button>
```

```tsx
<Toggle pressed={on} onPressedChange={setOn}>Bold</Toggle>
```

## The yellow text color

`--brand-yellow-text` has no direct replacement: in the light theme, yellow is never a text color. Use the text color, `--foreground`, and let the yellow mark the element as a background, an underline or an indicator.

## DataGrid on TanStack Table 9 (0.83.0)

From 0.83.0, `DataGrid` runs on TanStack Table 9 instead of 8. The grid looks and behaves the same. What changes is the engine your column definitions are typed against.

1. Replace the engine: install `@tanstack/react-table@^9.3.1` and remove version 8. It is an optional peer dependency of `@aurea-uds/react`, needed only for `@aurea-uds/react/data-grid`.
2. If you import `ColumnDef` from `@aurea-uds/react/data-grid`, keep writing `ColumnDef<Row>`: the grid's feature set is already inside the type.
3. If you import types straight from `@tanstack/react-table`, version 9 asks for the feature set first. Use `DataGridFeatures`, exported by `@aurea-uds/react/data-grid`:

| Version 8 | Version 9 with DataGrid |
|---|---|
| `ColumnDef<Row>` from the engine | `ColumnDef<Row>` from `@aurea-uds/react/data-grid` |
| `createColumnHelper<Row>()` | `createColumnHelper<DataGridFeatures, Row>()` |
| `FilterFn<Row>` | `FilterFn<DataGridFeatures, Row>` |
| `sortingFn` on a column | `sortFn` |
| `SortingFn<Row>` | `SortFn<DataGridFeatures, Row>` |
| `VisibilityState` from the engine | `VisibilityState` from `@aurea-uds/react/data-grid` (same shape) |

4. Each row must be an object or an array. A grid of plain strings or numbers no longer compiles: wrap each value, for example `{value: "a"}`.
5. If a cell or header you render reads `table.getIsSomeRowsSelected()`, it now means "at least one row", including when every row is selected. For a mixed state, add `&& !table.getIsAllRowsSelected()`. The grid's own "select all" box already does this.

Shift-clicking a row's box still selects only that row, as before.

## Old names that stay

These names are older than the current ones but are not deprecated for removal. They keep working in 1.0, and you do not need to change them:

- `Topbar`, the old name of `Header`, on the web and in React Native;
- `useValorResponsivo`, the old name of `useResponsiveValue`;
- `MenuItemDef`, the old type of a menu item, now `MenuEntry`;
- the `BottomNav` variants `flat`, `surface`, `pill` and `dock`, now `variant` with `indicator`;
- `onClick` on the web, which works the same as `onPress`;
- `onChange` on the web `Switch`, which still receives the input event; `onCheckedChange` receives true or false, on the web and in React Native.

## After 1.0

The [versioning rules](./docs-versioning.html) apply: a name is deprecated in a minor release first, keeps working for at least six months, and is removed only in a major release. Each major release that removes names gets its own section on this page.
