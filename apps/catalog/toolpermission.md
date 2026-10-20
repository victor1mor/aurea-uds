# ToolPermission

What each tool may do, without asking again.

## Usage

```tsx
import {ToolPermission} from "@aurea-uds/react";
```

```tsx
<ToolPermission tools={[
  {id: "1", name: "read", scope: "/docs", permission: "always"},
  {id: "2", name: "write", scope: "/docs", permission: "ask"},
]} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `tools` | `ToolPermissionEntry[]` | — | One row per tool. `scope` sits NEXT TO the name, never hidden: "read" and "read /etc" are different permissions, and granting the second thinking it is the first is the defect this component exists to prevent. |
| `onChange` | `(id: string, permission: PermissionLevel) => void` | — | Fires when a permission changes. The three-way choice is a SegmentedControl, so arrows move AND select, with Home and End — writing three toggle buttons here would redo by hand the pattern ADR-0016 rejected. |
| `label` | `string` | "Tool permissions" | Accessible name of the region. |
| `className` | `string` | — | On the region. |
