# Sections with the list over the page

`sidebarPanel="overlay"`: the rail of sections stays narrow, and the list of a section opens over the page, next to its icon. Focus moves into the list, and Escape or a click outside closes it.

## Usage

```tsx
import {AppShell, Sidebar, Badge} from "@aurea-uds/react";
```

```tsx
<AppShell
  layout="sidebar"
  sidebarPanel="overlay"
  brand={<Sidebar.Brand variant="plain" logo={<Icon name="cube" />} name="Acme" />}
  navItems={sections}
  currentNavId="orders"
>
  <h1>Orders</h1>
</AppShell>
```
