# The menu bar as a column

`orientation="vertical"` stacks the bar and the menus open to the side — down would put them on top of the next item of the bar itself. The side is logical (`inline-end`), so in Arabic the column sits on the right and the menus open left without anyone writing a second rule.

## Usage

```tsx
import {Menubar} from "@aurea-uds/react";
```

```tsx
<Menubar label="Tools" orientation="vertical" menus={[
  {label: "File", items: [{label: "New file"}, {label: "Open…"}]},
  {label: "Selection", items: [{label: "Select all"}, {label: "Expand"}]},
]} />
```
