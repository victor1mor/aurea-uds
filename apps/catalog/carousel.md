# Carousel

Slides that snap, with arrows and dots. The scroll container is the engine.

## Usage

```tsx
import {Carousel} from "@aurea-uds/react";
```

```tsx
<Carousel label="Product photos" style={{"--carousel-slide": "50%"}}>
  <Card>Front</Card>
  <Card>Back</Card>
  <Card>In use</Card>
  <Card>Packaging</Card>
</Carousel>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | One node per slide. Each child is wrapped in a group with aria-roledescription="slide" and the label "Slide 3 of 8", so the count is never the consumer's job to keep in sync. |
| `label` | `string` | Carousel | Accessible name of the region. Give it a real one — "Product photos" — because a page with two carousels announces two identical regions otherwise. |
| `controls` | `boolean` | true | Previous/next arrows. They disable themselves at each end, measured from the scroll position — not from the slide index, which would be wrong whenever more than one slide fits. |
| `indicators` | `boolean` | true | The row of dots. Each is a 24x24 target (WCAG 2.2 AA 2.5.8) with an 8px mark drawn in ::before. |
| `--carousel-slide` | `CSS custom property` | 100% | How wide a slide is, and therefore how many are visible at once. It is CSS and not a prop because that is a layout decision of the page: set it to 50% for two at a time. Same escape valve as --qr-size and --media-h. |
