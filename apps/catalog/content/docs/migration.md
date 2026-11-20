---
title: Migration
description: The old names that leave in 1.0, what replaces each one, and how to move before you upgrade.
icon: arrow-fat-lines-up
sources: none
---

Version 1.0 removes a short list of old names. Each one has been deprecated for several versions and has a replacement. All of them still work in `0.x`, so you can move to the new names today and upgrade to 1.0 without anything breaking.

## Before you upgrade

1. Upgrade all seven packages together, to the same version.
2. Search your code for each old name below and replace it.
3. After the upgrade, run the TypeScript compiler: it flags every `pressed` left. It cannot flag a CSS variable, so search your stylesheets too.

## What leaves in 1.0

| Old name | Use instead | Where |
|---|---|---|
| `--text-md` | `--text-sm` | CSS |
| `textMd` | `textSm` | React Native |
| `--font-editorial` | `--font-ui` | CSS |
| `font.editorial` | `font.ui` | React Native |
| `--brand-yellow-foreground` | `--brand-yellow-ink` | CSS |
| `--brand-yellow-text` | `--foreground` | CSS |
| `pressed` on `Button` and `IconButton` | `Toggle` | React |

## From pressed to Toggle

With `pressed`, the button only paints the on state and you keep the state yourself. `Toggle` keeps the state, reports each change and requires an accessible name when it shows only an icon.

```tsx
// Before
<Button pressed={on} onPress={() => setOn(!on)}>Bold</Button>

// After
<Toggle pressed={on} onPressedChange={setOn}>Bold</Toggle>
```

## The yellow text color

`--brand-yellow-text` has no direct replacement: in the light theme, yellow is never a text color. Use the text color, `--foreground`, and let the yellow mark the element as a background, an underline or an indicator.

## Old names that stay

These names are older than the current ones but are not deprecated for removal. They keep working in 1.0, and you do not need to change them:

- `Topbar`, the old name of `Header`, on the web and in React Native;
- `MenuItemDef`, the old type of a menu item, now `MenuEntry`;
- the `BottomNav` variants `flat`, `surface`, `pill` and `dock`, now `variant` with `indicator`;
- `onClick` on the web, which works the same as `onPress`.

## After 1.0

The [versioning rules](./docs-versioning.html) apply: a name is deprecated in a minor release first and removed only in the next major one.
