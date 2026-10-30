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

## Examples

### The documentation arrangement

layout="docs" is the arrangement of this site: one block in the middle of the screen with the sidebar, the text and the table of contents. Here the sidebar, the content and the aside have no box (plain).

```tsx
<AppShell
  layout="docs"
  sidebarVariant="plain"
  contentVariant="plain"
  asideVariant="plain"
  brand={<strong>Acme</strong>}
  navigation={<nav aria-label="Contents"><a href="/inbox" aria-current="page">Inbox</a></nav>}
  aside={<p>On this page</p>}
>
  <h1>Inbox</h1>
</AppShell>
```

### A floating aside, and the scrollbar always on

asideVariant="floating" puts the right column in a card of its own; sidebarScrollbar="visible" keeps the sidebar's scrollbar showing, instead of only under the pointer.

```tsx
<AppShell
  asideVariant="floating"
  sidebarScrollbar="visible"
  brand={<strong>Acme</strong>}
  navigation={<nav aria-label="Contents"><a href="/inbox" aria-current="page">Inbox</a></nav>}
  aside={<p>On this page</p>}
>
  <h1>Inbox</h1>
</AppShell>
```

### A flush aside

asideVariant="flush" glues the right column to the edge of the window, like the flush sidebar.

```tsx
<AppShell
  asideVariant="flush"
  sidebarVariant="flush"
  brand={<strong>Acme</strong>}
  navigation={<nav aria-label="Contents"><a href="/inbox" aria-current="page">Inbox</a></nav>}
  aside={<p>On this page</p>}
>
  <h1>Inbox</h1>
</AppShell>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `brand` | `ReactNode` | — | Logotype and product name. Lives in the topbar, beside the navigation toggle. With layout="sidebar" it lives at the top of the sidebar instead (a Sidebar.Brand fits there). |
| `navigation` | `ReactNode` | — | The sidebar content, usually a <nav>. The shell never invents one, so the landmark and its label are yours. |
| `navItems` | `SidebarEntry[]` | — | The sidebar list, handed to the Sidebar the shell already creates — same shape as Sidebar items. Use this instead of passing a second <Sidebar> as navigation: that nests two panels, two borders and two 22px radii, and the inner one clips its text. When navigation is also given, the list comes first. |
| `currentNavId` | `string` | — | The id of the current item in navItems. Marked with aria-current="page" and the selected skin. |
| `navLabel` | `string` | — | Accessible name of the <nav> built from navItems. Falls back to the sidebarLabel string. |
| `topbar` | `ReactNode` | — | What sits in the topbar next to the brand: sections, search, actions. |
| `topbarVariant` | `"floating" \| "flush"` | "floating" | Skin of the topbar. flush removes the outer gap, and the sidebar rises to meet it. |
| `sidebarVariant` | `"floating" \| "flush" \| "plain"` | "floating" | Skin of the sidebar, forwarded to it. flush is the one exception this design system makes to its floating surfaces: the panel sits against the edges, takes the full height and is separated from the content by a single rule. Without this prop the variant would be unreachable for anyone composing through the shell, which is the normal path. |
| `sidebarScrollbar` | `hover \| visible` | hover | The left sidebar's scrollbar, forwarded to it: hover (light, shown with the pointer over it, with focus inside and on touch screens) or visible (always on screen). |
| `sidebarFooter` | `ReactNode` | — | The fixed bottom of the sidebar (Sidebar footer): the person and the sign-out (Sidebar.User), a short list (Sidebar.Nav). Only the list in the middle scrolls. Works in every layout. |
| `AppShell.SidebarToggle` | `component` | — | The collapse button of layout="sidebar": the bare icon button with the sidebar glyph, placed 12 from the page title. With a topbar the shell puts it first in the bar; without one, place it beside your own title. It renders nothing without sidebarCollapsible, and hides below 1024, where the drawer button opens the sidebar. |
| `sidebarCollapsed` | `boolean` | false | Narrows the sidebar panel to --sidebar-rail. A floating panel keeps its two outer margins in the grid track; flush uses the token as the raw track width. Controlled by you, like the palette's open: the shell does not decide when to collapse. Without sidebarCollapsible it draws no button; with it, the button calls onSidebarCollapsedChange and you decide. Below 1024px the drawer is never a rail, controlled or not: collapsed inside the drawer it was a column of unnamed icons. |
| `sidebarCollapsible` | `boolean \| "icon" \| "capsule" \| "offcanvas"` | false | Draws the collapse button at the top of the junction between the sidebar and the content — centred on the gap, level with the first item, sticky with the sidebar — and turns the sidebar into the rail on its own between 1024 and 1279px. Off by default: without it the shell is exactly the one before, and an app that already drives sidebarCollapsed with its own button does not get a second one. Behaviour read from the sidebar that one of the references uses (the main reference library has no app frame). It also names HOW the sidebar collapses: true or "icon" (the rail), "capsule" (the rail with the capsule radius) or "offcanvas" (the sidebar leaves the screen and the track goes to zero). The shell then puts the sidebar in a Sidebar.Provider, so Sidebar.Toggle and useSidebar work anywhere inside it. |
| `sidebarToggle` | `"edge" \| "none"` | edge | Where the shell puts its collapse button. edge: at the seam between the sidebar and the content (in layout="sidebar", at the start of the content bar). none: the shell puts none, and the app places Sidebar.Toggle where it wants — inside the sidebar next to the brand, or as a row at the bottom. |
| `sidebarShortcut` | `boolean` | true | Ctrl+B (Cmd+B on a Mac) collapses and expands the sidebar; below 1024 it opens and closes the drawer. On with sidebarCollapsible, as in the reference. It does not act while the person is typing in a field. |
| `sidebarIndicator` | `"brand" \| "segment" \| "segment-dot" \| "segment-line" \| "subtle"` | brand | How the current item of the sidebar is drawn — the indicator of the Sidebar: brand (the default), segment, segment-dot, segment-line or subtle. |
| `sidebarPanel` | `"docked" \| "overlay"` | — | Sections with a panel — the panel of the Sidebar: the first level of navItems becomes sections. docked puts the list beside the rail (collapsing hides the list); overlay opens it over the page. |
| `sidebarContrast` | `boolean` | false | A dark sidebar on any page — the contrast of the Sidebar, forwarded to it: dark on a light page, darker than the page on a dark one. |
| `defaultSidebarCollapsed` | `boolean` | — | Starts collapsed without controlling it. The person's choice holds until the window crosses 1280px; then the width decides again. |
| `onSidebarCollapsedChange` | `(collapsed: boolean) => void` | — | Called on every change — the button, or the width crossing 1280px. Keeping the preference is the app's job, as before. |
| `children` | `ReactNode` | — | Page content. Rendered inside the <main> the shell owns. |
| `topbarDivider` | `boolean` | false | Passes Topbar's `divider` to the flush bar the shell builds. |
| `layout` | `"app" \| "docs" \| "sidebar"` | "app" | The arrangement. docs is the one of the reference documentation: one block of 1400 in the middle of the screen with the sidebar (220), the text and, from 1280 up, the table of contents (240 at the start of a 268 column); the bar on top is the small one, on the same block. Both columns start 16 below the bar and stop 32 above the bottom of the screen; inside the sidebar, 16 on both sides and 8 inside each item; the table of contents shows no scrollbar. From 768 up the sidebar is a column; below, it is a drawer that opens from the end of the bar, where its button goes (after the bar's actions). Below 1280 the table of contents is a sticky bar under the top bar, 40 high, with the name of the section in view; it opens the list as a drawer. On a phone the text keeps 24 from the edge and 32 below that bar. "sidebar": the sidebar runs from the top of the window to the bottom, with the brand at its top (the sidebar header); the topbar exists only when you pass `topbar`, and then it sits over the content column alone. With sidebarVariant, floating or flush. The collapse button is AppShell.SidebarToggle, beside the page title. |
| `topbarTabs` | `HeaderTab[]` | — | The second row of the bar on top: the site's areas, forwarded as the Header's tabs. |
| `topbarCurrentTab` | `string` | — | The id of the current area, forwarded as the Header's currentTab. |
| `topbarTabsLabel` | `string` | "Sections" | The accessible name of the second row, forwarded as the Header's tabsLabel. |
| `contentVariant` | `"surface" \| "plain"` | "surface" | `plain` removes the box around the content area. `.content` is a card — same background, border and radius as `.card` — so a Card inside it would be a box inside an identical box. The margin stays. |
| `aside` | `ReactNode` | — | The right-hand column — a documentation page's "On this page" (a TableOfContents). From 1280 up it is the third column; below, it follows the content. With the docs layout, below 1280 it is the drawer of the table-of-contents bar instead. |
| `asideLabel` | `string` | strings.tocLabel | The right column's name for screen readers. |
| `asideVariant` | `"floating" \| "flush" \| "plain"` | sidebarVariant | Skin of the right-hand column. Without it, the same as the left sidebar. plain removes the box — the items sit loose on the page, like a documentation page's "On this page". |
| `topbarTabsEnd` | `ReactNode` | — | The end of the areas row (the Header's tabsEnd): the Web \| Native switch of a documentation site. |
