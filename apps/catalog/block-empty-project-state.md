# Empty project state

First run with nothing to show: says what is missing, why, and the one action that fixes it.

## Usage

```tsx
import {Card, EmptyState, Button, Badge} from "@aurea-uds/react";
```

```tsx
<Card>
  <EmptyState icon="folder" title="No projects yet"
    description="A project holds your components, tokens and releases."
    action={<Button variant="primary" leadingIcon="plus">New project</Button>} />
</Card>
```
