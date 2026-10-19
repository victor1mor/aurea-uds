# Device control

One device inside its fleet: what it is, what it is reading right now — with the time and the quality of each reading — what a command would reach and what it would do, the calibration with its default and a way back, and who touched it last. Live readings can be paused, and a firmware update asks before it drops the equipment.

## Usage

```tsx
import {HealthMatrix, Status, DataList, Alert, Toolbar, ToolbarButton, Button, Field, Range, HumanApproval} from "@aurea-uds/react";
```

```tsx
// Which actions exist is a fact about the DEVICE, so it comes from its own state machine.
// Four of the seven actions have no transition — select, command, confirm, pause_live —
// and that is not a hole in the contract: they change the SCREEN, not the equipment.
// Each one lives in the region it affects.
const actions = allowedFrom(device.state);   // online -> ["update", "calibrate"]

<div className="stack">
  <div className="cluster" style={{justifyContent:"space-between"}}>
    <strong>{device.name}</strong>
    <Status variant={tone[device.state]}>{label[device.state]}</Status>
  </div>

  {/* the fleet is a HealthMatrix: it names itself, so it IS the region */}
  <HealthMatrix label="Fleet" entries={fleet} />

  <div className="grid" style={{gridTemplateColumns:"1fr 1fr"}}>
    <div role="group" aria-label="Device"><DataList items={device.facts} /></div>

    {/* "telemetry timestamp and confidence are visible" — the quality vocabulary is the
        domain's own (OPC UA: Good · Uncertain · Bad), not one we invented. Paused or
        offline, the value is the LAST USABLE one and the clock stops: that is what the
        timestamp is for. */}
    <div role="group" aria-label="Telemetry">
      <DataList items={readings.map(r => ({
        term: r.name, value: `${r.value} · ${r.at} · ${r.quality}`}))} />
      {/* "live telemetry can be paused" — and the control says which way it is */}
      <Button onClick={toggleLive}>{paused ? "Resume live" : "Pause live"}</Button>
    </div>
  </div>

  {/* "critical alerts do not rely on sound": Alert danger IS role="alert", and the text
      carries the threshold and the reading. Acknowledge lives here — you acknowledge the
      alarm, not the device. */}
  {device.alert &&
    <div role="group" aria-label="Alerts">
      <Alert variant="danger" title={device.alert.title}>{device.alert.detail}</Alert>
      {actions.includes("acknowledge") && <Toolbar label="Alert actions">…</Toolbar>}
    </div>}

  <div className="grid" style={{gridTemplateColumns:"1fr 1fr"}}>
    {/* "commands show target scope and expected effect" — both as TEXT, before any button */}
    <div role="group" aria-label="Commands">
      <div className="hint">Scope: {command.scope}</div>
      <div className="hint">Effect: {command.effect}</div>
      {actions.includes("update") && <Toolbar label="Device commands">…</Toolbar>}
    </div>

    {/* "calibration retains defaults and rollback": the default is written next to the
        current value, and the way back is a button that exists even when the device does not
        answer — whoever mis-calibrated should not have to wait for the equipment */}
    <div role="group" aria-label="Calibration">
      <Field label="Head temperature offset (°C)"
        hint={`Now ${cal.current} · default ${cal.default}`}>
        <Range min={-2} max={2} step={0.1} value={cal.value} onChange={setOffset}
          aria-label="Head temperature offset in degrees Celsius" />
      </Field>
      <Button variant="ghost">Revert to default</Button>
    </div>
  </div>

  {/* "unsafe actions require gated confirmation" — the gate takes the place of the action,
      and it carries the scope and the rollback, not just a yes/no */}
  {actions.includes("update") &&
    <HumanApproval title="Update firmware" risk="high" description={command.effect}
      details={[{term:"Scope",value:command.scope},{term:"Rollback",value:"2.4.1 stays on the device"}]} />}

  <div role="group" aria-label="Audit"><div className="hint">{device.audit}</div></div>
</div>
```
