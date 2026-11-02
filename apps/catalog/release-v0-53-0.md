# v0.53.0

Clickable cards that lift on hover, a framed icon for EmptyState on the web, and the small shadow now shows in the dark theme. Also ships v0.52.1.

Two new options and one visible change in the dark theme. This release also ships v0.52.1 (the docs layout gap from 768, `DataList` wrapping long words, and two tall `SegmentedControl` sizes).

## New

- **`Card lift`** — on a clickable card (`variant="interactive"`), the card rises 4px with a medium shadow on hover, instead of changing its fill. It stays still for people who ask for less motion. Web only.
- **`EmptyState framed`** — the icon sits inside a round frame of 64, the same one the React Native `EmptyState` always has. Without it, the icon stands alone, as before.

## Changed

- **The small shadow (`--shadow-sm`) now shows in the dark theme.** In dark it is one layer, 1px down, 3px blur, black at 45%; in light it stays the same. Every piece that uses it changes in dark: the selected capsule of tabs and segmented controls, the current sidebar item, fields and the surface accordion. Web and React Native.
- **React Native reads shadows per theme**: `@aurea-uds/tokens/native` exports `themeShadowLayers`, and the provider applies the theme's layers over the base ones.

## Breaking changes

- **`themes` from `@aurea-uds/tokens/native`**: a theme value can now be an `AureaShadow` (the dark theme has `shadowSm`). Code that read theme values as only colors or numbers has to handle it.

## Includes v0.52.1

Two fixes and two new sizes, all on the web.

### Fixed

- **`AppShell layout="docs"` with the pill**, from 768 to 1023 wide: the sidebar no longer touches the edge of the window. The columns sit 16 from the edges, lined up with the capsule, as they already did from 1024.
- **`DataList`**: a long word that does not fit (a long code name, for example) now wraps inside its cell instead of spilling out and making a narrow page scroll sideways.

### New

- **`SegmentedControl size="lg"` and `size="xl"`** — a 44 and a 48 capsule, for a switch that sits in a tall bar. `sm` (34) and `md` (40) stay as they were.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.53.0 @aurea-uds/core@0.53.0 @aurea-uds/fonts@0.53.0 @aurea-uds/icons@0.53.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.53.0
```
