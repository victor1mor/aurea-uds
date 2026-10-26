# useSidebar

The sidebar state — collapsed, setCollapsed, toggle — inside Sidebar.Provider or an AppShell with sidebarCollapsible.

## Usage

```tsx
import {useSidebar} from "@aurea-uds/react";
```

```tsx
function FocusMode() {
  const sidebar = useSidebar();
  if (!sidebar) return null;
  return (
    <Button onClick={sidebar.toggle}>
      {sidebar.collapsed ? "Show the sidebar" : "Hide the sidebar"}
    </Button>
  );
}

<Sidebar.Provider>
  <FocusMode />
</Sidebar.Provider>
```
