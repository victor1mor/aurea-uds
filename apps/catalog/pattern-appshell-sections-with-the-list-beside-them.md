# Sections with the list beside them

`sidebarPanel="docked"`: the first level of `navItems` becomes sections — a rail of icons — and the list of the chosen section sits in a panel beside it. Collapsing hides the panel and keeps the rail.

## Usage

```tsx
import {AppShell, Sidebar, Badge} from "@aurea-uds/react";
```

```tsx
<AppShell
  layout="sidebar"
  sidebarCollapsible
  sidebarPanel="docked"
  brand={<Sidebar.Brand variant="plain" logo={<Icon name="cube" />} name="Acme" />}
  navItems={[
    {id: "home", label: "Home", icon: "house", items: [
      {id: "overview", label: "Overview", icon: "squares-four", href: "/"},
      {id: "orders", label: "Orders", icon: "receipt", href: "/orders"},
    ]},
    {id: "dashboard", label: "Dashboard", icon: "chart-bar", items: [
      {id: "analytics", label: "Analytics", icon: "chart-line", href: "/analytics"},
    ]},
  ]}
  currentNavId="orders"
>
  <h1>Orders</h1>
</AppShell>
```
