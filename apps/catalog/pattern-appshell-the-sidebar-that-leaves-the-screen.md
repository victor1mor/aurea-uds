# The sidebar that leaves the screen

`sidebarCollapsible="offcanvas"`: collapsed, the sidebar leaves the screen and the content takes the whole width. The button beside the title brings it back. It is the reference's off-canvas mode.

## Usage

```tsx
import {AppShell, Sidebar} from "@aurea-uds/react";
```

```tsx
<AppShell
  layout="sidebar"
  sidebarVariant="flush"
  sidebarCollapsible="offcanvas"
  brand={<Sidebar.Brand variant="plain" logo={<Icon name="cube" />} name="Acme" />}
  navItems={items}
  currentNavId="docs"
>
  <div style={{display: "flex", alignItems: "center", gap: "var(--space-3)"}}>
    <AppShell.SidebarToggle />
    <h1>Docs</h1>
  </div>
</AppShell>
```
