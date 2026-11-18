# v0.73.0

onPress on the web, and layout pieces that keep their size anywhere — alone, in a Stack, a Cluster or a Grid.

## Changed

- **`onPress` on the web**, the same name as on native: `Button`, `IconButton`, `CloseButton`, `ToolbarButton`, `Card` and the items of `Sidebar`, `NavList`, `Stepper`, `BottomNav`, `Header`, the menus and `NotificationCenter`. `onClick` still works, as an alias; with both, both run, `onPress` first.
- **A `Sidebar` outside `AppShell` has its own width** (`--sidebar-width`; collapsed, `--sidebar-rail`) — alone, in a column, a row or a grid — and never grows wider than the space it gets. Inside `AppShell`, nothing changes.
- **`SegmentedControl` keeps the width of its content everywhere.** In a column it used to stretch to the edge. To fill the row, use `fullWidth`.
- **`TableOfContents` fills the box it is in.** In a column it used to shrink to its text. It still sticks while the page scrolls.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.73.0 @aurea-uds/core@0.73.0 @aurea-uds/fonts@0.73.0 @aurea-uds/icons@0.73.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.73.0
```
