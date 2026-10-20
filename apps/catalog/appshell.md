# AppShell

Application frame: sidebar, topbar and main content.

## Usage

```tsx
import {AppShell} from "@aurea-uds/react";
```

```tsx
<AppShell
  brand={<strong>Acme</strong>}
  navigation={<nav aria-label="Contents"><a href="/inbox" aria-current="page">Inbox</a><a href="/archive">Archive</a></nav>}
  topbar={<Button variant="primary" size="sm">New</Button>}
>
  <h1>Inbox</h1>
</AppShell>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `brand` | `ReactNode` | — | Logotype and product name. Lives in the topbar, beside the navigation toggle. |
| `navigation` | `ReactNode` | — | The sidebar content, usually a <nav>. The shell never invents one, so the landmark and its label are yours. |
| `navItems` | `SidebarItem[]` | — | The sidebar list, handed to the Sidebar the shell already creates — same shape as Sidebar items. Use this instead of passing a second <Sidebar> as navigation: that nests two panels, two borders and two 22px radii, and the inner one clips its text. When navigation is also given, the list comes first. |
| `currentNavId` | `string` | — | The id of the current item in navItems. Marked with aria-current="page" and the selected skin. |
| `navLabel` | `string` | — | Accessible name of the <nav> built from navItems. Falls back to the sidebarLabel string. |
| `topbar` | `ReactNode` | — | What sits in the topbar next to the brand: sections, search, actions. |
| `topbarVariant` | `"floating" \| "flush"` | "floating" | Skin of the topbar. flush removes the outer gap, and the sidebar rises to meet it. |
| `sidebarVariant` | `"floating" \| "flush" \| "plain"` | "floating" | Skin of the sidebar, forwarded to it. flush is the one exception this design system makes to its floating surfaces: the panel sits against the edges, takes the full height and is separated from the content by a single rule. Without this prop the variant would be unreachable for anyone composing through the shell, which is the normal path. |
| `sidebarScrollbar` | `hover \| visible` | hover | The left sidebar's scrollbar, forwarded to it: hover (light, shown with the pointer over it, with focus inside and on touch screens) or visible (always on screen). |
| `sidebarCollapsed` | `boolean` | false | Narrows the sidebar panel to --sidebar-rail. A floating panel keeps its two outer margins in the grid track; flush uses the token as the raw track width. Controlled by you, like the palette's open: the shell does not decide when to collapse. Without sidebarCollapsible it draws no button; with it, the button calls onSidebarCollapsedChange and you decide. Below 1024px the drawer is never a rail, controlled or not: collapsed inside the drawer it was a column of unnamed icons. |
| `sidebarCollapsible` | `boolean` | false | Draws the collapse button at the top of the junction between the sidebar and the content — centred on the gap, level with the first item, sticky with the sidebar — and turns the sidebar into the rail on its own between 1024 and 1279px. Off by default: without it the shell is exactly the one before, and an app that already drives sidebarCollapsed with its own button does not get a second one. Behaviour read from the sidebar that one of the references uses (the main reference library has no app frame). |
| `defaultSidebarCollapsed` | `boolean` | — | Starts collapsed without controlling it. The person's choice holds until the window crosses 1280px; then the width decides again. |
| `onSidebarCollapsedChange` | `(collapsed: boolean) => void` | — | Called on every change — the button, or the width crossing 1280px. Keeping the preference is the app's job, as before. |
| `children` | `ReactNode` | — | Page content. Rendered inside the <main> the shell owns. |
| `topbarDivider` | `boolean` | false | Passes Topbar's `divider` to the flush bar the shell builds. |
| `layout` | `"app" \| "docs"` | "app" | The arrangement. docs is the one of the reference documentation: one block of 1400 in the middle of the screen with the sidebar (220), the text and, from 1280 up, the table of contents (240 at the start of a 268 column); the bar on top is the small one, on the same block. Both columns start 16 below the bar and stop 32 above the bottom of the screen; inside the sidebar, 16 on both sides and 8 inside each item; the table of contents shows no scrollbar. Below 1024 the sidebar is the drawer and the text keeps 24 from the edge. |
| `topbarTabs` | `HeaderTab[]` | — | The second row of the bar on top: the site's areas, forwarded as the Header's tabs. |
| `topbarCurrentTab` | `string` | — | The id of the current area, forwarded as the Header's currentTab. |
| `topbarTabsLabel` | `string` | "Sections" | The accessible name of the second row, forwarded as the Header's tabsLabel. |
| `contentVariant` | `"surface" \| "plain"` | "surface" | `plain` removes the box around the content area. `.content` is a card — same background, border and radius as `.card` — so a Card inside it would be a box inside an identical box. The margin stays. |
| `aside` | `ReactNode` | — | The right-hand column — a documentation page's "On this page" (a TableOfContents). From 1280 up it is the third column; below, it follows the content. |
| `asideLabel` | `string` | strings.tocLabel | The right column's name for screen readers. |
| `asideVariant` | `"floating" \| "flush" \| "plain"` | sidebarVariant | Skin of the right-hand column. Without it, the same as the left sidebar. plain removes the box — the items sit loose on the page, like a documentation page's "On this page". |
