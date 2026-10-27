# v0.45.0

The 1.0 palette — zinc neutrals, a graphite accent in light mode, highlighted links, white marks inside controls, white fields everywhere and support for the system's "increase contrast".

The colours of both themes change. The brand yellow stays the same, in both themes; what changes is everything around it. In light mode the yellow is never used for text any more: it is a fill, a line, an underline or a highlight, and accent text is the colour of the text. Nothing changes size or name — if you paint with the tokens, you get the new colours on your own. Read "Look and feel" first if you set colours by hand.

## Look and feel

- **The light and dark themes change colour**: the neutrals, the accent in light mode, links, the marks inside controls, the pressed button and the charts. Measurements and names stay the same.
- **Published token values change.** In light mode, `--primary-emphasis`, `--link` and `--link-hover` are now the text colour (they were the brand blue), and `--focus` is the bronze `#BD7000`. In both themes, `--brand-yellow-ink` is now `#18181B` (it was `#242424`), `--primary-mark` is the ink (it was brown), `--control-selected-foreground` is white, `--warning-foreground` is the ink, and `--chart-1` to `--chart-5` are five new blue steps.

## New

- **Four tokens:** `--input-strong` (the 3:1 outline of fields, only when the system asks for more contrast), `--link-mark` (the highlight behind a link), `--link-underline` (the link underline) and `--control-thumb` (the knob of the `Switch` and the handle of the `Slider`).
- **The system's "increase contrast"** — `prefers-contrast: more` on the web; "Increase Contrast" on iOS and "High contrast text" on Android in React Native. Fields get a 3:1 outline, the marks inside controls turn to the ink, and the field focus turns graphite. It is the only line this preference draws.
- **Highlighted links.** In light mode a link is the text colour with a yellow highlight behind the lower half of the letters, which covers the whole word on hover. For the underlined variation, put `data-link="underline"` on the link, on a container or on `<html>`. In dark mode a link is yellow and underlined. This applies to a link without a class, to `Link` and to text in the `link` tone (`Text tone="link"` in React Native). Navigation is left out: breadcrumbs, links inside a `<nav>` and segments that are links.

## Changed

- **Zinc neutrals.** Light: page `#F5F5F5`, white cards, text `#09090B`, secondary `#EBEBED`, muted text `#5E5E65`. Dark: page `#09090B`, cards `#18181B` with no border, text `#FAFAFA`, secondary `#27272A`, muted text `#A1A1AA`.
- **In light mode the yellow is never text.** Accent text and links are the text colour; the selected item — a tab, a lit segment, the current navigation item, `.eyebrow` — has text-coloured lettering with the yellow line underneath. In React Native, the same for the selected item and for `Text tone="primary"`.
- **On the yellow, the ink `#18181B`** — the label of the primary button, the icon of a filled bottom bar, the play button of `MediaEmbed`. Inside controls the marks are white: the knob of the `Switch`, the handle of the `Slider`, the tick of the `Checkbox` and the dot of the radio.
- **Focus.** In light mode `--focus` is the bronze `#BD7000`; most components keep the graphite focus; fields get a single yellow focus line in both themes.
- **In light mode a field is white with the thin shadow everywhere**, inside cards, dialogs and menus too (it used to be grey there). Dark mode does not change. React Native does the same.
- **The pressed button** (`Toggle`, `ToggleGroup`, `ToolbarButton`) is solid yellow with the label of the primary button, without the line underneath and without the pale fill.
- **`Timeline`**: the line now runs under the dots and stops at the last one. It used to run over the dots and past the last one.
- **`Link` is underlined at rest.**
- **The filled warning button** has ink lettering (4.67:1 on hover); **charts** reach 3:1 or more in both themes; **the "attention" cell** of the health panel is `#D07612` in light mode.
- **`--brand-yellow-foreground` and `--brand-yellow-text` are deprecated** (unused) and leave in 1.0.

## The `lory` brand

- **It keeps its colours.** The only change in it is the `Timeline` fix.

## The documentation site

- **The whole site uses the new palette**, in both themes: links in running text get the highlight, navigation does not.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.45.0 @aurea-uds/core@0.45.0 @aurea-uds/fonts@0.45.0 @aurea-uds/icons@0.45.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.45.0
```
