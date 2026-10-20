# A source tree beside the editor

Arrow keys walk it, Right opens a branch and Left closes it — the shape people already know from every file explorer. Only the branch the user is working in starts open.

## Usage

```tsx
import {TreeView} from "@aurea-uds/react";
```

```tsx
<TreeView
  label="Files"
  defaultExpandedIds={["packages", "react"]}
  onSelect={node => open(node.id)}
  items={[
    {id: "packages", label: "packages", children: [
      {id: "react", label: "react", children: [
        {id: "index", label: "index.tsx"},
        {id: "inputs", label: "inputs.tsx"},
      ]},
      {id: "core", label: "core"},
    ]},
    {id: "readme", label: "README.md"},
  ]}
/>
```
