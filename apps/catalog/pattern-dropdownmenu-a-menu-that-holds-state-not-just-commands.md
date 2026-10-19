# A menu that holds STATE, not just commands

The View menu of any application: things that toggle, things that are mutually exclusive, and a section label that names the group instead of pretending to be an item. Until 28/08/2026 the Aurea menu could express none of these — `items` had a single shape, and the engine underneath had five (G-API-02).

## Usage

```tsx
import {DropdownMenu, Button} from "@aurea-uds/react";
```

```tsx
<DropdownMenu
  label="View"
  trigger={<Button variant="ghost">View</Button>}
  items={[
    {kind: "checkbox", label: "Sidebar", defaultChecked: true,
      onCheckedChange: (on) => setSidebar(on)},
    {kind: "checkbox", label: "Ruler"},
    "separator",
    {kind: "radiogroup", label: "Sort by", defaultValue: "name",
      onValueChange: setSort, items: [
        {value: "name", label: "Name"},
        {value: "date", label: "Date modified"},
      ]},
    "separator",
    {kind: "submenu", label: "Export", leadingIcon: "download", items: [
      {label: "PDF"},
      {label: "CSV"},
    ]},
    {kind: "link", label: "Documentation", href: "/docs"},
  ]}
/>
```
