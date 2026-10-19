# v0.12.1

React Native fixes for bottom sheets and Grid, plus LinkButton. Also ships v0.12.0 with typed icon names, round icon buttons, ThemeToggle and text components.

This release fixes bottom sheets that slid behind the Android navigation buttons, makes the React Native `Grid` share leftover space, and adds `LinkButton`. It also publishes v0.12.0, which can break builds and changes some appearance: icon names are type-checked, icon-only buttons are round, and the React Native `Button` now follows its parent's alignment.

## New

- **`LinkButton` (React Native)**: a text button that sits flush with the margin. It is a `Button` with no background, no side padding, no border and no fixed height. The touch area keeps a 44-point height. Like every button it follows its parent: to keep it at the margin, use `Stack align="start"`.

## Fixed

- **Bottom sheets behind the Android buttons (React Native)**: `Select`, `Combobox` and `BottomSheet` did not get a bottom inset inside a `Modal`. The inset now comes from the app's safe area context and becomes space at the end of the sheet. Without a `SafeAreaProvider`, the initial window metrics are used.
- `Select` now covers the whole screen like the other two sheets, and `Combobox` drops the inset while the keyboard is open.
- **[`Grid`](./grid.html) (React Native) did not share leftover space between columns.** With `minColumnWidth={150}` in a 372-point row, you got two 150 columns and 56 empty points. The grid now measures its width and works like the web: the minimum decides how many columns fit, the leftover is shared, and a single cell on the last row is one column wide. Children still stretch in height.

## Includes v0.12.0

### New

- **[`ThemeToggle`](./themetoggle.html)**, on the web and in React Native: a round icon-only button to switch between light and dark. In the light theme it shows a filled moon in the text colour; in the dark theme, a filled sun in the brand yellow. Its accessible name says where it goes ("Switch to dark theme"). In React Native, register `asleep--filled` (moon) and `light--filled` (sun) in your app's icon registry.
- **`render` on `Button`, `IconButton` and navigation items** (`Sidebar`, `BottomNav`, `NavList`, `Breadcrumb`): `render={<Link href="/reports" />}` renders your router's link with the component's skin and content. When the button is disabled or loading, clicks are blocked on the element too.
- **[`Text`](./text.html), [`Heading`](./heading.html), [`Paragraph`](./paragraph.html) and [`Code`](./code.html)**, on the web and in React Native: a closed list of roles instead of loose sizes (heading 1 to 6, body, small, extra small and code). Colour is normal or `color="muted"`, with four weights, alignment and `truncate`.
- `Heading level={2}` renders an `h2` styled as heading 2. `Paragraph size="sm"` is a 14-pixel `p`. `Code` is a `code` with the `Prose` code skin. `Text` is a `span` with the role you choose.
- In React Native, the existing `Text` keeps its loose options and gains `type`, the same role as on the web. `Heading`, `Paragraph` and `Code` are new there too.
- **`Stack` (React Native) gets `align`**: `start`, `center`, `end`, `stretch`. New type: `AureaStackAlign`.

### Changed

- **One focus outline, from two new tokens**: `--focus-width` and `--focus-offset` (2px and 2px). Every focus rule in the core uses them, so changing focus system-wide is a one-line change.
- **Scrollable tables (`.table-region`) and [`DataGrid`](./datagrid.html)**: focus was a faint halo; it is now the focus outline, drawn inside.
- **[`MediaPlayer`](./mediaplayer.html), light theme**: control focus was dark brown on the near-black player and disappeared. It is now yellow in both themes.
- **Menus, keyboard focus**: the focused item now gets the focus outline inside, not just the grey hover background. With the mouse it is still only the background. In `Combobox` and `CommandPalette`, where focus stays in the field, the highlight remains the background.
- Minor: the player's position control is 2px from its outline instead of 3, and the `DataGrid` column resize handle draws its line inside.

### Breaking changes

- **Icon names are type-checked**, on the web and in React Native. `IconName` is no longer `string` but the list of 2,571 icon names, generated from the same source as the sprite and the native icons. A misspelled name used to compile and draw nothing; now it does not compile, in every prop that takes an icon. In React Native, the `criarRegistroDeIcones` keys are checked too.
- If you pass an icon name in a `string` variable, type it as `IconName`. For your own sprite or a `criarGlifo` glyph, declare the names once in `interface AureaIconNames` (see each package's `README.md`).
- **The React Native `Button` follows its parent**, like the web `.btn` in a `.stack`. In a column without alignment the button now takes the full width (for example in the `Screen` footer). To size it to its text, set `align` on the parent `Stack`. `IconButton` keeps a fixed width and never stretches.
- **Icon-only buttons are round**, at every size, on the web and in React Native. They were squares with 10px corners (6px on the two smallest). This covers every [`IconButton`](./iconbutton.html), close buttons and player controls, which also lost their side padding to become square.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.12.1 @aurea-uds/core@0.12.1 @aurea-uds/fonts@0.12.1 @aurea-uds/icons@0.12.1
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.12.1
```
