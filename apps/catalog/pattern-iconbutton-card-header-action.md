# Card header action

One glyph in the corner of a surface: the title keeps the space, the action keeps the reach.

## Usage

```tsx
import {Card, IconButton, Badge} from "@aurea-uds/react";
```

```tsx
<Card>
  <div className="cluster" style={{justifyContent: "space-between"}}>
    <strong>Webhooks <Badge>3</Badge></strong>
    <IconButton icon="plus" label="New webhook" />
  </div>
</Card>
```
