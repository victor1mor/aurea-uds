# v0.40.1

The new typeface and the white fields reach React Native.

React Native catches up with the web. Text now uses **Inter**, titles use **Sora**, and code and values use **IBM Plex Mono**. In the light theme, a field that sits on the screen is white, with a soft shadow. On the web, four white surfaces that v0.40.0 missed now keep their fields grey.

## ⚠ May break

- **`@aurea-uds/fonts/native` now ships Inter, Sora and IBM Plex Mono** as static `.ttf` files, one per weight: Inter 400, 400 italic, 500, 600, 700 and 800; Sora 400 to 800; IBM Plex Mono 400, 500 and 600. That is **14 complete files, 3.17 MB** in an app that loads `AUREA_FONTS` (the previous 9 files weighed 0.40 MB). If you load `AUREA_FONTS` and pass `FONT_FAMILIES` to `AureaProvider`, your code does not change.
- **The names in `FONT_FAMILIES` change**: text uses `Inter-Regular`, `Inter-Medium`, `Inter-SemiBold`, `Inter-Bold`, `Inter-ExtraBold` and `Inter-Italic`; code uses `IBMPlexMono`, `IBMPlexMono-Medm` and `IBMPlexMono-SmBld`. **Titles get their own typeface**: the `heading` role now points to `Sora-Regular` through `Sora-ExtraBold` instead of the text typeface.
- **The Atkinson Hyperlegible files are gone from the package.** If you load one of them by path, or write an `AtkinsonHyperlegible…` name in your own styles, the font is no longer found.
- **`numeric` text (`Text`) and the `KPI` value use IBM Plex Mono**, as on the web since v0.39.0. A `font` you pass still wins. Numbers inside components — `Table` cells and the `Slider` value — stay in Inter with tabular figures, as on the web.
- **In the light theme, fields on the screen are white** (the card colour) **with the three layers of the small shadow**: `Input`, `InputGroup` (and `PasswordField`), `Select`, `Combobox`, `SearchField`, `NumberField`, the slots of `OTPField` and the `DatePicker` trigger. They used to be a translucent grey.
- **Inside a white surface the field stays grey, without a shadow**: `Card` (an outline or inset card follows whatever is around it), `Card variant="contrast"`, `Dialog`, `Drawer`, `BottomSheet`, the content of `Popover`, an `Accordion` with `surface`, a floating or pill `Header` and a `ScrollShadow` with its surface (the default). The surface decides on its own; your app does nothing.
- **The dark theme does not change.**
- **On the web, a field inside a floating or pill `Header`, inside the open docs sidebar (the popover on phones and tablets) or inside a `SortableList` item is grey again, without a shadow.** These four surfaces are white, and v0.40.0 left them out: the field was white on white, set apart only by its shadow.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.40.1 @aurea-uds/core@0.40.1 @aurea-uds/fonts@0.40.1 @aurea-uds/icons@0.40.1
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.40.1
```
