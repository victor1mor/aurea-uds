# A primary action with variants behind it

The button does the common thing; the chevron opens the rest. The label of the button is the action itself, never the word More.

## Usage

```tsx
import {DropdownMenu, Button, IconButton} from "@aurea-uds/react";
```

```tsx
<ButtonGroup label="Export">
  <Button variant="primary">Export CSV</Button>
  <DropdownMenu
    label="Other formats"
    trigger={<IconButton variant="primary" icon="caret-down" label="Other formats" />}
    items={[{label: "Export JSON"}, {label: "Export Parquet"}]}
  />
</ButtonGroup>
```
