# Maps · logistics

Routes, layers and tracking on the map: every selection mirrors a list and offline freshness is declared.

## Usage

```tsx
import {Card, KPI, Timeline, Status} from "@aurea-uds/react";
```

```tsx
// The map is one half; this list is the other, and the invariant is that they
// always agree. Selecting a stop here selects the marker there.
<Card>
  <KPI label="ETA" value="14:42" trend="on time" />
  <Status variant="warning">position 3 min old</Status>
  <Timeline items={stops} />
</Card>
```
