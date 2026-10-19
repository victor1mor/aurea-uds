# Stacked actions

A vertical group for a menu of actions on a card or in a side panel. The buttons all measure the same width — without that the column comes out ragged, which is the one defect a vertical group cannot have. It stays role="group" and announces no orientation: it does not navigate by arrow, and promising keyboard that does not exist is worse than staying quiet.

## Usage

```tsx
import {ButtonGroup, Button} from "@aurea-uds/react";
```

```tsx
<ButtonGroup orientation="vertical" label="Item actions">
  <Button variant="outline">Duplicate</Button>
  <Button variant="outline">Archive item</Button>
  <Button variant="danger-outline">Delete</Button>
</ButtonGroup>
```
