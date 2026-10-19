# The overflow menu of a table row

Three dots at the end of the row. Destructive items sit last, after a separator, so the pointer never lands on Delete while reaching for Rename.

## Usage

```tsx
import {DropdownMenu, IconButton} from "@aurea-uds/react";
```

```tsx
<DropdownMenu
  label="Row actions"
  trigger={<IconButton icon="dots-three" label="Row actions" />}
  items={[
    {label: "Rename", leadingIcon: "pencil-simple"},
    {label: "Duplicate", leadingIcon: "copy"},
    "separator",
    {label: "Delete", leadingIcon: "trash"},
  ]}
/>
```
