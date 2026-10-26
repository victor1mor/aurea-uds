# The collapse button inside the sidebar

`sidebarToggle="none"` keeps the shell from placing its own button, and the app puts `Sidebar.Toggle` where it wants — here, as the `action` of the brand at the top of the sidebar. Collapsed, the button moves under the logo.

## Usage

```tsx
import {AppShell, Sidebar} from "@aurea-uds/react";
```

```tsx
<AppShell
  layout="sidebar"
  sidebarVariant="flush"
  sidebarCollapsible="icon"
  sidebarToggle="none"
  brand={<Sidebar.Brand variant="plain" logo={<Icon name="cube" />} name="Acme" action={<Sidebar.Toggle />} />}
  navItems={items}
  currentNavId="schedule"
>
  <h1>Schedule</h1>
</AppShell>
```
