# Settings form

One column of fields, toggles grouped at the end, a single primary action and a ghost escape.

## Usage

```tsx
import {Card, Field, Input, Select, Textarea, Switch, Button} from "@aurea-uds/react";
```

```tsx
<Card>
  <div className="grid" style={{gridTemplateColumns:"1fr 1fr"}}>
    <Field label="Workspace name"><Input defaultValue="Acme" /></Field>
    <Field label="Region">
      <Select defaultValue="eu"><option value="eu">Europe</option><option value="us">United States</option></Select>
    </Field>
  </div>
  <Field label="Description" hint="Shown to every member."><Textarea rows={2} /></Field>
  <div className="grid" style={{gridTemplateColumns:"1fr 1fr"}}>
    <Switch label="Email notifications" defaultChecked />
    <Switch label="Weekly digest" />
  </div>
  <div className="cluster"><Button variant="ghost">Discard</Button><Button variant="primary">Save changes</Button></div>
</Card>
```
