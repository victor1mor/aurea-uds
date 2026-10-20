# Two readings of the same thing

Tabs are for alternative views of one subject, never for steps — a step has an order and a tab does not. If the user must visit all of them, it was a form, not a tab set.

## Usage

```tsx
import {Tabs} from "@aurea-uds/react";
```

```tsx
const [tab, setTab] = useState("preview");

<Tabs
  label="Component view"
  value={tab}
  onChange={setTab}
  tabs={[
    {id: "preview", label: "Preview", content: <Preview />},
    {id: "code", label: "Code", content: <Code />},
  ]}
/>
```
