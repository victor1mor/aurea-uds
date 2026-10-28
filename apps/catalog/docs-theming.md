# Theming

How Aurea's tokens become CSS custom properties, the three attributes that switch them, and how to change a value.

Aurea's look comes from tokens. The tokens live in one file, in the DTCG format, and a build turns them into CSS custom properties for the web and a JavaScript module for React Native.

Components never hold a color or a size of their own. They read the tokens. Change a token and every component that uses it follows.

## How it works

Three attributes switch the tokens. Each one is independent of the others.

| Attribute | Values | What it changes |
|---|---|---|
| `data-theme` | `light`, `dark` | Every color role |
| `data-density` | `compact`, `comfortable`, `spacious` | Control heights, table rows, card padding |
| `data-brand` | `ember`, `sun`, `honey`, `orange`, `magenta`, `violet`, `indigo`, `cobalt`, `cyan`, `turquoise`, `emerald`, `lime` | The color palette, in both themes |

Everything else (type, space, radius, motion, shadows) is set once on `:root` and is the same in every theme, density and brand.

Each group of tokens is emitted under its own selector:

```css
:root { /* type, space, radius, motion: the same everywhere */ }
[data-theme="dark"] { /* the dark color roles */ }
[data-theme="light"] { /* the light color roles */ }
[data-density="compact"] { /* the compact sizes */ }
[data-brand="cobalt"][data-theme="dark"] { /* the brand palette, dark */ }
```

```html
<html data-theme="dark" data-density="comfortable">
  <body>
    <button class="btn btn-primary" type="button">Save</button>
  </body>
</html>
```

## Quick start

Load the fonts, then the Aurea CSS, and put a theme on `<html>`.

```tsx
import "@aurea-uds/fonts/css"; // before the core
import "@aurea-uds/core/css";
```

```html
<html data-theme="light" data-density="comfortable">
```

`data-theme` is required: without it the color roles are not defined. `data-density` is optional: without it you get the comfortable sizes.

To switch the theme at run time, see [Dark Mode](./docs-dark-mode.html). For the density, see [Density](./docs-density.html).

## Naming pattern

- A name without a suffix is a fill: `--primary`, `--card`, `--success`.
- `-foreground` is the text on that fill: `--primary-foreground`, `--card-foreground`.
- `-hover` and `-active` are the fill under the pointer and while pressed.
- `-400` is a status color used as text, icon or bar on the page: `--success-400`.
- `-bg` is a soft status background: `--success-bg`.
- `-solid` is an opaque version of a see-through fill: `--fill-2-solid`.

The full list of color roles is on [Colors](./docs-colors.html).

## Brands

A brand is a second palette. It is set with `data-brand`, next to `data-theme`.

```html
<html data-brand="cobalt" data-theme="light">
```

- **A brand changes color only.** Type, radius, density, space and icons stay Aurea's in every brand.
- **A brand has a light and a dark palette.** The theme still works inside it.
- **Without `data-brand`, nothing changes.** You get Aurea as it is.
- **Inside Aurea's own palette, the yellow never changes.** It is the same in light and dark.

Aurea ships thirteen palettes. The default needs no attribute; the other twelve are set with `data-brand`.

| Brand | `data-brand` | Primary | Text on the primary |
|---|---|---|---|
| Aurea Gold | none (the default) | `#F0B100` | dark |
| Aurea Ember | `ember` | orange | white |
| Aurea Sun | `sun` | `#FACC15` | dark |
| Aurea Honey | `honey` | `#F5A524` | dark |
| Aurea Orange | `orange` | `#FF7A1A` | dark |
| Aurea Magenta | `magenta` | `#E0196E` | white |
| Aurea Violet | `violet` | `#7C3AED` | white |
| Aurea Indigo | `indigo` | `#4F46E5` | white |
| Aurea Cobalt | `cobalt` | `#0246F1` | white |
| Aurea Cyan | `cyan` | `#06B6D4` | dark |
| Aurea Turquoise | `turquoise` | `#14C8A8` | dark |
| Aurea Emerald | `emerald` | `#17C964` | dark |
| Aurea Lime | `lime` | `#A3E635` | dark |

- **The neutrals are Aurea's in every brand.** A brand changes the primary color and the roles built on it: links, focus, the selected control, the sidebar and the selection.
- **Aurea Ember keeps its own neutrals.**
- **Aurea Orange moves the warning color to honey,** so a warning never looks like the brand.
- **`currentStyle="brand-white"` on the bottom bar fails WCAG on the light primaries** (Gold, Sun, Honey, Orange, Cyan, Turquoise, Emerald, Lime), as it does on Aurea Gold.

A brand lives in the token file, next to the themes, and the build emits it with them — for the web and for React Native. In React Native the brand is a prop of the provider, with the same names: `<AureaProvider brand="cobalt">`.

## A theme for one part of the page

The selectors are attributes, not `:root`, so `data-theme` works on any element. Everything inside follows it.

```html
<html data-theme="light">
  <body>
    <section data-theme="dark">A dark band inside a light page</section>
  </body>
</html>
```

The components do the same for you:

- [Section](./section.html) takes `theme="dark"` or `theme="light"` for one band of a page.
- [Card](./card.html) with `variant="contrast"` puts the dark theme inside the card.

A brand set on an ancestor reaches a nested theme too: `[data-brand="cobalt"] [data-theme="dark"]` is part of the brand's selector.

## Overriding a token

All of Aurea's CSS sits in one cascade layer, named `aurea`. Any rule you write outside a layer wins over it, whatever the order of the files.

To change a role, redefine the custom property under the same selector:

```css
[data-theme="dark"] {
  --background: #181818;
  --card: #222222;
}
```

To change it in one place only, scope it:

```css
.landing-banner {
  --card-pad: 1.5rem;
}
```

Keep the pairs together. If you change a fill, check the text that sits on it. Aurea measures the contrast of its own values in both themes; it cannot measure yours.

## Token formats

The `@aurea-uds/tokens` package ships the same tokens in three forms.

| Import | What it is |
|---|---|
| `@aurea-uds/tokens/css` | The CSS custom properties alone, without the component styles |
| `@aurea-uds/tokens/json` | The DTCG source file |
| `@aurea-uds/tokens/native` | The JavaScript module that the React Native package reads |

You do not need `@aurea-uds/tokens/css` if you load `@aurea-uds/core/css`: the core already includes the tokens.

## In React Native

React Native has no CSS cascade, so the tokens come from the provider. Wrap the app in `AureaProvider` from `@aurea-uds/native`, then read the resolved tokens with `useAureaTokens()`.

```tsx
import {AureaProvider, useAureaTokens} from "@aurea-uds/native";
import {View} from "react-native";

function Box() {
  const t = useAureaTokens();
  return <View style={{backgroundColor: t.color.card, padding: t.size.cardPad}} />;
}

export function App() {
  return (
    <AureaProvider defaultTheme="light" defaultDensity="comfortable">
      <Box />
    </AureaProvider>
  );
}
```

- Names are camelCase: `--card-foreground` becomes `t.color.cardForeground`.
- `t.color` holds hex strings. React Native does not read OKLCH, so the hex form is the one that works.
- `brand` on `AureaProvider` picks one of the twelve brands (`"ember"`, `"cobalt"`…). Without it you get Aurea Gold. A card with `variant="contrast"` keeps the brand.
- `t.size` holds every number in dp: space, radius, type, heights.
- Outside an `AureaProvider`, the hooks throw. There is no cascade to fall back on.

## Variables reference

Every token, with its value in each theme, brand and density, is on the [Tokens](./tokens.html) page.
