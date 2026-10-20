# A row of actions that wraps instead of overflowing

Buttons side by side with the gap of the system, and a wrap that happens before anything is pushed off screen. Writing `display:flex` by hand gets the row right and the wrap wrong, which is only visible on the narrow viewport nobody tested.

## Usage

```tsx
import {Cluster, Button} from "@aurea-uds/react";
```

```tsx
<Cluster>
  <Button variant="primary">Save changes</Button>
  <Button variant="secondary">Save as draft</Button>
  <Button variant="ghost">Discard</Button>
</Cluster>
```
