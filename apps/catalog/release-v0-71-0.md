# v0.71.0

The reference defaults — a primary Button, a neutral Alert, a Drawer from the bottom, a ConfirmDialog that ignores Escape, and secondary Tabs that fill the row.

## ⚠ May break

- **A `Button` with no `variant`, `appearance` or `tone` is now the primary button**, on the web and on native. It used to be `tertiary` (web) and the neutral fill (native). Write `variant="tertiary"` (web) or `tone="neutral"` (native) to keep the grey one. Passing only one axis keeps the other as before, so `appearance="ghost"` alone does not turn yellow. A `ButtonGroup` with no `variant` follows the button. A button with `pressed` and no axis stays the grey one, so off and on still look different. `IconButton` and `ToolbarButton` do not change.
- **An `Alert` with no `variant` or `state` is now `neutral`**: the icon and the title in the text colour. The blue one is still `variant="info"`. If you wrote a `Record<AlertVariant, …>` (or `AureaAlertVariant` on native), add the new key. The native `AureaToastType` does not gain `neutral`.
- **A web `Drawer` with no `side` now rises from the bottom.** It used to open from the right. The native `Drawer` still opens from the right; the panel that rises from the bottom on native is `BottomSheet`.
- **The web `ConfirmDialog` no longer closes on Escape.** The decision is made with its two buttons only (a click outside already did nothing). On native, the Android back button still closes it.

## Changed

- **`Tabs variant="secondary"`, laid flat: the tabs fill the row** and share it equally, never narrower than their label; when they do not fit, the row scrolls. On native, each tab grows from its label. Vertical and primary tabs do not change.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.71.0 @aurea-uds/core@0.71.0 @aurea-uds/fonts@0.71.0 @aurea-uds/icons@0.71.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.71.0
```
