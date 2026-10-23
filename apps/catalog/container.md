# Container

The reading width of a website page: centred, capped, with side gutters that grow with the screen.

## Usage

```tsx
import {Container} from "@aurea-uds/react";
```

```tsx
<Container size="sm">
  <Card>Content, centred and capped</Card>
</Container>
```

## Examples

### Sizes

The cap, on the width scale: sm 640, md 768, lg 1024, xl 1280 (the default), 2xl 1536, docs (the text column of a documentation page) and full, no cap. In this box the larger ones fill the width.

```tsx
<Container size="sm"><Card>size sm</Card></Container>
<Container size="md"><Card>size md</Card></Container>
<Container size="lg"><Card>size lg</Card></Container>
<Container size="xl"><Card>size xl</Card></Container>
<Container size="2xl"><Card>size 2xl</Card></Container>
<Container size="docs"><Card>size docs</Card></Container>
<Container size="full"><Card>size full</Card></Container>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `"sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "docs" \| "full"` | "xl" | How far the content grows, by the names of the breakpoint scale: sm 640, md 768, lg 1024, xl 1280 (the default), 2xl 1536, docs 1400 (the documentation block, with 24 of padding from 768 up), or full with no cap. |
| `children` | `ReactNode` | — | The page content. The side gutter is --space-4 (16) on a narrow screen and --space-8 (32) from the md breakpoint up. |
| `className` | `string` | — | Extra classes on the <div>. |
