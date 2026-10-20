# A media slot that reserves its space

The box holds the shape before the image arrives, so nothing below it jumps when it does. That is the whole job: not cropping the picture, but stopping the layout from shifting under the reader — the failure a card grid makes most visibly.

## Usage

```tsx
import {AspectRatio, Card} from "@aurea-uds/react";
```

```tsx
<Card>
  <AspectRatio ratio={16 / 9}>
    <img src={cover} alt="" style={{width: "100%", height: "100%", objectFit: "cover"}} />
  </AspectRatio>
  <strong>Design tokens, end to end</strong>
</Card>
```
