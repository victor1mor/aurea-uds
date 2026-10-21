# v0.37.0

Line numbers and syntax colors for CodeBlock, a brand blue as the accent text in the light theme, and a visible disabled state in seven components.

This release adds line numbers and syntax colors to [CodeBlock](./codeblock.html). In the light theme, the accent text is now a brand blue; the yellow stays the brand. Disabled [Checkbox](./checkbox.html), [Radio](./radio.html), [Switch](./switch.html), [Collapsible](./collapsible.html) and [InputGroup](./inputgroup.html) now look disabled.

## New

- **`CodeBlock` line numbers**: `lineNumbers` shows the number of each line in a column on the left. The numbers are drawn by CSS, so they are not copied with the code and screen readers skip them.
- **`CodeBlock` syntax colors**: `highlight` takes a function that colors the code. Pass `highlightCode` from the new module `@aurea-uds/react/code-highlight`, which colors tsx, ts, jsx, js, css, html, json and bash with the same engine as [CodeEditor](./codeeditor.html). The grammars are optional peer dependencies (`@lezer/javascript`, `@lezer/css`, `@lezer/html`, `@lezer/json` and `@codemirror/legacy-modes`): install them only if you use the colors. Without the two props, the markup is the same as before.
- **`brand-blue` token** (`#0246f1`): the second brand color, used as the accent text of the light theme.

## Changed

- **The accent text in the light theme is the brand blue**: `link`, `link-hover`, `primary-emphasis` and `primary-outline`, and `sidebar-primary`, which follows `primary-emphasis`. It measures 6.12:1 on the page background, 6.67:1 on a card and 5.59:1 on a field. The yellow stays the brand: the primary button, checked controls and the accent of the dark theme do not change. Brands set with `data-brand` keep their own colors. Web and React Native.
- **The current [Sidebar](./sidebar.html) item in the light theme looks like the primary button**: a yellow background with dark gray text (8.13:1) and no underline. A count badge inside it uses the same dark text. The dark theme and other brands do not change.
- **The solid primary [Badge](./badge.html) is filled with the primary color**, the yellow, instead of the accent. It looks the same as before.

## Fixed

- **Disabled `Checkbox`, `Radio` and `Switch` look disabled.** The `disabled` attribute reached the input, but nothing changed on screen. The whole control, mark and label, now fades to 50% and shows a not-allowed cursor. This also covers the options of a disabled `CheckboxGroup` and `RadioGroup`.
- **A disabled `Collapsible` trigger** fades and no longer lights up on hover.
- **A disabled field inside `InputGroup`** fades the whole group, including the icon. A disabled button in an addon, such as a clear button, does not.
- **[AutomationCard](./automationcard.html) with `enabled={false}` recedes**, the same as an automation without `enabled`.
- **[CodeEditor](./codeeditor.html) content says it takes the keyboard** (`tabindex="0"`, editable and read-only). With code taller than the editor, the area scrolled but nothing inside it was announced as focusable. Tab order does not change; in read-only mode, this is what lets the keyboard reach the code to scroll it.
- **Component metadata** (`@aurea-uds/contracts`): 56 entries said React Native support was planned for components that the native package already exports; they now say `stable`. Six states that were listed but are not implemented were removed: the indeterminate `Checkbox`, disabled tabs in `Tabs` and `SegmentedControl` on the web, the buffering state of `MediaPlayer`, the `Slider` hover and the disabled `Field`.

## Breaking changes

- **Four color tokens have new values in the light theme**: `link`, `link-hover`, `primary-emphasis` and `primary-outline`. `sidebar-primary` follows `primary-emphasis`. If your own screens use them, they turn blue in the light theme.
- **`AutomationCard` no longer writes `data-enabled="false"`.** The attribute is set only when the automation is on. If your CSS targets `[data-enabled="false"]`, use `:not([data-enabled])`.
- **Six states were removed from the component metadata** in `@aurea-uds/contracts`. If you read `states`, they are no longer there.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.37.0 @aurea-uds/core@0.37.0 @aurea-uds/fonts@0.37.0 @aurea-uds/icons@0.37.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.37.0
```
