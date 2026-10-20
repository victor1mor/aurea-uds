# A column of sections beside the content

`orientation="vertical"` when the labels are words rather than one-word nouns, or when there are more of them than a row can hold without scrolling. The root becomes a grid and not a row: on a row the panel and the list share a line, and a tall panel would stretch the label column with it.

## Usage

```tsx
import {Tabs} from "@aurea-uds/react";
```

```tsx
<Tabs
  orientation="vertical"
  label="Settings"
  value={section}
  onChange={setSection}
  tabs={[
    {id: "profile", label: "Profile", content: <Profile />},
    {id: "notifications", label: "Notifications", content: <Notifications />},
    {id: "billing", label: "Billing and invoices", content: <Billing />},
  ]}
/>
```
