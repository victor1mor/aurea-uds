# Feature with state

The switch sets it; a Status reports what the system did with it.

## Usage

```tsx
import {Card, Switch, Status} from "@aurea-uds/react";
```

```tsx
<div className="cluster" style={{justifyContent: "space-between"}}>
  <Switch label="Public API" defaultChecked />
  <Status variant="online">live</Status>
</div>
```
