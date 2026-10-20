# Header with action

Title on the left, the action on the right, on the same baseline. The card owns its own header.

## Usage

```tsx
import {Card, Button, Badge} from "@aurea-uds/react";
```

```tsx
<Card>
  <div className="cluster" style={{justifyContent:"space-between"}}>
    <strong>API keys <Badge>2</Badge></strong>
    <Button variant="outline">New key</Button>
  </div>
</Card>
```
