# Between items on one line

`orientation="vertical"` for metadata that shares a row and does not share a meaning. It stretches to the line, so it never reads as a stray character the way a typed pipe does at a different font size.

## Usage

```tsx
import {Cluster, Separator} from "@aurea-uds/react";
```

```tsx
<Cluster>
  <span>12 components</span>
  <Separator orientation="vertical" />
  <span>186 patterns</span>
  <Separator orientation="vertical" />
  <span>Apache-2.0</span>
</Cluster>
```
