# The menu row of an editor

One row, and the arrow keys walk from an open menu straight into the next — that is what separates a menubar from three dropdowns side by side. It belongs to applications, not to websites.

## Usage

```tsx
import {Menubar} from "@aurea-uds/react";
```

```tsx
<Menubar label="Main" menus={[
  {label: "File", items: [
    {label: "New file", kbd: "⌘N"}, {label: "Open…", kbd: "⌘O"},
    "separator", {label: "Close", kbd: "⌘W"},
  ]},
  {label: "Edit", items: [{label: "Undo", kbd: "⌘Z"}, {label: "Redo", kbd: "⇧⌘Z"}]},
  {label: "View", items: [{label: "Zoom in"}, {label: "Zoom out"}, {label: "Reset zoom"}]},
]} />
```
