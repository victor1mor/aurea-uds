# The sidebar from top to bottom

`layout="sidebar"` drops the bar that spans the window: the sidebar runs from the top to the bottom, the brand lives at its top and the person at its bottom, and only the list scrolls. The collapse button sits beside the page title (`AppShell.SidebarToggle`).

## Usage

```tsx
import {AppShell, Sidebar, Avatar, IconButton} from "@aurea-uds/react";
```

```tsx
<AppShell
  layout="sidebar"
  sidebarVariant="flush"
  sidebarCollapsible
  brand={<Sidebar.Brand logo="A" name="Acme" description="Workspace" />}
  sidebarFooter={<Sidebar.User avatar={<Avatar fallback="KM" alt="" />} name="Kate Moore" description="Admin"
    action={<IconButton icon="sign-out" label="Log out" size="sm" />} />}
  navItems={items}
  currentNavId="reports"
>
  <div style={{display: "flex", alignItems: "center", gap: "var(--space-3)"}}>
    <AppShell.SidebarToggle />
    <h1>Reports</h1>
  </div>
</AppShell>
```
