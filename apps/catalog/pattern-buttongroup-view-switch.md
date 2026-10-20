# View switch

One-of-many is not this component: SegmentedControl carries one value and one tab stop.

## Usage

```tsx
import {SegmentedControl} from "@aurea-uds/react";
```

```tsx
<SegmentedControl label="View" value="board" onChange={setView}
  items={[{value: "list", label: "List"}, {value: "board", label: "Board"}]} />
```
