# Heading

A heading, h1 to h6. The level picks both the element and the size, as in the reference library.

## Usage

```tsx
import {Heading} from "@aurea-uds/react";
```

```tsx
<Heading level={2}>This month</Heading>
<Heading level={3}>By team</Heading>
<Heading level={4}>Analyst</Heading>
<Heading level={5}>Notes</Heading>
<Heading level={6}>Footnote</Heading>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `level` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | 1 | The heading level: it renders h1…h6 and takes that role's size (4xl down to base, semibold, tight leading). There is no separate size prop, as in the reference library — the level is the design. |
| `color` | `"default" \| "muted"` | "default" | Two colours only, like the reference library: the text colour or the muted one. A closed list protects contrast — both pass AA on every Aurea surface. |
| `tone` | `"default" \| "muted" \| "subtle" \| "primary" \| "link" \| "danger" \| "success" \| "warning" \| "info"` | — | The text colour with the native package's name — the same names on web and native. link is the yellow made for text, readable on both themes; primary is the fill yellow and nearly disappears on the light theme. The state colours are the -400 pair. It wins over color when both are given. |
| `weight` | `"normal" \| "medium" \| "semibold" \| "bold" \| "extrabold"` | — (the role's own) | Overrides the weight of the role. Headings are semibold and body text is regular by default. "extrabold" (800, --weight-extrabold) is for a cover title; the default title weight is still semibold. |
| `align` | `"start" \| "center" \| "end" \| "justify"` | — (inherited) | Text alignment. start and end follow the writing direction, so the same value mirrors in RTL. |
| `truncate` | `boolean` | false | One line, cut with an ellipsis. Turns the element into a block so the cut has a width to measure against. |
| `children` | `ReactNode` | — | The text. |
| `numeric` | `boolean` | false | Tabular figures (font-variant-numeric: tabular-nums) — for numbers that line up in a column (price, year, spec sheet) or change on screen. Off by default: in running text the narrow "1" is right. Native: the same prop sets fontVariant ["tabular-nums"]. |
