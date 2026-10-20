# A toggle that stays pressed

`pressed` emits `aria-pressed`, so the state is announced and not only shaded. This is the whole reason a formatting bar uses ToolbarButton instead of a styled div: bold-is-on has to be a fact, not an appearance.

## Usage

```tsx
import {Toolbar, ToolbarButton} from "@aurea-uds/react";
```

```tsx
<Toolbar label="Formatting">
  <ToolbarButton pressed leadingIcon="text-b">Bold</ToolbarButton>
  <ToolbarButton leadingIcon="text-italic">Italic</ToolbarButton>
</Toolbar>
```
