# Failure with retry

What broke, plus the way out in the same block. An error without an action is a dead end.

## Usage

```tsx
import {Alert, Button} from "@aurea-uds/react";
```

```tsx
<Alert variant="danger" title="Upload failed">
  The connection dropped at 40%.
  <Button variant="outline">Retry</Button>
</Alert>
```
