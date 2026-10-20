# Nothing here yet, and one way forward

The empty state of a new account is not an error: it says what will appear and offers the one action that fills it. Never the same copy as a search with no results — those are different situations wearing the same layout.

## Usage

```tsx
import {EmptyState, Button} from "@aurea-uds/react";
```

```tsx
<EmptyState
  icon="rocket"
  title="No runs yet"
  description="Start one and it will show up here with its logs and timings."
  action={<Button variant="primary">Start a run</Button>}
/>
```
