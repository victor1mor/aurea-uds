# Icons

The Phosphor icon set, how to serve its sprite, the filled form for the selected item, and how to add your own drawing.

Aurea draws its icons from Phosphor Icons: 1,433 glyphs, each in a regular and a filled form. On the web they live in one SVG sprite, in the `@aurea-uds/icons` package. On React Native each glyph is its own module.

## Serve the sprite

The sprite is a static file. Copy it to where your app serves static files:

```bash
cp node_modules/@aurea-uds/icons/dist/aurea-icons.svg public/
```

Then tell the provider where it is, once:

```tsx
<AureaProvider spriteUrl="/aurea-icons.svg">
  <App />
</AureaProvider>
```

The default is `/aurea-icons.svg`, which only works when the app is served from the root of the domain. Under any other path, set `spriteUrl`, or every icon of every component fails without an error. If your bundler emits the file, pass the URL it gives you. A page that inlines the symbols itself passes `spriteUrl=""`, so the reference stays local.

## The Icon component

`Icon` draws one glyph. Its size follows the icon scale (`sm`, `md`, `lg`, `xl`), which stays the same in every density. It takes the color of the text around it.

```tsx
<Cluster>
  <Icon name="house" />
  <Icon name="house" weight="fill" />
  <Icon name="bell" size="lg" />
  <Icon name="bell" size="lg" weight="fill" />
</Cluster>
```

An `Icon` is always decorative: it renders with `aria-hidden="true"`. The meaning goes in text next to it, or in the `label` of an `IconButton`:

```tsx
<IconButton icon="gear" label="Settings" />
```

Most components take an icon by name too: `leadingIcon` and `trailingIcon` on `Button`, `icon` on `IconButton` and on navigation items, `leadingIcon` on menu items.

## The filled form

`weight="fill"` draws the filled form. Aurea uses it for the selected item, such as the active tab or the current menu item, and in alerts. The components switch it on their own, so you seldom set it by hand.

`weight="bold"` exists only for `x`, the glyph of `CloseButton`. Any other name asked in `bold` draws the regular form.

## Names are checked

The name is the Phosphor name, exactly as Phosphor writes it. TypeScript checks it in `Icon` and in the props that take an icon. A wrong name does not compile:

```tsx
const right = <Icon name="caret-down" />;
// @ts-expect-error: the Phosphor name is caret-down
const wrong = <Icon name="chevron-down" />;
```

The full API is on the [Icon](./icon.html) page.

## Your own icons

There are two ways to add a glyph that the set does not have, such as your logo.

### Pass a drawing

`Icon`, the icon props of `Button` and `IconButton`, and the node icons of `DependencyGraph` also accept a component that returns an `svg`. It receives Aurea's class and size, and inherits the color through `currentColor`. It has no filled form.

```tsx
import type {SVGAttributes} from "react";

function Router(props: SVGAttributes<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <rect x="3" y="13" width="18" height="7" rx="2" />
      <path d="M7 13V8M17 13V8" />
    </svg>
  );
}

<Button leadingIcon={Router}>Add router</Button>
```

### Add names to a sprite

If you serve your own sprite, declare its names once. From then on they type-check like the Phosphor names:

```tsx
declare module "@aurea-uds/react" {
  interface AureaIconNames { brand: true }
}

<Icon name="brand" />
```

The symbol id in the sprite is `i-` followed by the name. To mix two sprites on one page, pass `spriteUrl` on the single `Icon` that reads the second one.

## Plain HTML

Without React, point straight at the symbol. The id is `i-` plus the name, and `-fill` for the filled form:

```html
<svg class="icon" aria-hidden="true"><use href="/aurea-icons.svg#i-magnifying-glass"></use></svg>
<svg class="icon" aria-hidden="true"><use href="/aurea-icons.svg#i-house-fill"></use></svg>
```

## React Native

`@aurea-uds/native` has one module per glyph and per form, with the same names as the web sprite. Import each icon by its own path, so only the icons you use enter the bundle:

```tsx
import House from "@aurea-uds/native/icons/house";
import HouseFill from "@aurea-uds/native/icons/house-fill";
import {AureaProvider, criarRegistroDeIcones} from "@aurea-uds/native";

const ICONS = criarRegistroDeIcones({house: House, "house-fill": HouseFill});

<AureaProvider icons={ICONS}>
  <App />
</AureaProvider>
```

Components look icons up by name in this registry. Register the filled form under the `-fill` key; when it is missing, the regular form is drawn. A name that is not registered draws nothing, and a warning names it during development.

Color does not inherit on React Native. `Icon` uses the text color of the theme unless you pass `color`. For your own glyph, `criarGlifo` builds one from rectangles, circles and paths, and you declare its name in `AureaIconNames` from `@aurea-uds/native`.

## What is left out

Phosphor's brand logos (the names that end in `-logo`) are not in the set. Third-party trademarks do not belong in an Apache-2.0 library. The glyphs themselves are under the MIT license, with the notice in the package's `NOTICE` file.

## Next steps

- See the icon sizes on the [Tokens](./tokens.html) page.
- Learn how icons flip, or do not, in [RTL](./docs-rtl.html).
- Read about labels and contrast in [Accessibility](./docs-accessibility.html).
