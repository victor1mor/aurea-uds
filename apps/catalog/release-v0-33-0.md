# v0.33.0

RadioGroup on the web, a three-position ThemeToggle with a system preference, Card parts, soft buttons, a blurred Header, and popups that stay above fixed headers.

The new component is [RadioGroup](./radiogroup.html) on the web, with the same API as React Native. [ThemeToggle](./themetoggle.html) gets a three-position mode, and `AureaProvider` can follow the system color scheme. [Card](./card.html) gets composable parts, `Button` gets a soft appearance, and the [Header](./header.html) can blur its background. Popups no longer slide under a fixed header, and [CommandPalette](./commandpalette.html) now closes on Esc and outside click.

## New

### Components and props

- **`RadioGroup` on the web**: uses the React Native names (`value`, `onValueChange`, `orientation`, `disabled`, `invalid`) and `RadioGroup.Item` (the `Radio`). Options are native radio buttons with a shared name: Tab enters the selected one, and the arrow keys move and select.
- **`Radio` and `Switch` `description`**: a muted line under the label, like `Checkbox`.
- **`labelHidden` on `Switch`, `Radio` and `RadioGroup`**, as on `Checkbox`: the label leaves the screen and stays for screen readers.
- **`Switch` `indicatorPlacement="end"`**: the switch after the label, the same name as on the React Native `RadioGroup`. The default stays `"start"`.
- **`OTPField` `groupSize`** (a dash every N boxes, for example 3 + 3) and **`variant="secondary"`**.
- **`Button` `appearance="soft"`**: a light background in the tone and text in the tone, in every tone. Also the **`variant="danger-soft"`** shortcut and **`quiet`** (muted text, one step smaller).
- **`Button` `kbd` accepts a list** (`["Ctrl", "K"]`): one key cap per key, and screen readers get the combination (`Control+K`). A string still renders one key cap.
- **`Button` `leadingIcon` and `trailingIcon`, and `IconButton` `icon`**, accept your own icon component (`AureaIcon`), as `Icon` already did. Icon names work as before.
- **`Card` parts**: `Card.Header`, `Card.Title` (an `h3`), `Card.Description`, `Card.Content` and `Card.Footer`, with 12px between them.
- **`Alert` `action`**: a button before the close X. On phones it moves below the text.
- **`ListBox` item `kbd`**: a shortcut at the end of the row.
- **`Avatar` `tone` and `emphasis="soft"`**: the color of the fallback letters or icon, and a light background in the tone.
- **`Badge` `emphasis="flat"`**: the usual tone without the surrounding line.
- **`ColorSwatch` with options, `showLabels`**: the name of each color under it. The whole label selects.
- **Section dividers** in `ListBox`, in `Select` with groups and in the comboboxes.
- **`CommandPaletteShell` `onClose` and `label`**: the shell is now the same dialog as `CommandPalette`. Esc and outside click call `onClose`, Tab stays inside, and focus returns to the trigger. Without `onClose`, it stays open until `open` changes.

### Header and layout

- **`Header` `size="sm"`**: 56px tall, 6px between actions.
- **`Header` `blurred`**: a background that blurs what scrolls behind it. It stays solid for users who ask the system for reduced transparency.
- **`Header` `menuActions`**: actions that only the mobile menu shows.
- **`Header` `itemsJustify`** (`"end"`, the default, or `"start"`): with `"start"`, the links sit next to the brand and the actions at the other end.
- **`Section variant="footer" layout="inline"`**: a one-line footer.

### Theme

- **`ThemeToggle mode="light-dark-system"`**: a three-position theme switch.
- **`AureaProvider` preference `"system"`**: follows `prefers-color-scheme` and changes with it. Also `onThemePreferenceChange` and the `AureaThemePreference` type.
- **New base tokens**, the same in both themes: `--white` and `--black`.

## Fixed

- **`CommandPalette` closes on outside click, and on Esc wherever focus is.** It now lives in a dialog: it traps Tab, locks background scrolling and returns focus to the trigger. Class names stay the same (`.command-overlay`, `.command-palette`).
- **Fields with a leading icon**: the text sat 24px from the icon (28px at `lg`), with 13px on the other side. Now it is 12px, the icon, 12px; in search fields, 12px, the magnifier, 8px. This applies to every `InputGroup` with an inline leading addon (`SearchField`, `CommandPaletteShell`, the `DataGrid` search), including responsive values.
- **`Card.Header`**: the title and description were 16px apart because of an old `.card-header` rule.
- **Popups slid under a fixed header**: their stacking layer was on a static inner box, where it has no effect. The 13 popups (popover, menus, `Select` and `Combobox` lists, tooltip, hover card, calendar) now carry the `positioner` class with the layer on it.
- **The three-position `ThemeToggle`**: the selected option is white in both themes, the moon and monitor are pure black (21:1), and the selected sun is the brand yellow.
- **Soft buttons**: danger, success, warning and info now use the alert backgrounds (`--danger-bg`, `--success-bg`, `--warning-bg`, `--info-bg`) and 8% of the tone on hover. The `info` label had dropped to 4.10:1 in the light theme; the worst case is now 5.08:1 at rest and 4.61:1 on hover. The general tone hover rules no longer paint over the soft button.
- **`AureaProvider`** only queries the system color scheme when the preference is `"system"`.
- **`Button` docs**: they said the default variant was `secondary` and did not list `tertiary`. The default is `tertiary`.

## Breaking changes

- **`AureaStrings` (web) has four new keys**: `themeChoice`, `themeLight`, `themeDark` and `themeSystem`. If you build the whole object yourself (your own translation), add them.
- **Component `category` groups changed** in the registry: 15 groups in alphabetical order, then AI & Agents, Code and Communication. If you filter components by the old group names, use the new ones.
- **`CommandPalette` and `CommandPaletteShell` render in a portal**, like `Dialog`. Tests that looked for the box inside the component's container need to look in the document.
- **`Button` types**: `kbd` is now `string | readonly string[]`, and `leadingIcon` and `trailingIcon` are `AureaIcon`. Code that reads these props expecting `string` or `IconName` needs to accept the rest.
- **The `.card-header` CSS class** is no longer an inline row header (with a 16px gap and 16px below). It is now the column of `Card.Header`. For a row with an action on the right, use `Cluster`.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.33.0 @aurea-uds/core@0.33.0 @aurea-uds/fonts@0.33.0 @aurea-uds/icons@0.33.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.33.0
```
