# A website header, with the current page marked

The same list the Sidebar and the BottomNav take goes in items, and current marks the page you are on. Below 768px the links leave the bar and drop into the menu panel; the actions stay in the bar. maxWidth lines the bar up with the Container of the page.

## Usage

```tsx
import {Header, Button} from "@aurea-uds/react";
```

```tsx
<Header
  variant="flush"
  divider
  maxWidth="xl"
  brand={<strong>Acme</strong>}
  items={items}
  current="pricing"
  navLabel="Main"
  menuLabel="Menu"
  actions={<Button variant="primary" size="sm">Sign up</Button>}
/>
```
