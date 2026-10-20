# The log under the thing it describes

A log beside a status is the shape an operations panel repeats: the badge says what happened, the stream says why. Neither answers the other's question, which is why both are here.

## Usage

```tsx
import {Card, Status, LogStream, Button} from "@aurea-uds/react";
```

```tsx
<Card>
  <div className="cluster">
    <strong>Nightly sweep</strong>
    <Status variant="danger">Failed</Status>
  </div>
  <LogStream lines={lines} />
  <Button size="sm" variant="secondary" leadingIcon="arrow-counter-clockwise">Run again</Button>
</Card>
```
