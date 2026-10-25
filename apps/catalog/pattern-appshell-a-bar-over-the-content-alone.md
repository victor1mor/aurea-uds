# A bar over the content alone

Pass `topbar` and the bar comes back over the content column only, with the collapse button first in it. The sidebar keeps running from top to bottom.

## Usage

```tsx
import {AppShell, Sidebar, SearchField} from "@aurea-uds/react";
```

```tsx
<AppShell
  layout="sidebar"
  sidebarVariant="flush"
  sidebarCollapsible
  brand={<Sidebar.Brand logo="A" name="Acme" description="Workspace" />}
  topbar={<><strong>Reports</strong><SearchField aria-label="Search" placeholder="Search…" /></>}
  navItems={items}
  currentNavId="reports"
>
  <h1>Reports</h1>
</AppShell>
```
