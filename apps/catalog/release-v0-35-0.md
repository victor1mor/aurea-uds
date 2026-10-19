# v0.35.0

A documentation layout for the AppShell, a second row of area tabs in the Header, five docs width tokens, and snapping in the editable DependencyGraph.

This release adds a documentation layout built from existing components: [AppShell](./appshell.html) gets `layout="docs"`, the [Header](./header.html) gets a second row of area tabs, and [Container](./container.html) gets a docs width. In the editable [DependencyGraph](./dependencygraph.html), moved nodes now snap to the grid, to their neighbors and to straight edges. No new components.

## New

- **`AppShell layout="docs"`**: a documentation layout. A 1400px block centered on the screen holds the sidebar (220px), the text column (912px, each block up to 900px) and, from 1280px up, the table of contents (240px at the start of a 268px column, aligned with the right edge of the bar).
- **`AppShell layout="docs"` spacing**: the columns start 16px below the bar and stop 32px above the bottom edge. In the sidebar, items have 16px on both sides and 8px inside each item. The table of contents does not show a scrollbar.
- **`AppShell layout="docs"` on small screens**: below 1024px the sidebar becomes the drawer, and the text sits 24px from the edge.
- **`AppShell` `topbarTabs`, `topbarCurrentTab` and `topbarTabsLabel`**: pass the second row of tabs to the `Header`.
- **`Header` `tabs`, `currentTab` and `tabsLabel`**: a second row in the bar for the areas of a site. Each area has its icon and is 40px tall. The current one gets `aria-current="page"` and a 2px underline in the accent color.
- **`Header` tabs and the keyboard**: the tab row comes last in the Tab order. On phones it scrolls sideways (the page does not), and the focus ring stays inside each area.
- **`Header` tabs and `divider`**: with `tabs`, the bar has an exact height, and the `divider` line sits right below it.
- **`Container size="docs"`**, and `maxWidth="docs"` on `Header` and `Section`: the 1400px block, with 24px of padding from 768px up.
- **Five width tokens**: `--docs-width` (1400), `--docs-sidebar-width` (220), `--docs-aside-width` (268), `--docs-toc-width` (240) and `--docs-text-width` (900).

## Changed

- **The full-width line under the `Header` area tabs** is the second line Aurea draws under its no-lines rule, alongside `Card variant="outline"`.
- **`DependencyGraph`, editable mode: moved nodes stay aligned.** With the grid on, the automatic layout now lands on the 16px grid, and the edges follow the node.
- **`DependencyGraph`, dragging a node**: the node snaps to the edge or center of a neighbor within 8px, and to the position where its connected edge becomes straight. A guide appears in the focus color and thickness (`.graph-guide`).
- **`DependencyGraph`, before this release**: nodes started off the grid and only snapped later, leaving a step in the edge. An edge leaving a port that is not centered never became straight.

## Update

On the web:

```bash
pnpm add @aurea-uds/react@0.35.0 @aurea-uds/core@0.35.0 @aurea-uds/fonts@0.35.0 @aurea-uds/icons@0.35.0
```

On React Native:

```bash
pnpm add @aurea-uds/native@0.35.0
```
