# The sidebar that becomes a capsule

`sidebarCollapsible="capsule"`: collapsed, the floating sidebar keeps its rail of icons with the control radius — a capsule — instead of the card radius. The button at the seam collapses and expands it, and so does Ctrl+B (Cmd+B on a Mac).

## Usage

```tsx
import {AppShell, Sidebar} from "@aurea-uds/react";
```

```tsx
<AppShell
  layout="sidebar"
  sidebarCollapsible="capsule"
  defaultSidebarCollapsed
  brand={<Sidebar.Brand variant="plain" logo={<Icon name="cube" />} name="Acme" />}
  navItems={items}
  currentNavId="tasks"
>
  <div style={{display: "flex", alignItems: "center", gap: "var(--space-3)"}}>
    <AppShell.SidebarToggle />
    <h1>Tasks</h1>
  </div>
</AppShell>
```
