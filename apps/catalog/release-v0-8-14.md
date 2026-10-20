# v0.8.14

Additive props for Badge, Cluster, Topbar and Screen, a shared disabled-opacity token, and criarGlifo for custom glyphs in React Native.

An additive release, mostly for React Native. It adds layout props, a footer for `Screen`, an opacity token, and `criarGlifo` to draw custom glyphs such as logos.

## New

- **[`Badge`](./badge.html) `fit="content"`**, on the web and in React Native: the badge sizes to its text inside a column. The default is unchanged. On the web it becomes `inline-size: fit-content`; in React Native it becomes `alignSelf: "flex-start"`, which only works in a column. Ignored when the badge is anchored.
- **[`Cluster`](./cluster.html) (React Native) with `align`, `justify` and `wrap`**. Without these props, nothing changes.
- **[`Topbar`](./topbar.html) `inset`** (`bar`, `page`, `none`), on the flush variant only. `page` uses the same 16 inset as `Screen`, so the title lines up with the content; the default is still 20.
- **`opacity-disabled` token (0.5)**: fields, menus and `Combobox` now read it, on the web and in React Native. No value changes; the disabled button keeps its 0.45. `comOpacidade` is now exported from `@aurea-uds/native`.
- **`Screen` `footer` (React Native)**: stays outside the scroll area, above the system area, and above the tab bar inside a `BottomNavProvider`. It does not require a `SafeAreaProvider`.
- **`criarGlifo` (React Native)**: draws your own glyph, such as a logo, from rectangles, circles and paths, without your app importing an SVG library. It adds no new weight.

## Changed

- **`text-md` is documented as a synonym of `text-sm`** (14). No value changes.

## Fixed

- The `Card` `onPress` example in the React Native type definitions now uses neutral sample text.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.8.14 @aurea-uds/core@0.8.14 @aurea-uds/fonts@0.8.14 @aurea-uds/icons@0.8.14
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.8.14
```
