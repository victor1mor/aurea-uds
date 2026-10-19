# When switching a tab costs a request

With the default, the arrow key switches the panel along with focus — right when the panel is already there. When each tab fetches, that means crossing five tabs fires five requests. `activateOnFocus={false}` is the APG's manual pattern: the arrow only moves focus, and Enter or Space commits. The choice belongs to the panel's cost, not to taste.

## Usage

```tsx
import {Tabs} from "@aurea-uds/react";
```

```tsx
<Tabs
  label="Report"
  activateOnFocus={false}
  value={tab}
  onChange={setTab}
  tabs={[
    {id: "summary", label: "Summary", content: <Summary />},
    {id: "runs", label: "Runs", content: <Runs />},
    {id: "audit", label: "Audit log", content: <AuditLog />},
  ]}
/>
```
