---
title: Density
description: Three sizes for the same interface, compact, comfortable and spacious, switched with one attribute.
icon: arrows-in-line-vertical
sources: css:--control-h-*, css:--touch-control-h-*, css:--row-h, css:--card-pad, css:--section-gap, ts:useDensity
---

Density sets how tall the controls are and how much room the content gets. Aurea has three: `compact`, `comfortable` and `spacious`.

Density is its own axis. It does not depend on the theme or the brand: each theme comes in all three densities.

Colors, type, radius and icons do not change with the density. Only sizes do.

::: demo density-scale

```html
<div data-density="compact">
  <button class="btn btn-primary" type="button">Save</button>
</div>
<div data-density="comfortable">
  <button class="btn btn-primary" type="button">Save</button>
</div>
<div data-density="spacious">
  <button class="btn btn-primary" type="button">Save</button>
</div>
```

## Set the density

Put `data-density` on `<html>`:

```html
<html data-theme="dark" data-density="compact">
```

Without the attribute, the page gets the comfortable sizes. They are the default values of the tokens.

In React, [AureaProvider](./aureaprovider.html) can own the density:

| Prop | What it does |
|---|---|
| `density` | The density, controlled |
| `defaultDensity` | The first density, uncontrolled |
| `onDensityChange` | Called with the new density |

To read or change it from a component, use `useAureaTheme()`, which returns `density` and `setDensity`. Inside a provider, `useDensity()` does the same through the provider. See [useAureaTheme](./useaureatheme.html) and [useDensity](./usedensity.html).

```tsx
import {Button, useAureaTheme} from "@aurea-uds/react";

export function DensityButtons() {
  const {setDensity} = useAureaTheme();
  return (
    <>
      <Button onClick={() => setDensity("compact")}>Compact</Button>
      <Button onClick={() => setDensity("comfortable")}>Comfortable</Button>
      <Button onClick={() => setDensity("spacious")}>Spacious</Button>
    </>
  );
}
```

Without React, the script in `@aurea-uds/core/js` has `window.Aurea.setDensity("compact")`.

Aurea does not save the density. Like the theme, remembering it is the application's job.

## The tokens

These tokens change with the density. Every other token stays the same.

| Token | Compact | Comfortable | Spacious |
|---|---|---|---|
| `--control-h-xs` | `1.5rem` | `1.625rem` | `1.75rem` |
| `--control-h-sm` | `1.75rem` | `2rem` | `2.25rem` |
| `--control-h-md` | `2rem` | `2.25rem` | `2.5rem` |
| `--control-h-lg` | `2.25rem` | `2.5rem` | `2.75rem` |
| `--control-h-xl` | `2.75rem` | `3.125rem` | `3.5rem` |
| `--row-h` | `2.625rem` | `3rem` | `3.375rem` |
| `--card-pad` | `0.75rem` | `1rem` | `1.25rem` |
| `--section-gap` | `1.125rem` | `1.5rem` | `2rem` |
| `--touch-control-h-sm` | `2.25rem` | `2.5rem` | `2.75rem` |
| `--touch-control-h-md` | `2.75rem` | `3rem` | `3.25rem` |
| `--touch-control-h-lg` | `3.25rem` | `3.5rem` | `3.75rem` |

## What follows the density

- **Controls**, through `--control-h-*`: buttons, icon buttons, inputs, selects, textareas, tabs, segmented controls, menu items, list box items, pagination, sidebar items and switches.
- **Table rows**, through `--row-h`: the height of each cell.
- **Cards**, through `--card-pad`: the padding inside a card.
- **Your own layout**, through `--section-gap`: the space between sections. No web component uses it, so it is there for you.
- **React Native controls**, through `--touch-control-h-*`: the touch scale of the native buttons.

To size something of your own with the density, read the same tokens:

```css
.my-toolbar {
  min-height: var(--control-h-md);
  padding: var(--card-pad);
}
```

## Touch screens

On a touch screen, buttons, tabs, segmented controls, pagination and navigation list rows are at least 44px tall, whatever the density. The compact density never makes a target smaller than a finger.

This minimum is the token `--target-min` (`2.75rem`).

## A different density for one part

The selectors are attributes, so `data-density` works on any element, not only `<html>`. Everything inside follows it.

```html
<html data-theme="light" data-density="comfortable">
  <body>
    <aside data-density="compact">A dense side panel</aside>
  </body>
</html>
```

## In React Native

The native `AureaProvider` from `@aurea-uds/native` takes `density`, `defaultDensity` and `onDensityChange`. Without them, the density is comfortable.

- `useAureaTheme()` returns `density` and `setDensity`.
- `useAureaTokens()` returns the sizes of the current density in dp: `t.size.controlHMd`, `t.size.rowH`, `t.size.cardPad`, `t.size.touchControlHMd`.
- The native buttons use the touch scale, `touchControlH*`, which is taller than the web scale.

```tsx
import {AureaProvider} from "@aurea-uds/native";

export function App({children}: {children: React.ReactNode}) {
  return <AureaProvider defaultDensity="compact">{children}</AureaProvider>;
}
```
