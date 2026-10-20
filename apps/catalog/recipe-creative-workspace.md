# Creative workspace

Canvas, assets, versions and comments: every canvas operation has an outline alternative and versions compare and restore.

## Usage

```tsx
import {Card, Timeline, MessageList, Badge} from "@aurea-uds/react";
```

```tsx
// The canvas is the other half. Versions and comments are the surface that
// makes canvas work reviewable — every operation has an outline alternative.
<Card>
  <Badge variant="primary">v7 · current</Badge>
  <Timeline items={[
    {title: "v7 · exported at 2x", time: "09:20"},
    {title: "v6 · palette swapped", time: "08:55"},
  ]} />
  <MessageList messages={comments} />
</Card>
```
