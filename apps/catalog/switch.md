# Switch

Switch applies now. Flip it and the setting is on — no Save button in between. That is the whole difference from Checkbox, which changes a value the form will submit later. It carries role="switch", so the screen reader says "on" and "off" instead of "checked".

## Usage

```tsx
import {Switch} from "@aurea-uds/react";
```

```tsx
<Switch label="Email notifications" defaultChecked />
<Switch label="Weekly digest" />
<Switch label="Mentions only" />
```

- role="switch": announced as on/off, which is what an immediate setting is.

- The label is required and part of the target — the words toggle it too.

- Effect is immediate. If the change needs a Save button, the control is a Checkbox.

- Never use it for a destructive setting without confirmation: there is no submit step to think in.

## Examples

### On a surface

Inside a Card, with the section title above: the setting reads as part of that area.

```tsx
<Card>
  <strong>Notifications</strong>
  <Switch label="Email" defaultChecked />
  <Switch label="Push" />
</Card>
```

### With a description, and the switch at the end

The muted line under the name, and indicatorPlacement="end" to put the switch after the text — the reference's notification setting.

```tsx
<Switch label="Allow notifications" description="Receive push notifications" defaultChecked />
<Switch label="Allow notifications" description="Receive push notifications" defaultChecked
  indicatorPlacement="end" />
```

### Without a visible label

When the name is already on screen beside it, labelHidden keeps it for the screen reader only.

```tsx
<Switch label="Dark mode" labelHidden defaultChecked />
```

### Disabled

Locked by the plan or by permission — the state stays visible, the control does not.

```tsx
<Switch label="Audit log" disabled />
<Switch label="SSO" defaultChecked disabled />
```

### Sizes

The system's size step — sm, md and lg, the same scale as the fields beside it. md is the default.

```tsx
<Switch label="Compact mode" defaultChecked size="sm" />
<Switch label="Sound effects" defaultChecked />
<Switch label="Large text" defaultChecked size="lg" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `ReactNode` | — | REQUIRED. A switch with no label is a mystery toggle. |
| `labelHidden` | `boolean` | false | Keeps the label in the DOM but out of sight, as the Checkbox does — for a switch whose name is already on screen beside it. |
| `description` | `ReactNode` | — | A muted line under the label, as the Checkbox and the reference — then the label is set in bold. |
| `indicatorPlacement` | `"start" \| "end"` | "start" | Where the switch sits: before the label (the default) or after it, with the label and description on the left — the same name as the native RadioGroup. |
| `checked / defaultChecked` | `boolean` | — | Controlled or uncontrolled. role="switch" is set for you. |
| `disabled` | `boolean` | false | Native disabled. |
| `className` | `string` | — | Extra classes. Switch applies immediately; a Checkbox waits for the form to be submitted. |
| `size` | `Responsive<FieldSize>` | md | The system's size step. |
