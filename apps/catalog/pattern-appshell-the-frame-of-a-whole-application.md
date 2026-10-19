# The frame of a whole application

Brand and global actions on the topbar, the sections on the sidebar, the screen in the middle. It is the only component that owns page landmarks — one per document, never nested — and it emits the skip link for free, which is what closes WCAG 2.4.1 without the consumer writing anything.

## Usage

```tsx
import {AppShell, Button, IconButton} from "@aurea-uds/react";
```

```tsx
<AppShell
  brand={<strong>Acme</strong>}
  navigation={<nav aria-label="Sections"><a href="/inbox" aria-current="page">Inbox</a><a href="/archive">Archive</a></nav>}
  topbar={<><IconButton icon="bell" label="Notifications" /><Button variant="primary" size="sm">New</Button></>}
>
  <h1>Inbox</h1>
  <p>Nothing needs your attention.</p>
</AppShell>
```
