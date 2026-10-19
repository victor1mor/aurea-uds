# A topbar joined to the page

`topbarVariant="flush"` drops the floating surface and welds the bar to the top edge. Pick one of the two per application and hold it: floating on one screen and flush on the next reads as two products, not as two screens.

## Usage

```tsx
import {AppShell, SearchField} from "@aurea-uds/react";
```

```tsx
<AppShell
  topbarVariant="flush"
  brand={<strong>Acme</strong>}
  navigation={<nav aria-label="Sections">…</nav>}
  topbar={<SearchField aria-label="Search" placeholder="Search…" />}
>
  <h1>Reports</h1>
</AppShell>
```
