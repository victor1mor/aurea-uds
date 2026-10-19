# Container

The reading width of a website page: centred, capped, with side gutters that grow with the screen.

## Usage

```tsx
import {Container} from "@aurea-uds/react";
```

```tsx
<Container>
  <Heading level={2}>Fichas técnicas</Heading>
</Container>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `"sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "docs" \| "full"` | "xl" | How far the content grows, by the names of the breakpoint scale: sm 640, md 768, lg 1024, xl 1280 (the default), 2xl 1536, docs 1400 (the documentation block, with 24 of padding from 768 up), or full with no cap. |
| `children` | `ReactNode` | — | The page content. The side gutter is --space-4 (16) on a narrow screen and --space-8 (32) from the md breakpoint up. |
| `className` | `string` | — | Extra classes on the <div>. |
