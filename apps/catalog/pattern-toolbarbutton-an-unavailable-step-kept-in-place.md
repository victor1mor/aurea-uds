# An unavailable step kept in place

`disabled` on the step that cannot run — never removing it. A bar whose buttons come and go renumbers itself under the reader's hand, and the muscle memory that a toolbar exists to build never forms.

## Usage

```tsx
import {Toolbar, ToolbarButton} from "@aurea-uds/react";
```

```tsx
<Toolbar label="History">
  <ToolbarButton leadingIcon="arrow-counter-clockwise" disabled>Undo</ToolbarButton>
  <ToolbarButton leadingIcon="arrow-clockwise">Redo</ToolbarButton>
</Toolbar>
```
