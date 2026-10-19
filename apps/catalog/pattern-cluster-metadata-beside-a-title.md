# Metadata beside a title

Title, status and time on one line, aligned on their centres rather than their boxes. The alignment is the point: three elements of different heights on a hand-written row sit on three different baselines.

## Usage

```tsx
import {Cluster, Status, Avatar} from "@aurea-uds/react";
```

```tsx
<Cluster>
  <strong>Nightly sweep</strong>
  <Status variant="success">Succeeded</Status>
  <span className="muted">1m 48s</span>
</Cluster>
```
