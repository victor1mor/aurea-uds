---
title: Accessibility
description: What Aurea does for people with low vision, keyboard and screen-reader users, and how each part is checked.
icon: eye
---

Low vision is the first audience Aurea designs for. This page lists what the components do on their own, what the test suite checks, and the two places where Aurea knowingly falls short of WCAG.

## At a glance

| Area | What Aurea does | Checked by |
|---|---|---|
| Type | Atkinson Hyperlegible Next for text, the Mono for code | the fonts package |
| Contrast | measured in the browser, in both themes | axe on every page, a contrast matrix for buttons |
| Focus | one visible ring, 2px, on every focusable piece | a sweep that tabs through every preview |
| Touch | 44px targets on touch screens and on native | geometry tests, native unit tests |
| Keyboard | behaviour from Base UI, focus order follows the document | engine and focus-order tests |
| Screen readers | names, states and descriptions wired by the components | axe, native state tests |
| Motion | animations stop when the system asks for less motion | a global CSS rule, a native hook |
| Forced colours | focus and icons repaint in system colours | a forced-colours test |
| Text size | no page scrolls sideways with text at 200% | the site sweep |

## Readable type

The text font is **Atkinson Hyperlegible Next**. Code uses **Atkinson Hyperlegible Mono**. Both ship in `@aurea-uds/fonts`: WOFF2 for the web, TTF for React Native.

The family was made to increase legibility for readers with low vision. Letters that are easy to confuse, such as `I`, `l` and `1`, or `O` and `0`, have distinct shapes.

The selected item of a navigation (a tab, the current menu item, the bottom bar) switches its icon to the filled weight. The state changes shape, not only colour.

## Contrast

### Measured, not assumed

Contrast is checked on the colour the browser actually paints, after every token and colour mix is resolved.

- **axe** runs on every page of this site, in the dark and the light theme, with the WCAG 2.0 and 2.1 A and AA rules plus best practices. It runs in Chromium, Firefox and WebKit.
- A **contrast matrix** checks every `appearance` and `tone` of the button, in both themes.
- A unit test fails if text is ever painted with the background colour of a state. Filled state backgrounds (`--success`, `--info`, `--warning`, `--destructive`) are for fills; text, icons and bars on the page use their `-400` pair.
- Text on the brand yellow is dark grey (`brand-yellow-ink`, `#242424`), at 8.13:1, in both themes.

### Known trade-offs

Aurea has two documented gaps against WCAG. Both are deliberate project decisions, made with the numbers in front of them.

**1. Accent text in the light theme.** In the light theme, accent text and icons use the brand yellow itself: the current sidebar item, links, the primary badge, the current page of a pagination, the "today" of a calendar, and similar accents. The yellow measures **1.75:1** on the light page background, 1.91:1 on the white of a card and 1.60:1 on the grey of a field. WCAG asks for 4.5:1 for text (1.4.3) and 3:1 for icons (1.4.11). It does not pass.

The exception is exactly one colour in one theme: `--primary` used as text in the light theme. Any other colour that fails still fails the build, and the dark theme has no exception. Brands (`data-brand`) keep their own accent colours.

**2. Field boundaries.** Aurea draws no lines (see [Design Principles](./docs-design-principles.html)). Fields and controls are separated from the page by a translucent fill instead of a border. That boundary measures 1.34:1 for fields and 1.92:1 for controls in the dark theme, and 1.21:1 and 1.49:1 in the light theme. WCAG 1.4.11 asks for 3:1, so fields do not meet it.

If your product must meet WCAG AA in full, account for both points.

## Focus

Every focusable piece shows one focus line. It is never a border plus a separate ring.

- Width: `--focus-width`, 2px. Gap from the piece: `--focus-offset`, 2px.
- Inside a clipped container (a table row, a tree item), the ring is drawn inward so it is not cut off.
- In the light theme, the ring is the text colour (`--focus-strong`): 14.24:1 on the page and 8.13:1 around the yellow button. In the dark theme, it is the brand yellow.
- On an invalid field, the ring takes the danger colour, so the error stays visible while it is being fixed.
- React Native has no outline. There, focus is shown as a border in the focus colour.

A sweep tabs through every component preview on this site and fails if a focused piece draws two lines.

## Touch targets

The minimum target is `--target-min`: 2.75rem, which is 44px at a 16px root.

- **Web.** On a touch screen (`pointer: coarse`), buttons, tabs, segmented controls, pagination, media controls and navigation rows grow to at least 44px. Small close and remove buttons keep their drawing and get an invisible 44px hit area around it.
- **Native.** `Button` and `IconButton` always keep a 44-point target, even when the drawing is smaller. The target is real layout, not an extended hit zone, so the screen reader sees it too. Native buttons, fields and selects are 48 tall by default (`--touch-control-h-md`, comfortable density).

## Keyboard

On the web, keyboard behaviour comes from Base UI. Aurea does not reimplement it. A test checks that each component's documentation declares every key the engine handles.

- Focus order follows the document. Nothing is reordered visually without being reordered in the markup, and a sweep checks that visual order equals focus order on every page.
- The date picker and the colour picker open with focus inside and return focus to the trigger on `Esc`. The colour picker keeps `Tab` inside while it is open.
- `AppShell` renders a "Skip to content" link at the start of the shell.

## Screen readers

Components wire names, descriptions and states themselves.

```tsx
<Field label="Email" hint="We never share it." error="Enter a valid address.">
  <Input type="email" />
</Field>

<IconButton icon="trash" label="Delete" />
```

- `Field` connects the label, the hint and the error to the control, and marks it invalid when there is an error.
- `IconButton` requires `label`. On both targets the type does not compile without it, because a button with only an icon has no text to announce.
- On native, every state a component reports to assistive technology (checked, selected, disabled) is also written as the matching `aria-*` attribute, so it reaches screen readers in the browser too.
- axe also runs on overlays while they are open.

### Language

Every built-in label (close, loading, pagination, skip to content) comes from a set of strings. English is the default. Portuguese is included, and any label can be replaced.

```tsx
import {AureaProvider, ptBR} from "@aurea-uds/react";

<AureaProvider strings={ptBR}>{app}</AureaProvider>
```

## Motion

- **Web.** Under `prefers-reduced-motion: reduce`, one global rule in the core stylesheet cuts animations, transitions and smooth scrolling to near zero. Components do not need to opt in.
- **Native.** React Native has no global rule, so Aurea asks the system. `useReduceMotion()` returns `true`, `false`, or `null` while the system has not answered yet. Aurea's animations wait for the answer, so not a single frame plays for someone who asked for less motion.

```tsx
import {useReduceMotion} from "@aurea-uds/native";

const reduce = useReduceMotion();
if (reduce !== false) return; // skip the animation until we know it is allowed
```

See [Animation](./docs-animation.html).

## Forced colours

When the system forces its own colours (`forced-colors: active`), the focus ring uses the system text colour. Icons drawn as masks would vanish, so they repaint in the system colour of the text next to them. Colour swatches keep their colour, because the colour is their content. A dedicated test checks each of these.

Aurea does not change its design under `prefers-contrast: more`.

## Text size and reflow

A sweep sets the root text size to 200% on every page of this site and fails any page that then scrolls sideways. A second sweep checks that no page scrolls sideways at any width.

## Right-to-left

Set `dir="rtl"` on the `html` element and `direction="rtl"` on `AureaProvider`. The stylesheet uses logical properties, so layouts mirror on the inline axis. A test checks that components mirror, and that what must not mirror stays in place. See [RTL](./docs-rtl.html).

## What stays with your app

Aurea cannot check content it does not own.

- Write meaningful labels, alt text (`imageAlt` on `Badge`, for example) and headings in order.
- Check the contrast of your own colours and images.
- Content you place inside a component is your responsibility. On native, do not put a pressable element inside a piece that is marked as one accessible element: on iOS, VoiceOver hides what is inside.
