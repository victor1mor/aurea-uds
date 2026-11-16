# v0.72.0

The system theme — a page without data-theme follows the computer's light or dark setting, and is light when it says nothing.

## ⚠ May break

- **On native, when the device does not report a theme, an `AureaProvider` without `theme` is now light.** It used to be dark. When the device reports one, nothing changes: the provider still follows the device.
- **On the web, in the browser, `useAureaTheme` on a page without `data-theme` now returns the system theme** (`"light"` or `"dark"`) instead of `null`. On the server it is still `null`.

## Changed

- **A page without `data-theme` on `<html>` follows the computer's light or dark setting** (`prefers-color-scheme`), and is light when the computer says nothing. This is pure CSS, with no script. It used to have no colors at all. It works with every brand, including Aurea Ember. A part of the page with its own `data-theme` keeps it, and a page that writes `data-theme` does not change.
- **Toggling the theme on a page that follows a dark system goes to light on the first click** — in `ThemeToggle`, `useAureaTheme`, the `AureaProvider`'s `toggleTheme` and `window.Aurea.toggleTheme`. Before, the first click went to dark and nothing changed on screen.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.72.0 @aurea-uds/core@0.72.0 @aurea-uds/fonts@0.72.0 @aurea-uds/icons@0.72.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.72.0
```
