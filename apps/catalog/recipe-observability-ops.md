# Observability · ops

Telemetry, logs, alerts and remediation: a live update is pausable and remediation links to the alert and the receipt.

## Usage

```tsx
import {Card, KPI, Alert, LogStream, Button} from "@aurea-uds/react";
```

```tsx
<Card>
  <KPI label="p95 latency" value="284 ms" trend="+38 ms" />
  <Alert variant="danger" title="Error rate above 2%">
    Started 09:12. The runbook is linked from the alert, not from memory.
  </Alert>
  <LogStream lines={tail} />
  <Button variant="outline">Pause live tail</Button>
</Card>
```
