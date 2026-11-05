# IoT · control

A device fleet: telemetry, commands and calibration. An unsafe command is gated; all telemetry carries time and unit.

## Usage

```tsx
import {Card, Separator, Avatar, Icon, Text, Code, Heading, Status, Button, RadioGroup, Radio, DataList, Banner, Alert, KPI, Progress, Slider, Switch, Timeline, ConfirmDialog} from "@aurea-uds/react";
```

```tsx
import {useState} from "react";
import {Alert, Button, Card, ConfirmDialog, DataList, Heading, KPI, Progress, Radio, RadioGroup, Separator, Slider, Status,
  Switch, Timeline} from "@aurea-uds/react";

export function Device({fleet, limit, calibrate}) {
  const [id, setId] = useState(Object.keys(fleet)[0]);
  const [setpoint, setSetpoint] = useState(62);
  const [acknowledged, setAcknowledged] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const d = fleet[id];

  return (
    <Card>
      <header>
        <Heading level={3}>{d.place}</Heading> <Status variant={d.temp > limit ? "warning" : "success"}>{d.state}</Status>
        <Button variant="danger-ghost" leadingIcon="gauge" onClick={() => setConfirm(true)}>Calibrate</Button>
      </header>
      <Separator />

      {d.alert && !acknowledged && (
        <Alert variant="warning" title={`Temperature above ${limit} °C`}
          action={<Button variant="secondary" size="sm" onClick={() => setAcknowledged(true)}>Acknowledge</Button>} />
      )}
      <Card variant="inset"><KPI variant="plain" label="Temperature" value={`${d.temp} °C`} tone={d.temp > limit ? "danger" : "neutral"} /></Card>
      <Progress value={d.temp / 90 * 100} label="Temperature against the scale" showLabel detail={`limit ${limit} °C`} />
      <Slider label="Setpoint" value={setpoint} onValueChange={setSetpoint} min={40} max={80} showValue />
      <Switch label="Night mode" description="Halves the pump speed at night" />
      <Timeline items={d.history} />

      <div>
        <RadioGroup label="Device" labelHidden value={id} onValueChange={setId}>
          {Object.entries(fleet).map(([key, x]) => <Radio key={key} value={key} label={x.name} description={x.state} />)}
        </RadioGroup>
      </div>

      <ConfirmDialog open={confirm} destructive title={`Calibrate ${d.name}?`} confirmLabel="Calibrate"
        description="This writes to the device and restarts its sensors."
        onConfirm={() => { setConfirm(false); calibrate(id, setpoint); }} onCancel={() => setConfirm(false)} />
    </Card>
  );
}
```
