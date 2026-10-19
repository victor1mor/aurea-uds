# Tags under a heading

A cluster of badges is the shape a filter list and a tag list share. The primitive is what keeps the vertical rhythm right when the second row appears — the case a hand-written flex row almost always gets wrong.

## Usage

```tsx
import {Cluster, Badge} from "@aurea-uds/react";
```

```tsx
<Cluster>
  {tags.map(t => <Badge key={t}>{t}</Badge>)}
</Cluster>
```
