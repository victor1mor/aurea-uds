# v0.32.0

Twelve new components, including Slider, ListBox, DatePicker on the web and a full color family; redesigned controls and dialogs; and a 48px touch scale for React Native.

The largest release so far. Twelve new components: `CloseButton`, `Slider`, `CheckboxGroup`, `ListBox`, `Link`, `ColorSwatch`, `ProgressCircle`, `TagGroup`, `DatePicker` on the web, `ColorArea`, `ColorField` and `ColorPicker`. Most existing components get new anatomy, sizes and states, and React Native moves to a touch scale with 48px as the medium size. Read the Changed and Breaking changes sections before upgrading: several defaults changed.

## New

### New components

- **[CloseButton](./closebutton.html)**, web and React Native: a neutral gray circle with a dimmed X, labeled "Close" by default ("Fechar" in `ptBR`). `label` says what it closes; `children` replaces the X. Web: 24px, with a 44px touch area around it. React Native: 40px, with a 12px extended touch area.
- **[Slider](./slider.html)**: label and value on top, a 20px track with a fill and a capsule thumb. One value or two (`defaultValue={[20, 80]}`, `thumbLabels`), vertical, values formatted with `Intl` (`format`, `locale`), and `onValueChange` and `onValueCommitted` with the number. `Range` (the browser input) stays as it was.
- **[CheckboxGroup](./checkboxgroup.html)**: label, description, the boxes and the error. It holds the list of checked values (`value`, `onValueChange`); each `Checkbox` inside sets its own `value`.
- **[ListBox](./listbox.html)**: a standalone list of options with icons, descriptions and sections. Selection of none (an action list, `onAction`), one or many. Keyboard per the ARIA Authoring Practices: arrows, Home, End, Space, Enter and type-ahead.
- **[Link](./link.html)**: a text link in medium weight and the link color, underlined on hover. `external` opens a new tab with an arrow; `disabled` does not navigate.
- **[ColorSwatch](./colorswatch.html)**: a round color sample with `color`, `size` (xs 16 to xl 40) and `label` for screen readers. Transparent colors (4- or 8-digit hex, `rgba()`, `hsla()`) show a checkerboard.
- **[ProgressCircle](./progresscircle.html)**: circular progress at 20, 28 or 36px, with the `Progress` colors. Without `value`, it spins.
- **[TagGroup](./taggroup.html)**: tags with selection of none, one or many, a remove X (`onRemove`), description and error. One Tab stop, arrows between tags, Delete removes.
- **[DatePicker](./datepicker.html) on the web**, in `@aurea-uds/react/calendar`: the same name and props as React Native (`value`, `onChange`, `minimumDate`, `maximumDate`, `disabled`, `size`, `format`, `placeholder`, `icon`), plus `defaultValue`, `name`, `range` and `locale`. The trigger is the `Select` field with a calendar icon; the popup is the `Calendar` in a popover. Forms receive the local date (`yyyy-mm-dd`, or `yyyy-mm-dd/yyyy-mm-dd` for a range).
- **`DatePicker` language**: `locale` takes the same object as `Calendar` (`import {ptBR} from "react-day-picker/locale"`), and the field and calendar change together. Without it, English. It never uses the environment language, so server and browser render the same text.
- **[ColorArea](./colorarea.html)**: a square to pick saturation and brightness of a hue, by pointer, touch or keyboard. Or any pair of HSB, HSL or RGB channels (`colorSpace`, `xChannel`, `yChannel`), with an optional dot grid (`showDots`). The value is hex, with `value`, `defaultValue`, `onValueChange` and `onValueCommitted`. Screen readers hear a 2D control and the color name ("vivid blue"). No new dependency.
- **[ColorField](./colorfield.html)**: a color swatch and the code (hex, `rgb()`, `hsl()` or `hsb()`), applied on Enter or blur. Invalid text reverts; empty clears (reports `""`). With `channel`, one channel as a number with arrows, Page Up/Down and Home/End. Same skins as `Input` (`size`, `variant`); inside a `Field`, it uses its label, description and error; `name` submits the hex.
- **[ColorPicker](./colorpicker.html)**: the trigger is the swatch with its name; the popup has the area, the hue track and the code field, always. `swatches` adds preset colors, named in the app's language; `variant="swatches"` is a closed palette (swatches and code only). You can also compose it with `children`: the `ColorArea`, `Slider` with `channel` and `ColorField` inside share the picker's color.

### New props on the web

- **`Slider` `channel`**, color tracks: `hue`, `saturation`, `brightness`, `lightness`, `red`, `green`, `blue` or `alpha` (`colorSpace` sets the space). The value is the color, and `onValueChange` returns the hex, so several tracks share one color. Screen readers hear the channel, its value and the color name.
- **`ColorSwatch` `options`**: with `options` (hex or `{color, label}`), `name` and `label`, swatches become a choice group built on native radio buttons, with no JavaScript, rendered on the server. Five sizes, a `disabled` option, `layout="stack"` and a custom `indicator`. The check uses whichever ink contrasts more with the color (WCAG).
- **`Icon` `bold` weight**, only for the names drawn in it (today, `x`). Sprite id `i-x-bold`; React Native `@aurea-uds/native/icons/x-bold` (register it as `"x-bold"`).
- **`Button variant="tertiary"`**: the neutral background with regular text, which is what `secondary` looked like up to 0.31.0.
- **`ButtonGroup`**: `variant`, `size` and `disabled` apply to every button inside (each can override), plus `fullWidth` and `detached`. **`ToggleGroup`**: `size`, `fullWidth` and `detached`.
- **`Toggle` `variant`**: `default` (neutral background, the default) or `ghost` (no background, the previous look).
- **`Field` `required`**: a red asterisk after the label (hidden from screen readers) and `required` on the control.
- **`Input` and `Textarea` `variant="secondary"`**: a neutral background with no visible border, for use inside cards.
- **`Tabs` `variant="secondary"`**: no rail, a line under the list, and the selected tab underlined.
- **`Pagination`**: `variant` (`numbers`, the new default; `simple`, previous and next only; `compact`, the previous look), `summary`, `href` (each page becomes a real link), `siblings` and `label`.
- **`Accordion`**: `variant="surface"` (in a card), `multiple`, `defaultValue` and `disabled` items.
- **`Sidebar` `placement="right"`**, and the `AppShell` right column (`aside`, `asideLabel`) for an "On this page" column from 1280px up; below that, it goes after the content.
- **`Sidebar` `variant="plain"`**: a sidebar with no box. **`AppShell` `asideVariant`** sets the variant of the right column.
- **`Sidebar` `scrollbar`** (`hover`, the new default, or `visible`), passed through by **`AppShell` `sidebarScrollbar`**.
- **`Card variant="outline"`**, web and React Native: a card in the color of what is behind it, with only a line around it.
- **`CommandPalette`**: titled groups (`group` on each item) and a row of keyboard hints at the bottom (`shortcuts`, on by default).
- **`Dialog` and `ConfirmDialog`**: `icon` (in a 40px circle above the title), `iconTone` (`neutral`, `brand`, `info`, `success`, `warning`, `danger`; in `ConfirmDialog` it follows `destructive`) and `placement` (`auto`, `center`, `top`, `bottom`).
- **`Drawer`**: all four sides (`side="top"` and `side="bottom"`, the bottom sheet on phones), `footer`, and drag to close. Top and bottom drawers have a handle.
- **`Tooltip`**: `arrow`, `delay` and `closeDelay`. **`Popover`**: `arrow`.
- **`Badge` `tone`**: the React Native name for the color.
- **`Alert variant="accent"`**, in the Aurea link color.
- **`Text`, `Heading`, `Paragraph` and `Code` `tone`**: `default`, `muted`, `subtle`, `primary`, `link`, `danger`, `success`, `warning`, `info`. It wins over `color`.
- **`CodeBlock` `preview`**: a Preview | Code example box, with the preview on a sunken background.
- **`Spinner` `size="xl"`** (40). **`Progress`**: `showLabel`, `showValue` and `size` (a 4, 8 or 12px track). **`Skeleton` `animation`**: `pulse` (default) or `none`.
- **`AureaProvider` `toastPlacement`**: `bottom` (default), `bottom-start`, `bottom-end`, `top`, `top-start`, `top-end`. Toasts accept `actionProps`, and a `promise()` toast shows a spinner while loading.
- **`DataState` `catchErrors` and `onCatch`**, web and React Native: an error boundary. A render error inside the content shows the error state with a retry button, and the rest of the screen stays. `onCatch` receives the error for logging.
- **Heading line heights**: tokens `text-4xl-leading` to `text-lg-leading` (40, 36, 32, 28, 28, 24 for headings of 36, 30, 24, 20, 18, 16), used by `Heading`, `Text type="h*"` (web and React Native) and `.prose` headings.

### React Native

- **A touch scale**: tokens `touch-control-h-sm/md/lg`, 40, 48 and 56 at comfortable density; 36, 44, 52 at compact; 44, 52, 60 at spacious. The web keeps its own scale.
- **`Accordion`**: `items`, `variant` (`default`, `surface`), `multiple`, `defaultValue`, and controlled `value` with `onValueChange`. The chevron rotates on a spring and the answer fades in.
- **`ScrollShadow`**: a 1px line at the edge where content is hidden, and only there. The list sits on an Aurea surface; `variant="plain"` removes it for use inside a card. `orientation`, `visibility`, `isEnabled`; supports inverted lists.
- **`SkeletonGroup`** (and `SkeletonGroup.Item`): `isLoading`, `isSkeletonOnly` and `animation`, with one pulse for the whole group. **`Skeleton`** gets `isLoading`, `children` and `animation`; with `isLoading={false}` the content fades in.
- **`PressableFeedback`**: a touch target that shrinks slightly when pressed, with three combinable parts: `.Highlight`, `.Ripple` and `.Scale`.
- **`Slider`**, **`OTPField`** and **`TagGroup`**: the web components, for touch.
- **`Popover`** and **`DropdownMenu`**: a panel with title and arrow, and a menu with the same `MenuEntry` as the web (action, link, toggle, single choice, submenu, section). React Native only for now: `destructive` on action items.

### Dependency graph

- **`GraphEdgeItem.status`**: the state of an edge, like the node badge: `label`, `tone` (`neutral`, `info`, `success`, `warning`, `danger`) and an optional `mark` in the middle of the edge. Colored edges are twice as thick so the color shows; all three weights double together.
- **A two-part legend**: the link type (`legend`, shown by the drawing, without color) and the status (`status.label`, in color), each with a visible title (`graphLegendKind`, `graphLegendStatus`). With only one part, the legend looks as before.
- **`@aurea-uds/react/graph-worker`**: the layout worker through an Aurea path. In Vite: `import GraphWorker from "@aurea-uds/react/graph-worker?worker"` and `layoutWorker={() => new GraphWorker()}`. It imports the `elkjs` worker (the optional peer), so `elkjs` is not bundled into the package.
- **Keyboard on the read-only graph**: the graph is one Tab stop (the last visited node, or the first). Arrows move between nodes. With a node focused, Tab goes through its close button and its edges, then leaves the graph. On a focused edge, the arrows go to its ends.

## Changed

### Look and behavior on the web

- **`Button variant="secondary"` now has brand-colored text** on the neutral background. **A `Button` without `variant` does not change**: the default is now `tertiary`, the same look as before (class `btn-tertiary`, no longer `btn-secondary`). The `ConfirmDialog` cancel button moves to `tertiary` and looks the same; the `DataGrid` export and `FileInput` buttons stay `secondary` and get the brand text. For the neutral look on a `secondary` button, use `tertiary`.
- **`Button`**: 16px side padding (was 15), `lg` 16px (was 20). Icons are 16px from 640px up and 20px below, and always 16px at `sm` and `xs`.
- **`ButtonGroup` and `ToggleGroup` are attached** in one capsule: no gap, rounded only at the ends, a thin divider between buttons. For separate capsules, pass `detached`.
- **`Toggle`** has a neutral background by default; the on state is unchanged. For no background, pass `variant="ghost"`.
- **`IconButton` inside a `ButtonGroup` with `variant`** follows the group; on its own, it stays ghost.
- **Control heights on the web**: `sm` 32 and `lg` 40 (were 30 and 42); `md` stays 36. Compact 28/36, spacious 36/44.
- **Fields**: 12px side padding in inputs and text areas, 8px top and bottom in text areas, labels in medium weight, hints and descriptions at 12/16, errors with a 4px indent.
- **`NumberField` in a group**: one group with the field background, and the plus and minus buttons inside it (40px wide), with a divider. Previously two ghost buttons beside the field. 44px on touch.
- **`OTPField`**: 38 × 40px cells, digits at 18px semibold (were 36 × 36, 14px).
- **`Checkbox` and `Radio`**: a 16px mark (was 18), checkbox radius 6px, 12px to the text, medium-weight text, description at 12/16. A selected radio is filled, with a dot.
- **`Switch`**: a 40 × 20 track (sm 32 × 16, lg 48 × 24; was 42 × 24), a 22 × 16 capsule thumb, 12px to the text.
- **`Kbd`**: 24px tall, 8px side padding, 14px medium-weight text in the body font, neutral background, no border, capsule-shaped and round for a single character (was 20px, 11px code font, with a border). Inside a button, 20px.
- **Headings**: line heights now follow the heading scale (no longer 1.2 for all).
- **`Tabs` and `SegmentedControl`**: a rail with 4px padding and no gap, 32px tabs with 16px sides, medium weight. The rail is 40px (was 36).
- **`Breadcrumb`**: 6px gap, medium weight, underline on hover, current page in the text color, 12px separator.
- **`Accordion`**: no box around it, a divider between items, 16px padding, a 16px chevron at the end that rotates when open (was the browser marker at the start), muted 14px answer, and **one item open at a time**. `multiple` restores the previous behavior.
- **`Pagination`**: the default is now page numbers, with the current page highlighted. The previous look is `variant="compact"`. `onPageChange` is no longer required (with `href`, pages can just navigate).
- **`CommandPalette`**: the list lives inside the palette box (was a popup under the field), and the first result is preselected.
- **`Dialog` and `ConfirmDialog`**: the X is a `CloseButton` in the corner, 16px from the edge. Title 16px medium; body 14/20 in the muted color, and only the body scrolls (header and footer stay). **On phones the dialog sits at the bottom** (`placement="auto"`, the default; `center` restores the middle). Screen margin is 16px on phones and 40px from 640px up. It grows in and shrinks out.
- **`Drawer`**: side drawers are 320px on phones and 384px from 640px up, never more than 85% of the screen (was up to 480). Radius 22 on the inner side, a scrolling 14px muted body, and a `CloseButton` in the corner. The default side is still the right.
- **`Tooltip`**: 8px padding, 12/16 text, up to 320px wide, the popup background. Opens after 1.5 s of hover and closes 0.5 s after leaving; from the keyboard, immediately. Non-focusable triggers (a `span`, a `Badge`) now receive focus.
- **`Popover`**: 14px text, title in medium weight.
- **`Table` and `DataGrid`**: a gray frame without border, a header of 12px medium muted text without uppercase, and the body as a card inside. Cells have 12px top and bottom and 16px sides, 14px text. The selected `DataGrid` row is highlighted. On phones the table scrolls sideways inside the frame. The `caption` sits on top, aligned with the columns.
- **`Badge`**: 4px between glyph and text (was 6), `sm` 6px padding (was 8), `lg` 14px (was 12), 16px line height.
- **`Avatar`**: 32, 40, 48 (were 32, 36, 40), initials at 12, 14, 16 in medium weight.
- **`Card`**: 16px padding (was 20; compact 12, spacious 20), title 14/24 and description 14/20 right below.
- **`Calendar`**: the month at the start and both arrows together at the end, round days in medium weight, today highlighted (was a ring), days outside the month at half strength, disabled days struck through.
- **`Alert`**: a card background without border, with the surface shadow (the state color used to tint background and border). The state color goes on the 16px icon and the medium-weight title; the body is muted. The X is a `CloseButton`. `Banner` does not change.
- **`Spinner`**: sizes 16, 24, 32, 40 (were 16, 20, 24), and the default is `md`, **24px** (was 16). The spinner inside buttons stays 16.
- **`Skeleton`**: radius 8px, and static for users who ask for reduced motion.
- **Toasts (`useToast`)**: toasts stack in one place (the front one whole, the others peeking; hover or focus expands the stack), at the bottom center (was the bottom end corner), 460px wide (was 360), dismissed after 4 s (was 5), three visible. The type colors the icon and title instead of the background. The X is a 20px `CloseButton` that appears on hover or focus (always on touch).
- **`Sidebar` scrollbar**: light and hidden at rest; it appears on hover, with keyboard focus inside, and always on touch screens. `scrollbar="visible"` keeps the previous one.
- **`Sidebar` group titles and the `TableOfContents` title**: 14px, no uppercase (were 12 and 11px, spaced uppercase). The table of contents title gets a lines icon drawn in CSS (`span.toc-label-icon`).
- **`Sidebar` items that are not current are muted** and light up on hover; group titles and the current item stay strong. Measured contrast: 7.6:1 dark, 5.4:1 light.
- **`TreeView` and `NavList` no longer widen the page**: in a `1fr` grid column or a `flex: 1` child they asked for the full label as minimum width. Rows keep their position and height.
- **`Field`**: the `label` now has an `id`, so other parts (like the `DatePicker` popup) can point to it. Nothing changes on screen.
- **Gradients**: the no-gradients rule has one exception, for painting pickable colors in the color area and color tracks. The CSS still has no gradients.
- **`@aurea-uds/react` `sideEffects`** is now a list containing `dist/graph-worker.js`; every other file stays side-effect free.

### React Native: the 48px touch scale

- **`Button`, `IconButton`, `LinkButton`**: sm 40, md 48, lg 56 (were 32, 36, 40), with 14, 16, 20 side padding and 14, 16, 18 medium-weight text. `xs` (32) and `xl` (64) remain.
- **Fields** (`Input`, `InputGroup`, `PasswordField`, `SearchField`, `Combobox`, `NumberField`, `DatePicker`, `FileInput`): 40, 48, 56 with 12px sides. `Select` options show a 20px check on the selected one (register the `check` icon). `Textarea` is 128 tall. `Field` labels in medium weight.
- **`Checkbox`** 24 (was 18) with radius 6; **`Radio`** 24 with a 10px dot; **`Switch`** 48 × 24 with a 28 × 20 capsule thumb.
- **`Avatar`**: 40, 48, 64 (were 32, 36, 40).
- **`NavList`** with 16px padding and 16px medium titles; **`Tabs`** with 16px medium labels.
- **`Dialog`, `ConfirmDialog`, `Drawer` and `BottomSheet`**: 20px padding, 18px medium titles; the `Dialog` and `Drawer` X is a `CloseButton` in the corner.
- **`Alert`** matches the web (card, no border, shadow, state color on icon and title). **`Toast`** no longer tints its background, has 16px padding and a `CloseButton`.
- **`Spinner`**: 16, 24, 32, default 24 (16 inside the `Combobox` list).
- **`NumberField` `display`** grows to 64 (was 50).
- **`BottomNav` does not change.**

### Dependency graph

- **"Fit to screen"** reserves space at the top for the editing toolbar and zoom buttons, so the top node is no longer hidden behind them. The space is measured, so it follows a toolbar that wraps on narrow screens.

## Fixed

- **Windows high contrast, color swatches lost their color** in `ColorSwatch`, swatch options, the `ColorPicker` trigger and the `ColorField` swatch: they turned into white circles and the check vanished. They now opt out of the system override; the focus ring stays in the system color.
- **Windows high contrast, mask-drawn glyphs vanished**: the `Header` menu, the external link arrow, the `KPI` arrow, the copied check on anchored toasts and the `Accordion` chevron. They now paint in the system text color.
- **`Accordion` chevron** no longer depends on the icon sprite: it is drawn in CSS, at the same size and position. Pages using only the `Accordion` showed a network error and an empty arrow.
- **`InputGroup` with an `Input variant="secondary"` inside** showed the `primary` border. The group now reads the skin of the inner input too.
- **`Toggle` without `size`** rendered the class `btn-undefined`.
- **`Slider` thumbs had no accessible name in server-rendered HTML.** The label now has its own id that names the group and each thumb in the markup; `disabled` also sets `aria-disabled` on the group.
- **Two `Pagination` on one page** were two landmarks with the same name. Use `label` to name each one.
- **The current `Pagination` page drew two lines on focus**; the ring now touches the border.
- **`Table` with `stickyFirstColumn`**: cells showed through a 4px strip left of the pinned column when scrolling sideways, including in right-to-left layouts.
- **`Button` `kbd`**: the key inside a button now gets its size from the `btn-kbd` class, not from context. A `Kbd` placed manually inside a button keeps the standalone size.
- **The published API surface** listed only 8 of the 21 `Slider` props, because props written as `Base & (A | B)` were not merged. All props are listed now.
- **Prop descriptions** for `appearance`, `tone` and `share` on `Button`, `IconButton` and `ToolbarButton` were partly not in English, and some component descriptions mentioned versions or dates.

## Breaking changes

- **New `AureaStrings` keys.** If you build the whole object yourself (your own translation), add them; `ptBR` already has them. Web and React Native: `dataCrashed`, `dataRetry`. Web: `graphLegendKind`, `graphLegendStatus`, `datePlaceholder`, `dateRangePlaceholder`, `colorPicker`, `colorArea2D`, `colorChannel`, `colorHue`, `colorTone`, `colorNameFormat`, `colorHex`, `colorSwatches`, `paginationPage`, `commandHintMove`, `commandHintSelect`, `commandHintClose`, `codeBlockPreview` and `codeBlockCode`.
- **`IconWeight`** is now `"regular" | "fill" | "bold"`, and **`ButtonVariant`** gains `"tertiary"`: an exhaustive `switch` over either stops compiling.
- **`Button variant="secondary"`** now has brand-colored text. Use `tertiary` for the old neutral look.
- **Defaults that changed**: `ButtonGroup` and `ToggleGroup` are attached (`detached` for the old look), `Toggle` has a background (`variant="ghost"`), `Accordion` opens one item at a time (`multiple`), `Pagination` shows numbers (`variant="compact"`), `Dialog` sits at the bottom on phones (`placement="center"`), `Spinner` defaults to 24px, and the `Sidebar` scrollbar hides at rest (`scrollbar="visible"`).
- **Redesigned looks**: `NumberField` groups, `Alert`, toasts, `Table`, `DataGrid`, `Dialog`, `Drawer` and the `Sidebar` items and titles look different.
- **React Native sizes**: controls, fields, `Avatar` and dialogs are larger on the new 48px touch scale. Check layouts that relied on the previous heights.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.32.0 @aurea-uds/core@0.32.0 @aurea-uds/fonts@0.32.0 @aurea-uds/icons@0.32.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.32.0
```
