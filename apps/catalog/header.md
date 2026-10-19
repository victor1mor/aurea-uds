# Header

The top bar of an app or a website — also called header, navbar or top bar. Brand, the site's links with the current page marked, actions, and on a phone a menu button that drops the links below the bar.

## Usage

```tsx
import {Header} from "@aurea-uds/react";
```

```tsx
<Header
  variant="flush"
  divider
  maxWidth="xl"
  brand={<strong>Acme</strong>}
  items={[
    {id: "home", label: "Home", href: "/"},
    {id: "pricing", label: "Pricing", href: "/pricing"},
    {id: "docs", label: "Docs", href: "/docs"},
  ]}
  current="pricing"
  actions={<Button variant="primary" size="sm">Sign up</Button>}
/>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `floating \| flush \| pill` | floating | The skin. floating is a detached card; flush merges into the background so the bar frames the window; pill is a centred capsule for a site header — not for a shell, because search plus density plus theme plus command do not fit in a capsule. |
| `brand` | `ReactNode` | — | The lockup. It lives here and not in the sidebar: the top crosses the full width and the side panel starts below it. Inside a shell this is also where the drawer toggle sits, injected before what you pass. |
| `children` | `ReactNode` | — | Everything beside the brand: sections, search, actions, account. Presentational — the bar never decides what collapses. It wraps by content, so text at 200% breaks it to a second line instead of overflowing; hide what is secondary with hide-below-md/lg. |
| `divider` | `boolean` | false | Only on `flush`: a hairline under the bar. flush has the page's background and sticks to the top, so without a line the content scrolls under it with nothing saying where the bar ends. |
| `items` | `SidebarItem[]` | — | The website's links — the same list the Sidebar and the BottomNav take, so the app keeps one menu. Uses id, label, href and render (the router link); sub-items, icon and onClick are ignored: the bar is flat. Below 768px they leave the bar and drop into the menu panel. |
| `current` | `string` | — | The id of the current page's item: it gets aria-current="page", the highlight colour and the medium weight, in the bar and in the menu panel. |
| `actions` | `ReactNode` | — | What sits on the right: search, a call to action, the account. It stays in the bar on a phone too. |
| `maxWidth` | `"sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "docs" \| "full"` | — | How far the bar's content grows, on the Container's scale, so the bar lines up with the page below it. Without it, the bar keeps its own padding. docs is the documentation block, 1400 (--docs-width), with 24 of padding from 768 up. |
| `itemsJustify` | `"start" \| "end"` | "end" | Where the links sit: end (just before the actions, at the other end from the brand) or start (right after the brand, with the actions at the other end — the reference's home page). |
| `size` | `"md" \| "sm"` | "md" | The bar's height: md is 64 (the reference's bar guide), sm is 56 (the reference's home page), with 6 between the actions instead of 8. |
| `blurred` | `boolean` | false | Only on flush: a transparent background that blurs what scrolls under it, as the reference's home page. With reduced transparency asked by the system, or a browser without backdrop blur, the background is solid. |
| `menuActions` | `ReactNode` | — | What only the phone menu carries, under the links (the GitHub link, the account). Not shown in the wide bar. |
| `navLabel` | `string` | "Main" | The navigation's name for screen readers. Pass it in the page's language. |
| `menuLabel` | `string` | "Menu" | The phone menu button's name for screen readers. Pass it in the page's language. In an app with client-side routing the panel does not close by itself on a page change: give the Header a key that changes with the route. |
| `menuId` | `string` | "aurea-header-menu" | The id of the phone menu panel, which the button points at with popovertarget. Change it only when a page has two website headers: each one needs its own. |
| `tabs` | `HeaderTab[]` | — | A second row: the site's areas, each with an optional icon, like the area row of the reference documentation. The row is 40 tall, the areas sit at its bottom, 12 apart (4 on a phone), and it scrolls sideways when they do not fit. The current one gets aria-current="page" and a 2px bar in the accent color. It comes last in the Tab order, after the actions. With tabs the bar is exactly its height and the divider line hangs just below it. |
| `currentTab` | `string` | — | The id of the current area in the second row. |
| `tabsLabel` | `string` | "Sections" | The accessible name of the second row. |
