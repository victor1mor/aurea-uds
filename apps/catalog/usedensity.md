# useDensity

Read the current density and switch it, from anywhere inside AureaProvider.

## Usage

```tsx
import {useDensity} from "@aurea-uds/react";
```

```tsx
const {density, setDensity} = useDensity();

<SegmentedControl
  value={density ?? "comfortable"}
  onChange={setDensity}
  items={[
    {value: "compact", label: "Compact"},
    {value: "comfortable", label: "Comfortable"},
    {value: "spacious", label: "Spacious"},
  ]}
/>
```
