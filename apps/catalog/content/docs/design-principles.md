---
title: Design Principles
description: The ten rules behind every Aurea component, and how each one is checked.
icon: book
---

Aurea is a design system for React on the web and React Native. It follows ten principles. Each one comes from a recorded decision, and most of them are enforced by a test or a build check, not by convention.

## Core principles

### 1. Low vision first

Aurea is designed for people who see poorly, and that choice shapes the rest of the system. Focus is always visible. Touch targets are at least 44px. Contrast is measured in the browser, not estimated.

Where the identity and legibility pull in different directions, the trade-off is written down, with its numbers. See [Accessibility](./docs-accessibility.html).

### 2. Tokens are the single source

Every colour, radius, font, weight, line height and space comes from a token. The tokens live in one file in the DTCG format (`$value` and `$type`). The CSS is one output of that file. The object the native package reads is another.

A raw number in a component is treated as a defect. The build ratchets raw pixel, radius, font and weight values, so a new one fails.

```css
.my-panel {
  border-radius: var(--radius-card);
  padding: var(--space-4);
  background: var(--card);
}
```

See [Tokens](./tokens.html).

### 3. A shape you can recognise

The geometry is fixed and shared by every component.

- Surfaces float. Cards, dialogs and panels have a 22px corner (`--radius-card`).
- The sheet that rises from the bottom has a 32px corner (`--radius-sheet`).
- Text buttons, fields, filters and tabs are capsules (`--radius-control`).
- A button that holds only an icon is a circle, at every size, on both targets.

Nothing is square.

### 4. No lines

Aurea components do not draw borders. Every border colour is transparent. The border width stays, so no measurement changes.

What a line used to separate is separated by a fill instead. The fills are the text colour, made translucent: `--fill-1` at 6%, `--fill-2` at 10%, `--fill-3` at 20%. Because they are translucent, they stay visible on any surface. Where something passes behind a piece, the opaque version is used (`--fill-2-solid`, `--fill-3-solid`).

Fields are the one exception in the light theme: a field on the page is white, with a soft shadow (`--shadow-sm`). Inside a white surface it keeps the translucent fill, and in the dark theme nothing changes.

Two lines remain, by decision:

- the outline card, `Card variant="outline"`, with a light line;
- the full-width line under the area tabs of a site header (`Header` with `tabs` and `divider`).

The focus ring is not a border. It stays.

### 5. No gradients

Aurea uses no gradients, including functional ones such as progress bars. Depth comes from surface and space. Gradients also disappear when a user forces high-contrast colours.

There is one exception: the colour pickers paint the colours you choose from (the `ColorArea` and the colour track of the `Slider`). That code lives in one file. The validator fails the build if a gradient appears in the stylesheet, the site or any other component file.

### 6. The yellow does not change

The brand yellow is `oklch(0.795 0.184 86.047)`. It is the same in the dark and the light theme.

A brand (`data-brand`) is a separate axis from the theme. A brand redefines colour and nothing else: type, radius, density, spacing and icons stay Aurea's. Without `data-brand`, nothing changes.

See [Colors](./docs-colors.html) and [Theming](./docs-theming.html).

### 7. Meaning before appearance

A button has two independent axes. `appearance` says how it is drawn. `tone` says what it means.

```tsx
<Button appearance="solid" tone="brand">Save</Button>
<Button appearance="outline" tone="neutral">Edit</Button>
<Button appearance="ghost" tone="danger" leadingIcon="trash">Delete</Button>
```

| Axis | Values |
|---|---|
| `appearance` | `solid`, `outline`, `ghost`, `link`, `nav`, `soft` |
| `tone` | `neutral`, `brand`, `danger`, `success`, `warning`, `info` |

If two different intentions end up looking the same, the meaning wins and gets its own token. The API does not degrade in silence: a value you ask for is the value you get.

### 8. Behaviour from a proven engine, skin from Aurea

Aurea does not reimplement focus, keyboard or ARIA. On the web, behaviour comes from Base UI and the skin is entirely Aurea's: no engine style reaches the core stylesheet. On native, components are built on React Native primitives, with a plain `StyleSheet` and Aurea's own theme provider.

Presentation is CSS first. When a prop changes semantics, keyboard or ARIA (for example, the orientation of `Tabs`), JavaScript resolves it, so the drawing and the behaviour never disagree.

### 9. One API across web and native

Props that exist on both targets have the same name and the same values. `tone`, `appearance` and `size` mean the same thing in `@aurea-uds/react` and `@aurea-uds/native`.

```tsx
// Web
import {Button} from "@aurea-uds/react";
<Button appearance="solid" tone="brand" size="md">Save</Button>

// React Native
import {Button} from "@aurea-uds/native";
<Button appearance="solid" tone="brand" size="md" onPress={save}>Save</Button>
```

The scale is adapted to each target. Web controls are 32, 36 and 40px tall (`sm`, `md`, `lg`, comfortable density). Native controls use a scale made for the finger: 40, 48 and 56 (`--touch-control-h-sm`, `-md`, `-lg`). Both scales move with the three densities: compact, comfortable and spacious. See [Density](./docs-density.html).

### 10. Grow by variation, never by removal

A component is corrected, never removed. A new need enters as a variant or a prop of a component that already exists. When a component is renamed, the old name keeps working: `Topbar` still works next to `Header`.

This keeps upgrades additive. Code written against an earlier version keeps compiling, except where a release note says otherwise.

## How the principles are kept

Each principle has a check behind it, so it cannot drift quietly.

| Principle | Checked by |
|---|---|
| Tokens only | the validator's raw-value ratchet |
| No lines | a unit test that reads the code in every state, and a browser sweep of every page in both themes |
| No gradients | the validator, on the stylesheet, the site and the component code |
| Round icon-only buttons | a geometry test, in the three densities |
| One focus line | a sweep that tabs through every preview |
| Measured contrast | axe on every page, in both themes |

The site sweeps run in Chromium, Firefox and WebKit.
