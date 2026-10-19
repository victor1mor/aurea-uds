# v0.29.0

A Card that stands out in both themes, a colored accent strip on top of cards, and a fix for dark sections inside the lory brand.

This release adds two ways to make a card stand out, on the web and in React Native. `Card variant="contrast"` puts the dark theme inside a single card, and `Card accent` draws a thin colored strip along its top. Nothing was removed and no default changed.

## New

- **[`Card`](./card.html) `variant="contrast"`** (web and React Native): a card that stands out from the screen in both themes. In the light theme it is the dark theme's card, with no outline; in the dark theme it is the regular card with a yellow outline.
- **Dark theme inside the contrast card**: every child (text, badge, button, field) adjusts by itself. On the web the card carries `data-theme="dark"`; in React Native only its children get the dark tokens. The app theme (`useAureaTheme`) does not change, and anything that opens from inside (the `Select` list, a `Dialog`) opens in the app theme.
- **Contrast card interaction**: accepts `onPress` in React Native and `render` on the web. Do not use it in a list of choices: in the dark theme its outline looks like `selected`.
- **`Card accent`** (web and React Native): a 4-unit strip along the top in `brand`, `success`, `info`, `warning` or `danger`, using the full tone color, the same in both themes. It is decoration only; the card title still says what it is about. Works with `onPress`, with `accessible` and inside a `Grid`.
- **Token `--accent-width`** (4): the height of the accent strip. The regular border stays `--border-width`.

## Fixed

- **A dark section inside a `lory` brand page used the default Aurea dark colors.** `Section theme="dark"` (and now the contrast card) sets only the theme on the element, while the brand selector required brand and theme on the same element. The brand colors now apply when the theme is set inside the brand. The bug existed since v0.22.0.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.29.0 @aurea-uds/core@0.29.0 @aurea-uds/fonts@0.29.0 @aurea-uds/icons@0.29.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.29.0
```
