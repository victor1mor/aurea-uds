# v0.6.0

Nine new web components, menus with submenus, checkboxes and radio groups, new hooks, and one breaking change: size on field components is now sm, md or lg.

This release adds nine components, three hooks, a richer menu model and more control over `Combobox`, `NumberField` and `Tabs`. It has one breaking change: `size` on the field family is now Aurea's `sm`/`md`/`lg` step instead of the HTML attribute. Several fixes cover callbacks, field sizes, the skip link and color contrast in the `lory` brand.

## New

- **[`AspectRatio`](./aspectratio.html)**: a box that keeps its proportion at any width.
- **[`Collapsible`](./collapsible.html)**: one section that opens and closes, with the open state owned by your app.
- **[`ContainerScope`](./containerscope.html)**: declares the container that container-responsive values measure against.
- **[`InputGroup`](./inputgroup.html) and [`InputGroupAddon`](./inputgroupaddon.html)**: a box that looks like a field and holds the control plus what is attached to it: an icon, a prefix, a button.
- **[`Label`](./label.html)**: the field label on its own, for when you are not using `Field`.
- **[`Menubar`](./menubar.html)**: an application menu row, where an open menu hands over to its neighbor.
- **[`PasswordField`](./passwordfield.html)**: a password field whose show/hide control announces what it does.
- **[`ToggleGroup`](./togglegroup.html)**: several toggles sharing one state, with arrow-key navigation.
- **New hooks**: [`useTheme`](./usetheme.html) and [`useDensity`](./usedensity.html) read and switch theme and density inside `AureaProvider`; [`useValorResponsivo`](./usevalorresponsivo.html) resolves a `Responsive<T>` to the value that applies now.
- **Now documented as public API**: `useAureaStrings`, `useAureaTheme`, `usePortalContainer`, `useReorder`, `useSpriteUrl` and `useToast`, which already shipped in v0.5.0.
- **Menu entries**: [`DropdownMenu`](./dropdownmenu.html), [`ContextMenu`](./contextmenu.html) and `Menubar` take a `MenuEntry` union: `link`, `checkbox`, `radio-group`, `group`, `submenu`, plain actions and the `"separator"` string. Submenus nest.
- **[`Combobox`](./combobox.html) groups**: `items` accepts flat options or `{label, items}` groups (do not mix the two in one list).
- **`Combobox` `empty`**: sets the text shown when nothing matches. `Combobox` also regains `size`.
- **[`NumberField`](./numberfield.html) `scrubbable`**: turns on the drag-to-change area; `scrubDirection` chooses the axis.
- **[`Tabs`](./tabs.html) `activateOnFocus`**: the default (`true`) switches the panel as the arrow keys move focus; `false` only moves focus, and Enter or Space activates. Useful when switching a tab loads data.
- **`Tabs` `loopFocus` and responsive `orientation`**: `loopFocus` decides whether the last tab wraps to the first.

## Fixed

- **Callbacks received an extra engine argument.** In seven components, `onValueChange`, `onOpenChange` and `onPressedChange` were called with a second, undeclared event-details argument. They are now called with only the declared arguments.
- **Field size steps did nothing.** `Input`, `SearchField`, `PasswordField`, `Select`, `Textarea`, `Checkbox`, `Radio`, `Switch` and `Combobox` rendered the same at `sm`, `md` and `lg`. The step now sets height, padding and type size.
- **[`AppShell`](./appshell.html) lost its skip link.** The first keyboard stop was the navigation, with no way past it. The link is back, and `<main>` receives focus when you use it.
- **[`DataGrid`](./datagrid.html) documentation now lists its keyboard support**: arrows, `Home`/`End`, `Control+Home`/`Control+End`, `PageUp`/`PageDown`, `Enter`/`F2` into a cell and `Escape` back out.
- **Keyboard documentation completed**: `BottomNav` (`Space`), `ToolPermission` (`ArrowUp`, `ArrowDown`, `Space`) and `CodeEditor` (`Enter`). `NavList` and `AppShell` keyboard notes no longer appear as if they were shortcuts.
- **The `lory` brand's status colors were below AA contrast**: `success`, `warning`, `danger` and `info` in the light theme and `danger` in the dark theme, the worst at 1.74:1. Only lightness changed; the hues are the same.

## Breaking changes

- **`size` on `Input`, `SearchField`, `Select`, `Checkbox`, `Radio` and `Switch` is now `Responsive<'sm' | 'md' | 'lg'>`.** In v0.5.0 these components passed the HTML `size` attribute through (a width in characters on `<input>`, a count of visible options on `<select>`).
- **What breaks**: `<Input size={30} />` and `<Select size={5} />` no longer compile, and a numeric `size` no longer reaches the page. To set a width, use CSS or wrap the field in a box with a width.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.6.0 @aurea-uds/core@0.6.0 @aurea-uds/fonts@0.6.0 @aurea-uds/icons@0.6.0
```
