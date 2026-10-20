# The one action that is not a tool

A toolbar is mostly ghost buttons because they are peers; the moment one of them is the point of the screen it takes a tone of its own. One per bar — a bar of primaries has no primary.

## Usage

```tsx
import {Toolbar, ToolbarButton, ToolbarSeparator} from "@aurea-uds/react";
```

```tsx
<Toolbar label="Draft">
  <ToolbarButton leadingIcon="floppy-disk">Save</ToolbarButton>
  <ToolbarButton leadingIcon="eye">Preview</ToolbarButton>
  <ToolbarSeparator />
  <ToolbarButton variant="primary">Publish</ToolbarButton>
</Toolbar>
```
