# Aurea foundations — what the tokens govern, and what they do not

The official answer to "which axis controls this value".

The counts live in [`STATE.md`](https://github.com/victor1mor/aurea-uds/blob/main/STATE.md), generated and
checked. This file holds the rules.

---

## The axes

| Axis | Tokens | Unit | Notes |
|---|---|---|---|
| Colour | `--<semantic>`, `--<family>-<step>` | oklch / hex | the semantic token comes first; a ramp step is for building a semantic token, not for direct use |
| Space | `--space-0` … `--space-24` | rem | the scale skips values on purpose — not every integer exists |
| Type size | `--text-xs` … `--text-7xl` | rem | |
| Type family | `--font-ui`, `--font-heading`, `--font-editorial`, `--font-code` | — | Inter / Sora (every h1 to h6) / Inter (alias, removed in 1.0) / IBM Plex Mono |
| Type weight | `--weight-regular` … `--weight-extrabold` | number | |
| Line height | `--leading-none` … `--leading-relaxed` | number | `--leading-none` exists for components whose HEIGHT is part of the contract |
| Letter spacing | `--tracking-tight` … `--tracking-widest` | em | |
| Radius | `--radius-xs` … `--radius-card`, `--radius-sheet`, `--radius-control` | px | `--radius-card` (22px), `--radius-sheet` (32px, the sheet that rises from the bottom) and `--radius-control` (999px) are identity — checked |
| Border | `--border-width` | px | |
| Shadow | `--shadow-sm`, `--shadow-md`, `--shadow-lg` | shadow | |
| Layer | `--z-sticky` … `--z-toast` | number | for stacking OVERLAYS. A local `z-index: 1/2/3` inside a component is not this axis |
| Motion | `--duration-*`, `--ease-*` | duration / curve | |
| Icon size | `--icon-sm` … `--icon-xl` | rem | in rem so the glyph follows the text |
| Touch target | `--target-min` | rem | 44px with a 16px root — WCAG 2.5.5/2.5.8 |
| Breakpoint | `--breakpoint-2xs` … `--breakpoint-2xl` | px | `@media` cannot read `var()`, so the CSS repeats each breakpoint in `em` (it follows the browser's font size) and a build check guards the scale |
| Density | see below | rem | |

**A new value on any of these axes comes from a token.** The raw values in the core are counted per
axis against a baseline: the count may go down, never up.

---

## The density contract — what actually changes

`data-density="compact | comfortable | spacious"` changes **eleven** tokens, and only those:

`--control-h-xs`, `--control-h-sm`, `--control-h-md`, `--control-h-lg`, `--control-h-xl`,
`--touch-control-h-sm`, `--touch-control-h-md`, `--touch-control-h-lg` (the control heights of the native
touch target), `--row-h`, `--card-pad`, `--section-gap`.

In other words: density changes **control height, table row height, card padding and the gap between
sections**.

It does **not** change, on purpose: type size, the general space scale, layout gaps, radii, icon sizes
or line heights. Density is about how close together the controls sit, not a second type scale.

Every control must take its height from `--control-h-*`. `tests/visual/geometry.spec.ts` checks this.

---

## The theme contract — and an asymmetry, on purpose

`data-theme="dark | light"`. Dark is the base; light overrides it.

The two themes are **not** fully symmetric, and this is the exception: light overrides three colours that
dark leaves at the base value — `warning-500`, `oracle-300` and `oracle-400`. Nothing is undefined in dark:
those tokens inherit the base value, so no value is missing.

The identity does not change between themes: the main yellow is `oklch(0.795 0.184 86.047)` in both, and
the build fails on the canonical value, not only on the token name.

---

## Units: rem for everything that should follow the text

Type, space, icon size, control height, sidebar width and top bar height are **rem**, so that someone who
enlarges the browser's text gets bigger controls instead of clipped text (WCAG 1.4.4). The conversion
from px was exact (px÷16), so nothing moved at the default root size.

Radii stay in **px**: a corner is a physical shape, not text, and scaling it with the text makes the
capsule stop being a capsule.

---

## Tokens nobody uses

Not every token is referenced by the core. That is not automatically waste:

| Group | Why it exists |
|---|---|
| `--breakpoint-*` | `@media` cannot read `var()`. The CSS repeats the number and a build check guards the scale against them |
| `--oracle-*` | used only by `apps/docs/docs.css`. `oracle` is vocabulary of the app it came from, not of the system — they go away together with that page |
| ramp steps | intermediate steps of the semantic families, kept so a consumer can build a variant |

**The rule:** a token is born from a use, not from a scale that looks complete. Tokens that had no use
anywhere were removed, and the ones that were needed were created.

Repeats are references, not copies: `--radius-full` is `{radius-control}`, so the two names cannot
diverge. Two tokens with the same number written by hand diverge the day one of them is adjusted.

---

## Cascade

`packages/core/dist/aurea.css` wraps the tokens **and** the component CSS in `@layer aurea`. The
consumer's own CSS, written without a layer, wins over the library whatever the selector's specificity —
no `!important`, no specificity hunting.

The tokens sit inside the layer, together with the core, not outside it. A custom property
**declaration** competes in the cascade like any other: with the tokens outside, the `:root` override
that the core declares inside a media query lost to the base value, and the sidebar jumped 48px. An app
that redefines a token in its own unlayered `:root` still wins over both.
