# The source failed

A dead stream is not an empty one: it needs the reason and a way out. Keeping the failure inside the frame instead of replacing the frame with an alert holds the layout still — the page does not jump when a tile drops.

## Usage

```tsx
import {MediaPlayerShell, Icon, Button} from "@aurea-uds/react";
```

```tsx
<MediaPlayerShell>
  <div className="media-placeholder">
    <Icon name="warning" />
    <strong>Stream unavailable</strong>
    <Button size="sm" variant="secondary" onClick={retry}>Try again</Button>
  </div>
</MediaPlayerShell>
```
