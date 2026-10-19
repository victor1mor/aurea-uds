# The alignment row of an editor

Arrow keys walk the group and only one alignment can be true at a time. With multiple it becomes a filter bar where none selected is legitimate — the same component, a different contract.

## Usage

```tsx
import {ToggleGroup, Toggle} from "@aurea-uds/react";
```

```tsx
<ToggleGroup label="Alignment" defaultValue={["left"]}>
  <Toggle value="left" icon="text-align-left" label="Align left" />
  <Toggle value="center" icon="text-align-center" label="Center" />
  <Toggle value="right" icon="text-align-right" label="Align right" />
</ToggleGroup>
```
