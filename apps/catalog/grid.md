# Grid

Two-dimensional layout primitive.

## Usage

```tsx
import {Grid} from "@aurea-uds/react";
```

```tsx
<Grid>
  <Card>One</Card>
  <Card>Two</Card>
  <Card>Three</Card>
</Grid>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | Responsive columns with no breakpoints: each one is at least --grid-min wide (15rem by default) and they fill the row, with --space-4 between them. |
| `gap` | `"tight" \| "normal" \| "loose"` | "normal" | Three steps and no others (ADR-0051): tight is --space-2, normal is --space-4, loose is --space-6. The old rule still holds against ANY spacing; these two extra steps exist for the two measured cases — a note under its value, and a grid of filters. |
| `min` | `"xs" \| "sm" \| "md" \| "lg" \| string` | "md" | The minimum column width. By name: xs 8rem, sm 12rem, md 15rem (the default) or lg 20rem — each a number the system already uses (the Gallery tile, the health matrix cell, the Grid default, the xs dialog). Or as a CSS length ("10rem", "155px"), the --grid-min the CSS reads. |
| `columns` | `number` | — | A fixed number of equal columns. With it, `min` stops applying. With 12, Grid.Item's `span` gives the 7-of-12 layout of a website page. |
| `Grid.Item span` | `Responsive<"1" \| … \| "12">` | — | Grid.Item is a grid child that knows how many columns it takes. Responsive and mobile-first: span={{base: "12", viewport: {md: "7"}}} takes the whole row on a narrow screen and 7 of 12 from md up. By container too ({base, container: {sm: …}}). Without span, one column, like any grid child. |
| `className` | `string` | — | Where you set --grid-min for a denser or a wider grid. That variable is the adjustment knob, the same idea as --qr-size on QRCode: a column count as a prop would freeze a number that the container is the one who knows. |
