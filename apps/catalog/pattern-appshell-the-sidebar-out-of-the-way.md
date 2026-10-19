# The sidebar out of the way

`sidebarCollapsed` is controlled by the consumer, like `open` on the palette: the shell never decides on its own that the navigation should disappear. The toggle in the brand slot is emitted by the shell and drives the same sidebar on small screens, where it opens as a popover instead of a column.

## Usage

```tsx
import {AppShell, Button} from "@aurea-uds/react";
```

```tsx
const [collapsed, setCollapsed] = useState(true);

<AppShell
  brand={<strong>Acme</strong>}
  navigation={<nav aria-label="Sections">…</nav>}
  sidebarCollapsed={collapsed}
  topbar={<Button size="sm" variant="ghost" onClick={() => setCollapsed(c => !c)}>Toggle</Button>}
>
  <h1>Editor</h1>
</AppShell>
```
