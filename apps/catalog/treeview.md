# TreeView

Hierarchical, expandable tree of items.

## Usage

```tsx
import {TreeView} from "@aurea-uds/react";
```

```tsx
<TreeView
  label="Files"
  defaultExpandedIds={["src"]}
  onSelect={node => open(node.id)}
  items={[
    {id: "src", label: "src", children: [
      {id: "index", label: "index.tsx"},
      {id: "tokens", label: "tokens.css"},
    ]},
    {id: "readme", label: "README.md"},
  ]}
/>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `TreeNode[]` | — | The tree: {id, label, icon?, children?, hasChildren?}. Nesting is by containment — the group lives inside its treeitem, with no aria-owns to keep in sync. `hasChildren: true` makes a node openable before its children exist (one of the references calls it hasChildItems); the children arrive later through `items`. |
| `defaultExpandedIds` | `string[]` | — | Which nodes start open. Only the initial value: after that the tree owns its own expansion. |
| `onSelect` | `(node: TreeNode) => void` | — | The whole node, not just the id — you rarely want only the id. |
| `onExpand` | `(node: TreeNode) => void \| Promise<unknown>` | — | Called every time a node opens (never when it closes). If it returns a promise and the node has no children yet, the node shows the spinner where the caret was and is aria-busy until the promise settles. A rejected promise closes the node again, so opening it retries. |
| `selectedId` | `string \| null` | — | Controls which node is selected, as in DependencyGraph. `null` means none. Without it the tree keeps the selection itself, as before. |
| `label` | `string` | "Tree" | Accessible name of the root. |
| `className` | `string` | — | On the root <ul>, which is the element with role="tree". |
