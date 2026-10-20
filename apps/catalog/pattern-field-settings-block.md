# Settings block

A short settings form: text, long text and two toggles, in one column with a single primary action.

## Usage

```tsx
import {Field, Input, Textarea, Switch, Checkbox, Button} from "@aurea-uds/react";
```

```tsx
<Field label="Workspace"><Input defaultValue="Acme" /></Field>
<Field label="Description"><Textarea rows={3} /></Field>
<Switch label="Email notifications" defaultChecked />
<Checkbox label="Public workspace" />
<Button variant="primary">Save changes</Button>
```
