# Personal productivity

Tasks, notes and calendar: offline editing is recoverable and navigating never discards unsaved work.

## Usage

```tsx
import {Card, Banner, Checkbox, Button} from "@aurea-uds/react";
```

```tsx
<Card>
  <Banner variant="info" title="Offline draft saved">
    It syncs when the connection returns. Navigating away keeps it.
  </Banner>
  <Checkbox label="Write the recipe previews" defaultChecked />
  <Checkbox label="Regenerate the 169 pages" />
  <Button variant="ghost" leadingIcon="plus">New task</Button>
</Card>
```
