# View switch

Table or cards for the same data — SegmentedControl switches the view, never the meaning.

## Usage

```tsx
import {SegmentedControl, Table} from "@aurea-uds/react";
```

```tsx
<SegmentedControl label="View" value="table"
  items={[{value:"table",label:"Table"},{value:"cards",label:"Cards"}]} onChange={setView} />
```
