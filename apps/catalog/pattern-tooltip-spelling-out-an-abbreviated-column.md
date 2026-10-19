# Spelling out an abbreviated column

`side="right"` when the trigger sits in a narrow column and a tip above would cover the row being read. The header still has to make sense without the tip: P95 is the label, the tip only expands it.

## Usage

```tsx
import {Tooltip} from "@aurea-uds/react";
```

```tsx
<th>
  <Tooltip side="right" content="95th percentile over the last 7 days">
    <abbr>P95</abbr>
  </Tooltip>
</th>
```
