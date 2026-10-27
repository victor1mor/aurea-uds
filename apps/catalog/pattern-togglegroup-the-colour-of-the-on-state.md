# The colour of the on state

pressedStyle on the group colours every pressed toggle inside (ADR-0084): brand — the yellow of the primary button, the default — neutral (grey) or contrast (graphite, inverted).

## Usage

```tsx
import {ToggleGroup, Toggle} from "@aurea-uds/react";
```

```tsx
<ToggleGroup label="Alignment" defaultValue={["left"]} pressedStyle="brand">
  <Toggle value="left" icon="text-align-left" label="Align left" />
  <Toggle value="center" icon="text-align-center" label="Center" />
</ToggleGroup>
<ToggleGroup label="Alignment" defaultValue={["left"]} pressedStyle="neutral">
  <Toggle value="left" icon="text-align-left" label="Align left" />
  <Toggle value="center" icon="text-align-center" label="Center" />
</ToggleGroup>
<ToggleGroup label="Alignment" defaultValue={["left"]} pressedStyle="contrast">
  <Toggle value="left" icon="text-align-left" label="Align left" />
  <Toggle value="center" icon="text-align-center" label="Center" />
</ToggleGroup>
```
