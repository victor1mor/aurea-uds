# v0.5.0

Brands arrive as a second axis next to the theme, starting with lory, and the sidebar now paints itself with its own tokens.

Brands are a new axis, separate from the theme. Set `data-brand` on the `<html>` element to choose a named palette, while `data-theme` keeps switching light and dark. The first brand is `lory`. Without `data-brand`, nothing changes.

## New

- **Brands, with `data-brand`.** Each brand carries both themes. A brand changes color only: type, radius, density, spacing and icons stay Aurea's.
- **The `lory` brand**: orange `#FF6600`, cool low-chroma neutrals and four status colors with soft backgrounds, 60 tokens per theme.
- **Using a brand**:

```html
<html data-brand="lory" data-theme="light" data-density="comfortable">
```

- **The Aurea yellow stays the same** in light and dark within the default brand.

## Fixed

- **[`Sidebar`](./sidebar.html) uses its own tokens.** The current item used page tokens, and resting items picked up the prose link color. It now uses `--sidebar-accent`, `--sidebar-accent-foreground` and `--sidebar-primary`.
- **`--sidebar-primary` in the light theme is the emphasis yellow**: the raw yellow measured 1.60:1 on the white panel. Each brand sets a value that reads on its own panel.
- **The sidebar group label** is now 70% of `--sidebar-foreground` instead of 58%, which was below AA on a light panel.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.5.0 @aurea-uds/core@0.5.0 @aurea-uds/fonts@0.5.0 @aurea-uds/icons@0.5.0
```
