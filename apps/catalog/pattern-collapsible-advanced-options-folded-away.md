# Advanced options, folded away

The default answer for a form section most people never open. `defaultOpen` is left off and the state stays inside the component — a consumer that does not need to read the state should not have to hold it.

## Usage

```tsx
import {Collapsible, Field, Input, Switch} from "@aurea-uds/react";
```

```tsx
<Collapsible trigger="Advanced">
  <Field label="Timeout (ms)"><Input defaultValue="30000" inputMode="numeric" /></Field>
  <Switch label="Retry on failure" defaultChecked />
</Collapsible>
```
