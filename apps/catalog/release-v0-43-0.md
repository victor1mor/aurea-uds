# v0.43.0

React Native on the site, with a page for every component; yellow selected states and fixes in React Native; tabs in CodeBlock.

The site now shows React Native next to the web: every native component has its own page, with the real component running in both themes. In React Native, the selected segment, the selected tab and the bottom bar take the brand yellow, like the primary button, and six components get fixes. On the web, `CodeBlock` gets tabs, and the brand outline, ghost and link buttons use the blue text of the light theme. Read the Breaking changes section if you build the React Native `AureaStrings` yourself.

## New

- **`CodeBlock tabs`.** Alternatives for the same step in tabs, inside the code box: the install command in npm, pnpm, yarn and bun, for example.
- **`SegmentedControl` `size`** (`md`, `sm`), and items with `href`: the control becomes a row of links. `onChange` is now optional.
- **`Header tabsEnd` and `AppShell topbarTabsEnd`.** What sits at the right end of the row of area tabs.
- **`ColorSpace` and `ColorChannel`**, the types of the `colorSpace` and `channel` props of the color components, are exported from `@aurea-uds/react/inputs` (and from the root).
- **Metadata for the React Native components that have no web version**, in `@aurea-uds/contracts` (`platforms.web: "n-a"`): BottomNavProvider, IconRegistryProvider, Screen, LinkButton, KeyboardAvoiding, BottomSheet, ToastHost, Toast, ScrollShadow, SkeletonGroup, PressableFeedback and PhotoInput.
- **`@aurea-uds/contracts` ships `api-surface-native.json`**: the React Native API read from the types by the compiler, next to the web one (`api-surface.json`).

## Changed

- **`tone="primary"` text uses the emphasis color** in `Text`, `Paragraph`, `Heading` and `Code` on the web: blue in the light theme, yellow in the dark theme. It used the fill yellow, which measures 1.75:1 in the light theme.
- **The brand outline, ghost and link buttons use blue text in the light theme**: `Button`, `IconButton` and `ToolbarButton` with `primary-outline`, `primary-ghost`, `link-primary`, and `tone="brand"` without a box.
- **A soft `Avatar` with a status tone** uses the soft `Badge` background.
- **The `running`, `paused`, `offline` and `review` tones of `Badge`** have their own colors: blue, amber, dimmed gray and violet. Before, `paused`, `offline` and `review` looked like `neutral`.
- **`align` on `Text` and `Code`** now aligns the text: the element becomes a block.
- **The copy button no longer covers the end of a line** in `CodeBlock`. The code keeps room for the button, and the longest line scrolls before it reaches it.
- **React Native: in the light theme, `tone="primary"` text is the brand yellow mixed with the text color**, so it passes the reading contrast on white and on the page background. In the dark theme it stays yellow.
- **React Native: the selected color matches the web** — the check of a `Select` and `Combobox` option, the dot and check of a menu item, the current `Stepper` step.
- **React Native: the selected segment of `SegmentedControl` and the selected capsule of `Tabs` are the brand yellow, like the primary button**, with the label in the button's ink, in both themes. The shadow is gone, and so is the yellow line under the `SegmentedControl` segment. Underlined `Tabs` (`variant="secondary"`) keep the yellow line.
- **React Native: `BottomNav` marks the selected tab with the yellow behind it by default.** The default `indicator` changes from `none` (color on the icon and label only) to `capsule`. Pass `indicator="none"` to keep the previous look.
- **React Native: `Checkbox` and `Radio` get an invisible extra touch area of 6 around them** (`hitSlop`). Their drawing and their size in the layout do not change. `Switch` has none.
- **React Native in the browser** (`react-native-web`): headings carry their level (`Heading` from its `type`, the `Accordion` item as level 3) instead of all becoming `<h1>`, and the outline `Card` carries `data-aurea-card="outline"`. Nothing changes on a device.

## Fixed

- **The `DataState` type** rejected a function as `children`, which the component accepts. It compiles now.
- **React Native: `Screen` in the browser no longer needs a `SafeAreaProvider` above it.** Without one, the web version of the safe-area library threw and the screen did not open. Without a provider, in the browser it uses zero insets; if your web app must keep clear of a notch, put a `SafeAreaProvider` at the root. Nothing changes on a device.
- **React Native: `DatePicker` with `mode="time"`** shows the hours and minutes in the device's format, and when empty it asks for a time. Without `format`, it showed the day's date and said "Pick a date".
- **React Native: `Switch` reads `align`.** With `start`, the track sits on the first line of a long label. The type accepted it, and the track always stayed in the middle.
- **React Native: `BottomNav` with `variant="edge"`, in the browser,** came out with the shadow and the layer of the floating bar.
- **React Native: `SearchField` without `value`.** The clear button disappeared and the typed text stayed. Now the clear button empties the field.

## The documentation site

- **React Native on the site**: a Web | Native switch at the end of the row of areas, and one page per React Native component (79), with the real component running through `react-native-web` in both themes, an example of every value and the API read from the types. The preview box of these pages uses the app's own background.
- **Every variation in an example**: every value of every variant prop of the web components has a live example.
- **The example box grows with the example**: no example scrolls inside its box.
- **Install tabs** (npm, pnpm, yarn, bun) in Quick Start, Frameworks, Dark Mode and the release notes.

## Breaking changes

- **`comboboxOpen` is a new key in the React Native `AureaStrings`** ("Open list"; "Abrir lista" in `ptBR`), the same as on the web. It names the `Combobox` arrow in the browser. If you build the whole dictionary with this type, add it.
- **`timePlaceholder` is a new key in the React Native `AureaStrings`** ("Pick a time"; "Escolher horário" in `ptBR`): what `DatePicker` says when it is empty with `mode="time"`. If you build the whole dictionary with this type, add it.
- **`leading` and `trailing` are gone from the type of the React Native `IconButton` and `ThemeToggle`.** They came from the `Button` type and drew nothing. If you pass one of them, the code no longer compiles: remove it. Your own drawing goes in `name`.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.43.0 @aurea-uds/core@0.43.0 @aurea-uds/fonts@0.43.0 @aurea-uds/icons@0.43.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.43.0
```
