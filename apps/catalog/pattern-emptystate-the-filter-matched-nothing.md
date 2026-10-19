# The filter matched nothing

Different from an empty account: here there IS data, the query just missed it. The action clears the filter instead of creating something — offering Create here sends people down the wrong path.

## Usage

```tsx
import {EmptyState, Button} from "@aurea-uds/react";
```

```tsx
<EmptyState
  icon="magnifying-glass"
  title="No members match “curator”"
  description="Check the spelling, or clear the filter to see all 9 members."
  action={<Button variant="outline" onClick={clear}>Clear filter</Button>}
/>
```
