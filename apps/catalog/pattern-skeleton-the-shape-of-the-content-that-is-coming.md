# The shape of the content that is coming

A skeleton only helps when it matches the layout it replaces — otherwise the page jumps when the data lands, which is the exact flicker it was meant to avoid. Use it for content, never for a control.

## Usage

```tsx
import {Skeleton} from "@aurea-uds/react";
```

```tsx
<Card>
  <Skeleton style={{height: 20, width: "40%"}} />
  <Skeleton style={{height: 14}} />
  <Skeleton style={{height: 14, width: "80%"}} />
</Card>
```
