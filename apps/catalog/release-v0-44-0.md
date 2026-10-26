# v0.44.0

The whole sidebar — three ways to collapse, its state outside the AppShell with Ctrl+B, groups that fold, actions, separators, avatars, sections with a panel and five ways to draw the current item.

The sidebar gets everything that was missing: three ways to collapse, its own state outside the `AppShell` (with a hook and the Ctrl+B shortcut), groups that fold, an action beside a group or an item, a gap between sections, a photo in place of the icon, sections with a panel and five ways to draw the current item. The defaults do not change, except two measurements: the text of a sidebar item now starts 4 further in, aligned with the line under the selected item, and a sidebar outside the `AppShell` now runs from the top of the window to the bottom. Read the Breaking changes section if your code reads the items of a sidebar.

## New

- **`Sidebar collapsible`** (`icon`, `capsule`, `offcanvas`): how the sidebar looks when collapsed. `icon` is the rail of icons, as before; `capsule` is the same rail with the capsule radius; `offcanvas` takes the sidebar off the screen. On the `AppShell`, `sidebarCollapsible` now takes the same names as well as `true`.
- **`Sidebar.Provider`, `Sidebar.Toggle` and `useSidebar`**: the sidebar state outside the `AppShell` — collapsed or not, controlled or not — and a collapse button that works anywhere under the provider: beside the page title, inside the sidebar, or as a row at the bottom (`Sidebar.Toggle variant="item"`). The `AppShell` uses the same provider, so `Sidebar.Toggle` and `useSidebar` work inside it too. `useSidebar` returns `null` outside a provider.
- **Ctrl+B (Cmd+B on a Mac) collapses and expands the sidebar**, under a `Sidebar.Provider` and in an `AppShell` with `sidebarCollapsible`; below 1024 it opens and closes the drawer. It does not act while you type in a field. Turn it off with `shortcut={false}` on the provider or `sidebarShortcut={false}` on the `AppShell`.
- **`AppShell sidebarToggle`** (`edge`, `none`): with `none`, the shell does not place its own collapse button, and you place `Sidebar.Toggle` where you want.
- **`Sidebar.Brand action`**: an action beside the brand — the collapse button inside the sidebar. Collapsed, it moves under the logo.
- **On a sidebar item: `avatar`**, a photo or a team logo in place of the icon, which stays on the rail; **`action`**, a small button beside the item or the group, next to the link and never inside it, hidden on the rail; and, on a group, **`collapsible` and `defaultOpen`**: the group name becomes a button that folds its list.
- **`"separator"` in the list of a sidebar** splits it in two with a gap, without a line.
- **`Sidebar panel`** (`docked`, `overlay`), and **`AppShell sidebarPanel`**: the first level of items becomes sections on a rail, and the list of the chosen section lives in a panel — beside the rail, or over the page next to its icon. The section of the current page carries `aria-current="true"`.
- **`Sidebar indicator`** (`brand`, `segment`, `segment-dot`, `segment-line`, `subtle`), and **`AppShell sidebarIndicator`**: how the current item is drawn. `brand` is the default and does not change.

## Changed

- **The text of a sidebar item starts 16 from the edge of the item, where the line under the selected item starts** (it was 12, with the line at 15). The group headings and the brand move with it. In the documentation layout of the `AppShell` the text stays where it was, and the line moves from 15 to 16.
- **A sidebar outside the `AppShell` runs from the top of the window to the bottom**, with its own margin. It used to keep room for a top bar that was not there. If your page has its own bar above the sidebar, set its height in `--sidebar-offset`.
- **On the rail, a collapsed sidebar hides the sublists.** A sub-item without an icon used to become an empty button there. The parent item stays, with its name in the tooltip.
- **`BottomNav` accepts the same list as the sidebar with `"separator"` in it**, and ignores the separators.

## The documentation site

- **The sidebar page** shows every new option alive: the current item five ways, the capsule, the sidebar that leaves the screen with its own state, the sections with a panel beside the rail and over the page, the groups that fold with actions, the separators and the avatars.
- **Six new `AppShell` patterns**: the sidebar that becomes a capsule, the sidebar that leaves the screen, the collapse button inside the sidebar, sections with the list beside them or over the page, and the current item five ways, with a switch to try them.
- **A page for `useSidebar`**, among the hooks.
- **Every whole-page preview is alive**, including the `AppShell` patterns: the collapse buttons respond.

## Breaking changes

- **The type of `SidebarItem.items` is now `SidebarEntry[]`**, which includes the string `"separator"`. If your code reads `item.items` and treats every entry as an item, check for `"separator"` first. Passing lists does not change: a list without separators is still valid.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.44.0 @aurea-uds/core@0.44.0 @aurea-uds/fonts@0.44.0 @aurea-uds/icons@0.44.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.44.0
```
