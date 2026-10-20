# Switching the window of a chart

One dimension, few values, and one is always chosen — that is what separates a segmented control from a button group. Zero selected is not a state it can express, so never use it for a filter that can be cleared.

## Usage

```tsx
import {SegmentedControl} from "@aurea-uds/react";
```

```tsx
const [range, setRange] = useState("7d");

<SegmentedControl
  label="Range"
  value={range}
  onChange={setRange}
  items={[{value: "24h", label: "24h"}, {value: "7d", label: "7 days"}, {value: "30d", label: "30 days"}]}
/>
```
