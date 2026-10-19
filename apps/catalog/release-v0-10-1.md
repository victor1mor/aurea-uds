# v0.10.1

criarGlifo can now draw stroked shapes, so line-drawn logos work in React Native without importing an SVG library.

A small, additive React Native release: `criarGlifo` now draws with strokes as well as fills.

## New

- **Stroked shapes in `criarGlifo`**: each shape accepts `stroke`, `strokeWidth`, `strokeLinecap` and `strokeLinejoin`, with their SVG names.
- **`"currentColor"`** in `stroke` or `fill` uses the `Icon` colour, so the stroke follows the theme.
- **Paint on the whole drawing**: set the paint once for the glyph, like attributes on a root `<svg>`; a value on a single shape wins.
- Without `stroke`, nothing changes. Stroke width is in `viewBox` units, so it scales with the glyph.

```tsx
const Logo = criarGlifo({fill: "none", stroke: "currentColor", strokeWidth: 2,
                         strokeLinecap: "round", paths: ["M…"]});
```

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.10.1 @aurea-uds/core@0.10.1 @aurea-uds/fonts@0.10.1 @aurea-uds/icons@0.10.1
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.10.1
```
