# v0.84.0

One-line list items are capsules again; disabled command palette items; a jump-to-latest button in MessageList; carousel arrows beside the slide; the bottom nav disc fits its label; right-to-left rules work with any language.

## ⚠ May break

- **New string in the web `AureaStrings`: `chatJumpToLatest`** (the label of the new jump-to-latest button in `MessageList`). If you pass the full string table typed as `AureaStrings`, add it. If you pass only some strings, as `AureaProvider` allows, nothing changes.

## Added

- **`disabled` on `CommandPalette` items.** The item stays in the list, dimmed, with the not-allowed cursor. Neither a click nor Enter runs it, and the mouse does not highlight it. The arrow keys still stop on it, as on a disabled `NavList` row or `Combobox` option.
- **A jump-to-latest button in `MessageList`.** When the conversation scrolls inside a box and the latest message leaves the view, a round button appears at the bottom and scrolls back to it (instantly when reduced motion is on). It takes no space, so showing it never moves a message. It does not appear when the whole page is the scroller.
- **Native `AureaProvider` takes partial strings** (`strings?: Partial<AureaStrings>`), as on the web. Missing strings come from the defaults, so a new string in a minor version no longer breaks an app that passes its own.

## Changed

- **One-line list items are capsules again**: menu items (including `CommandPalette` and `Combobox`), `ListBox`, `Sidebar` and `NavList`. Since 0.82.0 the continuous corner turned their radius into a surface corner. Rows with a description keep their corner. A `SegmentedControl` with `wrap` is back to its 22px round corner, a capsule on one line.
- **The `BottomNav` `circle-bold` disc grows to fit its label**, on web and native: at least 56px, with 8px on each side, never wider than the tab. The bar still does not move when the current tab changes.
- **Native `BottomSheet` moves up with the keyboard**, so a field inside the sheet stays visible.
- **`Menubar`**: an open trigger has the hover background and the text color, instead of the brand color as text. A disabled trigger is dimmed, with the not-allowed cursor and no hover background.
- **`FileInput` drop area**: the icon is muted at rest. While a file is dragged over it, the area takes the brand color at 16% and the icon the text color.
- **The `CodeBlock` "Copied" state lasts 2 seconds** (was 1.5), in React and in `aurea.js`. The "Link copied" of `Button share` is unchanged.
- **`Carousel` arrows sit beside the slide**, centred on its height, with the dots below.

## Fixed

- **Right-to-left rules work with any page language.** Bundlers such as Vite rewrite `:dir(rtl)` into a list of languages, so on a right-to-left page marked with another language (or none) the anchored badge moved inside its box, the `.select` arrow hid behind the text and the switch thumb went outside its track. Each of these rules now also has a `[dir="rtl"]` fallback. Nothing changes where it was already right.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.84.0 @aurea-uds/core@0.84.0 @aurea-uds/fonts@0.84.0 @aurea-uds/icons@0.84.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.84.0
```
