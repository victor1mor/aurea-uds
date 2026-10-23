# v0.42.0

AppShell with the sidebar from top to bottom.

`AppShell` gets a third arrangement: the sidebar runs from the top of the window to the bottom, with the brand inside it, and the bar that spans the window is gone. Without the new prop, nothing changes.

## Added

- **`AppShell layout="sidebar"`.** The sidebar runs from the top to the bottom (a flush sidebar against the edges, a floating one with its margin), and `brand` lives at its top. The top bar exists only when you pass `topbar`, and then it sits over the content column alone: the small one (56), flush, with its items starting from the left.
- **`AppShell.SidebarToggle`.** The collapse button for this arrangement: a bare icon button with the sidebar glyph, 12 from the page title. With a top bar, the shell puts it first in the bar; without one, place it beside your own title. The round button at the junction stays in the default arrangement.
- **`sidebarFooter` on `AppShell`.** The fixed bottom of the sidebar (the person and the sign-out, a short list), in every arrangement.
- **Breathing room.** With a flush sidebar, the content sits 16 away from it. Below 1024, without a top bar, a 56 strip holds the drawer button and the brand.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.42.0 @aurea-uds/core@0.42.0 @aurea-uds/fonts@0.42.0 @aurea-uds/icons@0.42.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.42.0
```
