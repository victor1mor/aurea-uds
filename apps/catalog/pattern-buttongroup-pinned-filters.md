# Pinned filters

Many-of-many: each button is its own toggle, so two can be on at once.

## Usage

```tsx
import {ButtonGroup, Button} from "@aurea-uds/react";
```

```tsx
<ButtonGroup label="Filters">
  <Button pressed>Starred</Button>
  <Button pressed={false}>Archived</Button>
  <Button pressed>Shared</Button>
</ButtonGroup>
```
