# Text

Text in one of a closed list of roles — a heading level, body text or code — never a loose size. The reference library's Typography model.

## Usage

```tsx
import {Text} from "@aurea-uds/react";
```

```tsx
<Text>Body text</Text>
<Text type="body-sm" color="muted">Supporting text</Text>
<Text type="h4">Looks like a heading, reads as text</Text>
<Text weight="semibold">Semibold</Text>
<Text weight="extrabold">Extrabold, for a cover title</Text>
<Text numeric>$ 41,118.00</Text>
```

## Examples

### Roles

The closed list of roles. A role is a size, a weight and a line height together — there is no size between h3 and h4.

```tsx
<Text type="h1">Role h1</Text>
<Text type="h2">Role h2</Text>
<Text type="h3">Role h3</Text>
<Text type="h4">Role h4</Text>
<Text type="h5">Role h5</Text>
<Text type="h6">Role h6</Text>
<Text type="body">Role body</Text>
<Text type="body-sm">Role body-sm</Text>
<Text type="body-xs">Role body-xs</Text>
<Text type="code">Role code</Text>
```

### Weights

The role keeps its size; weight only changes how heavy it reads. extrabold (800) is for a cover title.

```tsx
<Text weight="normal">Weight normal</Text>
<Text weight="medium">Weight medium</Text>
<Text weight="semibold">Weight semibold</Text>
<Text weight="bold">Weight bold</Text>
<Text weight="extrabold">Weight extrabold</Text>
```

### Tones

The text colour, with the same names as the native package. Every tone passes 4.5:1 on the page in both themes.

```tsx
<Text tone="default">Tone default</Text>
<Text tone="muted">Tone muted</Text>
<Text tone="subtle">Tone subtle</Text>
<Text tone="primary">Tone primary</Text>
<Text tone="link">Tone link</Text>
<Text tone="info">Tone info</Text>
<Text tone="success">Tone success</Text>
<Text tone="warning">Tone warning</Text>
<Text tone="danger">Tone danger</Text>
```

### Alignment

start and end follow the writing direction, so the same value mirrors in a right-to-left page.

```tsx
<Text align="start">Aligned to start</Text>
<Text align="center">Aligned to center</Text>
<Text align="end">Aligned to end</Text>
<Text align="justify">Aligned to justify</Text>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `"body" \| "body-sm" \| "body-xs" \| "code" \| "h1" … "h6"` | "body" | The role. The list is closed on purpose, like the reference library's: pick "h2" or "body-sm", never a pixel size. Only the look changes — the element stays a span, so a visual h2 is not a heading for a screen reader (use Heading for that). |
| `color` | `"default" \| "muted"` | "default" | Two colours only, like the reference library: the text colour or the muted one. A closed list protects contrast — both pass AA on every Aurea surface. |
| `tone` | `"default" \| "muted" \| "subtle" \| "primary" \| "link" \| "danger" \| "success" \| "warning" \| "info"` | — | The text colour with the native package's name — the same names on web and native. link is the yellow made for text, readable on both themes; primary is the fill yellow and nearly disappears on the light theme. The state colours are the -400 pair. It wins over color when both are given. |
| `weight` | `"normal" \| "medium" \| "semibold" \| "bold" \| "extrabold"` | — (the role's own) | Overrides the weight of the role. Headings are semibold and body text is regular by default. "extrabold" (800, --weight-extrabold) is for a cover title; the default title weight is still semibold. |
| `align` | `"start" \| "center" \| "end" \| "justify"` | — (inherited) | Text alignment. start and end follow the writing direction, so the same value mirrors in RTL. |
| `truncate` | `boolean` | false | One line, cut with an ellipsis. Turns the element into a block so the cut has a width to measure against. |
| `children` | `ReactNode` | — | The text. |
| `numeric` | `boolean` | false | Value figures: on the web, the code font (IBM Plex Mono, ADR-0077) with tabular figures (font-variant-numeric: tabular-nums) — for values and identifiers that line up in a column (price, year, contract number) or change on screen. Off by default: in running text the narrow "1" is right. Native: the same prop sets fontVariant ["tabular-nums"]; the native font change comes with the native typeface files. |
