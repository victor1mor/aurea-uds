---
title: Introduction
description: An open-source design system with one look for the web and for React Native, made to be read by people with low vision.
icon: book-open
---

Aurea is a design system with two outputs: the **web** (React components and plain CSS) and **mobile** (React Native components). The look is the same on both sides.

On the web, the interactive behavior comes from [Base UI](https://base-ui.com): focus trapping, Esc to close, focus return and scroll lock in dialogs, drawers, menus, popovers and tooltips. Aurea adds the look, the tokens and the components on top.

## Why Aurea?

**Readable first.** Contrast is measured by tests in both themes, focus is always visible, and touch targets are at least 44px on touch screens. Text uses Inter, titles use Sora, and code uses IBM Plex Mono.

**One look, two platforms.** The web and the native packages share the same tokens. A button on a phone and a button in a browser have the same color, shape and spacing.

**Every value is a token.** Color, radius, type and space come from tokens in the DTCG format, and the components read their values from them.

**Two themes, three densities.** Light and dark are equal citizens. Each one comes in compact, comfortable and spacious.

**Typed.** The React and React Native packages ship TypeScript types. On the web, even icon names are checked by the compiler.

**Light to import.** The web package is ESM. Components with a heavy engine (charts, data grid, code editor, calendar, QR code, dependency graph) live in their own entry points, with optional peer dependencies, so importing a `Button` never pulls them in.

## The identity

- Floating, independent surfaces. Cards, dialogs and panels have a 22px radius; the bottom sheet has 32px.
- Buttons with text, fields, filters and tabs are capsules.
- The primary color is a yellow that stays the same in light and dark.
- No borders around components: pieces are set apart by fill. The one exception is the outline card.
- No gradients.
- Icons from Phosphor, with the filled form on the selected item.

## The packages

| Package | What it holds |
|---|---|
| `@aurea-uds/react` | The React components, typed |
| `@aurea-uds/core` | The CSS (tokens and components) and a small plain-JavaScript behavior layer |
| `@aurea-uds/fonts` | Inter, Sora and IBM Plex Mono for the web, and the files for React Native |
| `@aurea-uds/icons` | The Phosphor icon sprite |
| `@aurea-uds/tokens` | The tokens in DTCG format, as CSS, JSON and a native module |
| `@aurea-uds/native` | The React Native components |
| `@aurea-uds/contracts` | The contract and the API surface of every component |

All seven packages are released together, with the same version number. What changed in each release is in the [changelog](https://github.com/victor1mor/aurea-uds/blob/main/CHANGELOG.md).

## FAQ

**Is Aurea free?**
Yes. It is open source under the Apache License 2.0, free for everyone. The fonts are under the SIL Open Font License 1.1 and the icons under MIT.

**Is it stable?**
Aurea is still in `0.x`. A minor release can break the API, and every break is written in the changelog. The road to `1.0` is on the [Roadmap](./docs-roadmap.html).

**Can I use it without React?**
Yes. Install `@aurea-uds/core` and `@aurea-uds/fonts` and use the CSS classes in plain HTML. See [Frameworks](./docs-frameworks.html).

**Does it work with Server Components?**
Yes. The main entry point can be imported from a Server Component, and the interactive modules carry `"use client"` themselves. Two proof apps, one with Server Components and one client-only, are built on every check.

**Is React Native the same package?**
No. `@aurea-uds/native` is a separate package with its own list of components and its own dependencies. It is not the web list with fewer items.

**What language are the built-in texts in?**
English by default. A Portuguese table ships with the packages, and any single sentence can be replaced through the provider.

## Get involved

- Questions, requests and bugs: [open an issue](https://github.com/victor1mor/aurea-uds/issues). Every issue is read; what makes sense joins the queue, with no promised date.
- Contributing: read [CONTRIBUTING.md](https://github.com/victor1mor/aurea-uds/blob/main/CONTRIBUTING.md).
- Security: follow [SECURITY.md](https://github.com/victor1mor/aurea-uds/blob/main/SECURITY.md) and do not open a public issue.
