# v0.62.0

The new Aurea logo, an icon prop on the native IconButton, a horizontal Accordion that opens its first item, and https-only embeds.

## ⚠ May break compilation

- **Native `IconButtonProps` is now a union type** (the icon by `name` or by `icon`). If you wrote `interface X extends IconButtonProps`, write `type X = IconButtonProps & {…}` instead. Using the component does not change.

## Added

- **`icon` on the native `IconButton`**, the same name as on the web. `name` still works.

## Changed

- **A horizontal `Accordion` opens its first enabled item** when no `defaultValue` is given. The vertical one still starts closed.
- **`MediaEmbed` only renders `https:` addresses** for `src` and `href`. The native `DropdownMenu` only opens `https:`, `mailto:` and `tel:` links.
- Component docs no longer cite internal decision records.

## Site

- The new logo in the header and as the tab icon.
- The accessibility page documents the Aurea Ember primary button in the light theme (white on orange, 3.08:1), kept to match the system the Ember palette comes from.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.62.0 @aurea-uds/core@0.62.0 @aurea-uds/fonts@0.62.0 @aurea-uds/icons@0.62.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.62.0
```
