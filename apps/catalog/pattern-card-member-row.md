# Member row

Avatar, name and role — the identity line that repeats in every list of people.

## Usage

```tsx
import {Card, Avatar, Badge} from "@aurea-uds/react";
```

```tsx
<Card>
  <div className="cluster">
    <Avatar fallback="AM" />
    <div><strong>Analyst</strong><p className="muted">analyst@acme.dev</p></div>
    <Badge>admin</Badge>
  </div>
</Card>
```
