---
title: Quick Start
description: Install the packages, load the fonts before the core, and wrap the app in the provider.
icon: rocket
---

## Requirements

- React 19 or newer, with `react-dom` 19 or newer. Components take `ref` as a plain prop, which is React 19 behavior.
- A bundler that reads the `exports` map of a package and imports CSS files, such as Vite or Next.js.

The packages are ESM. Using React Native? Skip to [React Native](#react-native): it is a different package.

## Install

```bash
pnpm add @aurea-uds/react @aurea-uds/core @aurea-uds/fonts @aurea-uds/icons
```

No React? `@aurea-uds/core` and `@aurea-uds/fonts` are enough. See [Frameworks](./docs-frameworks.html) for plain HTML.

## Import the styles

Import the fonts **before** the core. The core embeds no font.

```tsx
import "@aurea-uds/fonts/css";
import "@aurea-uds/core/css";
```

Put these two lines once, in the entry file of your app (for example `src/main.tsx` in Vite, or `app/layout.tsx` in Next.js).

## Add the provider

Wrap the app in `AureaProvider`. It hands out the default sentences, tells the components where the icon sprite is, and mounts what tooltips and toasts use.

```tsx
import {AureaProvider} from "@aurea-uds/react";

export default function App() {
  return <AureaProvider><Screen /></AureaProvider>;
}
```

The default sentences are in English. For Portuguese, pass the table that ships with the package, or replace single sentences:

```tsx
import {AureaProvider, ptBR} from "@aurea-uds/react";

<AureaProvider strings={ptBR}>…</AureaProvider>
<AureaProvider strings={{close: "Fechar"}}>…</AureaProvider>
```

## Set up the icons

The icons are one static SVG sprite. Copy `node_modules/@aurea-uds/icons/dist/aurea-icons.svg` to the folder your app serves as static files (`public/` in Vite and in Next.js).

By default the components look for it at `/aurea-icons.svg`, which only works when the app is served at the root of the domain. If yours is not, set the address once in the provider:

```tsx
<AureaProvider spriteUrl="/assets/aurea-icons.svg">…</AureaProvider>
```

Without the sprite, every icon of every component fails silently. More in [Icons](./docs-icons.html).

## Your first component

::: demo first-button

```tsx
import {Button} from "@aurea-uds/react";

<Button variant="primary">Save</Button>
```

Every component is also available by category, for example `@aurea-uds/react/actions` or `@aurea-uds/react/inputs`. Browse them all in [Components](./components.html).

## Theme and density

Aurea reads two attributes on the `html` element: `data-theme` (`light` or `dark`) and `data-density` (`compact`, `comfortable` or `spacious`). Write them in your markup so the first paint already has the right theme:

```html
<html data-theme="dark" data-density="comfortable">
```

To change them at runtime, use the `useAureaTheme()` hook or the [ThemeToggle](./themetoggle.html) component. More in [Dark Mode](./docs-dark-mode.html) and [Density](./docs-density.html).

## React Native

Mobile is another package, `@aurea-uds/native`, with its own list of components and its own dependencies. It is not the web list with fewer items. Do not install `@aurea-uds/react` or `@aurea-uds/core` in a React Native app.

```bash
pnpm add @aurea-uds/native react-native-svg react-native-safe-area-context
```

It needs React 19 or newer and React Native 0.76 or newer. For the text to use the Aurea fonts, add `@aurea-uds/fonts` and load its native files. The example below uses `useFonts` from Expo:

```tsx
import {AureaProvider, Button, Screen} from "@aurea-uds/native";
import {AUREA_FONTS, FONT_FAMILIES} from "@aurea-uds/fonts/native";
import {useFonts} from "expo-font";

export default function App() {
  const [ready] = useFonts(AUREA_FONTS);
  if (!ready) return null;
  return (
    <AureaProvider fontFamilies={FONT_FAMILIES}>
      <Screen scroll>
        <Button tone="brand">Save</Button>
      </Screen>
    </AureaProvider>
  );
}
```

The date, photo and file pickers need optional dependencies of their own. The package README lists them: [packages/native](https://github.com/victor1mor/aurea-uds/tree/main/packages/native).

## After you upgrade

Restart the dev server (`vite`, `next dev`) after upgrading Aurea. A server that was already running keeps serving the previous version, and the symptoms mislead: icons requested by old names, or components without the new feature. A restart is enough; there is no cache to delete.

## What's next

- [Frameworks](./docs-frameworks.html): Next.js, Vite, plain HTML and React Native.
- [Components](./components.html): every component, with its props table.
- [Theming](./docs-theming.html): tokens, themes and densities.
- [Blocks](./blocks.html): ready sections to drop into a page.
