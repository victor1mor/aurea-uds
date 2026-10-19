# v0.10.0

Web layout additions for Topbar, AppShell, Field and Card, a clearer current item in the Sidebar, and a fix for a stretched top bar.

A web release. `Topbar`, `AppShell`, `Field` and `Card` get new layout options, and the current item in the side navigation is easier to spot. The current-item change is visual, so check your navigation after upgrading.

## New

- **[`Topbar`](./topbar.html) `divider`**: a thin line under the flush bar (`variant="flush"`). Ignored on the other variants, which already float with their own border.
- **[`AppShell`](./appshell.html) `topbarDivider` and `contentVariant="plain"`**: `plain` removes the box (background, border, radius and padding) around the content, for screens that bring their own cards.
- **[`Field`](./field.html) `description`**: supporting text below the control, linked through `aria-describedby` in the order hint, description, error. `hint` stays next to the label.
- **[`Card`](./card.html) `orientation="horizontal"` and `Card.Media`**: a list layout with a 96-pixel cover on the left (`--space-24`) and text on the right. In vertical cards, `Card.Media` as the first child sits flush with the top edge, clipped to the 22 radius.

## Changed

- **The current item in [`Sidebar`](./sidebar.html) and `AppShell`** now uses the sidebar's accent colour for text and glyph, with a 2-pixel underline. It used to be only a grey background. Contrast passes AA in both themes. In the collapsed sidebar the underline fits the narrow rail.

## Fixed

- **`AppShell` stretched the top bar on short pages.** With no explicit rows, the grid shared the leftover height between the bar and the content; on narrow screens the bar grew from 134 to 414 pixels at 375 wide. The leftover now goes to the content row.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.10.0 @aurea-uds/core@0.10.0 @aurea-uds/fonts@0.10.0 @aurea-uds/icons@0.10.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.10.0
```
