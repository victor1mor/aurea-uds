# IoT · control

A device fleet: telemetry, commands and calibration. An unsafe command is gated; all telemetry carries time and unit.

## Usage

```tsx
import {Card, Status, Switch, Progress, Alert, Button} from "@aurea-uds/react";
```

```tsx
<Card>
  <Status variant="online">gateway-04 online</Status>
  <Switch label="Night mode" defaultChecked />
  <Progress value={41} label="Tank level" />
  <Alert variant="warning" title="Confirmation required">
    Calibration writes to the device. Type the device id to continue.
  </Alert>
  <Button variant="danger">Calibrate</Button>
</Card>
```
