# The bar that carries the brand and the global actions

Brand on the left, actions on the right, and nothing in between that belongs to a single page. The floating variant sits on the content; flush joins the page — pick one per application, not per screen.

## Usage

```tsx
import {Topbar, IconButton} from "@aurea-uds/react";
```

```tsx
<Topbar brand={<strong>Aurea UDS</strong>}>
  <SearchField aria-label="Search" placeholder="Search…" />
  <IconButton icon="sun" label="Switch to light" onClick={toggleTheme} />
</Topbar>
```
