# Aurea UDS

Aurea is a design system with two outputs: the web (`@aurea-uds/react` and the plain CSS of `@aurea-uds/core`) and React Native (`@aurea-uds/native`). The look is the same on both sides, and it is made for people with low vision.

## Read before you write code

- The documentation index is https://aureauds.dev/llms.txt. Every page is also Markdown, next to its HTML: a component page is `https://aureauds.dev/<name>.md`, with the component name in lowercase and no hyphens (`button.md`, `themetoggle.md`, `iconbutton.md`).
- The whole documentation in one file: https://aureauds.dev/llms-full.txt.
- Read the page of every component you use. Use only the props it lists.

## Web or React Native: ask first

The two targets have different packages and different component lists. React Native is not the web list with fewer items. Ask which one the app is before installing anything, and never install the web packages in a React Native app.

## Set up the web

```bash
pnpm add @aurea-uds/react @aurea-uds/core @aurea-uds/fonts @aurea-uds/icons
```

1. Import the fonts **before** the core, once, in the entry file: `import "@aurea-uds/fonts/css";` then `import "@aurea-uds/core/css";`.
2. Put `data-theme="light"` or `data-theme="dark"` on `<html>`. Without it the color roles are not defined. `data-density` (`compact`, `comfortable`, `spacious`) is optional; the default is comfortable.
3. Wrap the app in `AureaProvider` from `@aurea-uds/react`.
4. Copy `node_modules/@aurea-uds/icons/dist/aurea-icons.svg` to the folder the app serves as static files. If the app is not served at the root of the domain, set `spriteUrl` on the provider, or every icon fails silently.
5. React 19 or newer is required.

The main entry point works in Server Components; the interactive modules carry `"use client"` themselves. Six heavy modules live on their own entry points with optional peer dependencies: `@aurea-uds/react/chart`, `/data-grid`, `/calendar`, `/code-editor`, `/qrcode` and `/graph`. Install their peer only when you use them.

After upgrading Aurea, restart the dev server.

## Set up React Native

```bash
pnpm add @aurea-uds/native react-native-svg react-native-safe-area-context
```

Wrap the app in `AureaProvider` from `@aurea-uds/native`. Load the fonts with `AUREA_FONTS` and pass `FONT_FAMILIES` (both from `@aurea-uds/fonts/native`) to the provider's `fontFamilies`. Icons are one module per glyph (`@aurea-uds/native/icons/<name>`), registered once with `criarRegistroDeIcones` and passed to the provider's `icons`. Events are `onPress`.

## Rules the look depends on

- **Props first.** A button has `appearance` (`solid`, `outline`, `ghost`, `link`, `nav`, `soft`) and `tone` (`neutral`, `brand`, `danger`, `success`, `warning`, `info`); `variant` is a shortcut for common pairs. Reach for CSS only when no prop does the job.
- **Every value is a token.** Use `var(--space-4)`, `var(--radius-card)`, `var(--text-sm)`, `var(--card)`, never a raw pixel size or a hex color. The list is on https://aureauds.dev/tokens.html.
- **No lines.** Aurea draws no borders around pieces. To set something apart, use a translucent fill: `--fill-1`, `--fill-2`, `--fill-3`.
- **No gradients.**
- **Do not recolor the brand.** The yellow (`--primary`) is the same in both themes. Another palette comes in as a brand (`data-brand`), not by overriding the yellow.
- **Pair fills with their text.** `--card` with `--card-foreground`, `--primary` with `--primary-foreground`. Never paint text with a status fill (`--success`, `--warning`, `--destructive`, `--info`); text, icons and bars on the page use the `-400` pair (`--success-400`).
- **Icons are Phosphor names**, checked by TypeScript: `caret-down`, not `chevron-down`. The selected item uses the filled form; the components switch it themselves.
- **Shapes:** cards and dialogs are rounded (22px), the bottom sheet 32px, text buttons, fields and tabs are capsules, an icon-only button is round. Do not square them.
- **Your CSS wins without `!important`.** All of Aurea's CSS sits in the `aurea` cascade layer, so unlayered app CSS overrides it.

## Accessibility you must keep

- `IconButton` needs `label`: a button with only an icon has nothing else to announce.
- Wrap form controls in `Field` with `label` (and `hint` or `error` when there is one).
- Do not shrink touch targets below 44px, and keep the focus ring visible.
- Do not put a pressable element inside a React Native piece that is one accessible element.

## When something is missing

Look for a variation of an existing component first (a `variant` value or a prop). Read the component page before building your own piece.
