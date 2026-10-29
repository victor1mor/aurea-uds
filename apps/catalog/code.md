# Code

A short piece of code inside a sentence. For a block of code use CodeBlock.

## Usage

```tsx
import {Code} from "@aurea-uds/react";
```

```tsx
<Paragraph>Run <Code>pnpm build</Code> before you publish.</Paragraph>
```

## Examples

### Weights

The role keeps its size; weight only changes how heavy it reads. extrabold (800) is for a cover title.

```tsx
<Code weight="normal">weight-normal</Code>
<Code weight="medium">weight-medium</Code>
<Code weight="semibold">weight-semibold</Code>
<Code weight="bold">weight-bold</Code>
<Code weight="extrabold">weight-extrabold</Code>
```

### Tones

The text colour, with the same names as the native package. Every tone passes 4.5:1 on the page in both themes.

```tsx
<Code tone="default">tone-default</Code>
<Code tone="muted">tone-muted</Code>
<Code tone="subtle">tone-subtle</Code>
<Code tone="primary">tone-primary</Code>
<Code tone="link">tone-link</Code>
<Code tone="info">tone-info</Code>
<Code tone="success">tone-success</Code>
<Code tone="warning">tone-warning</Code>
<Code tone="danger">tone-danger</Code>
```

### Alignment

start and end follow the writing direction, so the same value mirrors in a right-to-left page.

```tsx
<Code align="start">align-start</Code>
<Code align="center">align-center</Code>
<Code align="end">align-end</Code>
<Code align="justify">align-justify</Code>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `color` | `"default" \| "muted"` | "default" | Two colours only, like the reference library: the text colour or the muted one. A closed list protects contrast — both pass AA on every Aurea surface. |
| `tone` | `"default" \| "muted" \| "subtle" \| "primary" \| "link" \| "danger" \| "success" \| "warning" \| "info"` | — | The text colour with the native package's name — the same names on web and native. link is for a real link only: the text colour with the yellow highlighter behind it on the light theme, the yellow underlined on the dark one — both say "tap here". For emphasis that is not a link, use primary: the text colour on the light theme, where the yellow is never text, and the yellow on the dark one, with nothing under it. The state colours are the -400 pair. It wins over color when both are given. |
| `weight` | `"normal" \| "medium" \| "semibold" \| "bold" \| "extrabold"` | — (the role's own) | Overrides the weight of the role. Headings are semibold and body text is regular by default. "extrabold" (800, --weight-extrabold) is for a cover title; the default title weight is still semibold. |
| `align` | `"start" \| "center" \| "end" \| "justify"` | — (inherited) | Text alignment. start and end follow the writing direction, so the same value mirrors in RTL. |
| `truncate` | `boolean` | false | One line, cut with an ellipsis. Turns the element into a block so the cut has a width to measure against. |
| `children` | `ReactNode` | — | The text. |
| `numeric` | `boolean` | false | Value figures: on the web, the code font (IBM Plex Mono, ADR-0077) with tabular figures (font-variant-numeric: tabular-nums) — for values and identifiers that line up in a column (price, year, contract number) or change on screen. Off by default: in running text the narrow "1" is right. Native: the same prop sets fontVariant ["tabular-nums"]; the native font change comes with the native typeface files. |
