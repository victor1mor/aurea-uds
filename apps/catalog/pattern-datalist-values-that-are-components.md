# Values that are components

`value` takes any node, so a status reads as a status and an identity reads as an identity. The alternative — spelling "Succeeded" as text — loses the one thing the reader scans for when the list is long.

## Usage

```tsx
import {DataList, Status, Avatar, Badge} from "@aurea-uds/react";
```

```tsx
<DataList items={[
  {term: "Result", value: <Status variant="success">Succeeded</Status>},
  {term: "Owner", value: <Avatar fallback="AN" size="sm" />},
  {term: "Version", value: <Badge>v1.4.0</Badge>},
]} />
```
