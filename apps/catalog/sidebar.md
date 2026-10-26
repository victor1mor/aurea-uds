# Sidebar

Sidebar is the <aside> the AppShell composes, and the navigation inside it. Pass `items` and it renders the list — icons, groups, one level of nesting, and the current item marked with aria-current. Pass children instead and the markup is entirely yours.

## Usage

```tsx
import {Sidebar} from "@aurea-uds/react";
```

```tsx
<Sidebar
  label="Components"
  current="button"
  items={[
    {id: "button", label: "Button", icon: "plus", href: "../button.html", badge: <Badge variant="primary">12</Badge>},
    {id: "navlist", label: "NavList", icon: "list-bullets", href: "../navlist.html"},
    {id: "sidebar", label: "Sidebar", icon: "sidebar-simple", href: "../sidebar.html"},
  ]}
/>
```

- One item shape covers both: an item with `items` and no `href` is a group heading; with an href it is a parent with a sublist.

- The current item is marked with aria-current="page" — the same attribute the screen reader announces and the skin paints, so they cannot drift apart.

- Collapsed turns it into an icon rail. The labels stay in the DOM as screen-reader-only text. The panel narrows to --sidebar-rail; a floating shell track also preserves its two outer margins.

- It FLOATS by default — margin, card radius, its own surface. That is what this design system looks like everywhere. `variant="flush"` is the one exception it makes to that rule, and it is opt-in: against the edges, full height, separated from the content by a single rule. It was measured against four shipping admin dashboards. Aurea's own pages stay floating; flush is for the applications that want it.

- AppShell forwards it: `<AppShell sidebarVariant="flush">`. Without that the variant would be unreachable for anyone composing through the shell, which is the normal path.

- A fixed top and bottom: `header` (the app brand, a search) and `footer` (the person and the sign-out, a short list) stay put, and only the list in the middle scrolls. Four parts fill them — `Sidebar.Brand`, `Sidebar.User`, `Sidebar.Nav` and `Sidebar.Show` — and each one knows when the sidebar is collapsed.

- Below the lg breakpoint (1024px) the AppShell turns it into a drawer with the native popover — Escape and click-outside stay native, and the shell normalises focus across the three browser engines.

- No roving tabindex: site navigation has no APG pattern, and in a sidebar people expect Tab to walk the items one by one.

- Three ways to collapse (collapsible): the icon rail, the rail as a capsule, and off the screen. Outside the AppShell, Sidebar.Provider keeps the state, Sidebar.Toggle collapses it from anywhere, useSidebar reads it, and Ctrl+B (Cmd+B on a Mac) toggles it — except while you type in a field.

- Groups that fold (collapsible), an action beside a group or an item (action), a gap between sections ("separator"), a photo in place of the icon (avatar), sections with a panel (panel) and five ways to draw the current item (indicator).

## Examples

### Groups and one level of nesting

A group has a label and no link of its own. A parent that navigates keeps its link and gains a sublist.

```tsx
<Sidebar
  label="Catalog"
  current="sidebar"
  items={[
    {id: "components", label: "Components", items: [
      {id: "button", label: "Button", icon: "plus", href: "../button.html"},
      {id: "navigation", label: "Navigation", icon: "list-bullets", href: "../navlist.html", items: [
        {id: "navlist", label: "NavList", href: "../navlist.html"},
        {id: "sidebar", label: "Sidebar", href: "../sidebar.html"},
      ]},
    ]},
    {id: "shells", label: "Shells", items: [
      {id: "appshell", label: "AppShell", href: "../appshell.html"},
    ]},
  ]}
/>
```

### Slim · floating — the icon rail

Same list, same DOM. The labels become screen-reader-only, so the rail never turns into a column of unnamed icons.

```tsx
<Sidebar collapsed label="Components" current="button" items={items} />
```

### Full · flush — the one exception

The variant that gives up the floating box: it sits against the edges, takes the full height and is separated from the content by a single rule instead of a gap. The rows inside keep the same radius in both variants — what changes is the panel, not the line.

```tsx
<Sidebar variant="flush" label="Components" current="button" items={items} />
```

### Slim · flush — the rail against the edge

The fourth combination: collapsed AND flush. The reference does the opposite of this one — their narrow column floats as a card while the wide one sits flush, measured on their own docs: 68px floating against 280px flush. Both pairings exist because the two props are separate axes.

```tsx
<Sidebar collapsed variant="flush" label="Components" current="button" items={items} />
```

### A fixed top and bottom

The brand at the top and the person at the bottom stay put; only the list scrolls. Sidebar.Brand puts the logo in a square of the primary colour; Sidebar.User puts the person in a box, with the action beside the name.

```tsx
<Sidebar
  variant="flush"
  label="Components"
  current="button"
  items={items}
  header={<Sidebar.Brand logo="A" name="Acme Plans" description="Workspace" />}
  footer={
    <Sidebar.User
      avatar={<Avatar fallback="KM" alt="" />}
      name="Kate Moore"
      description="Admin"
      action={<IconButton icon="sign-out" label="Log out" size="sm" />}
    />
  }
/>
```

### A fixed top and bottom, collapsed

Collapsed, the brand keeps only its logo, the search turns into a button (Sidebar.Show), and the person becomes the avatar with the action under it. The names stay for screen readers.

```tsx
<Sidebar collapsed variant="flush" label="Components" current="button" items={items}
  header={<>
    <Sidebar.Brand logo="A" name="Acme Plans" description="Workspace" />
    <Sidebar.Show when="expanded"><SearchField placeholder="Search" aria-label="Search" /></Sidebar.Show>
    <Sidebar.Show when="collapsed"><IconButton icon="magnifying-glass" label="Search" /></Sidebar.Show>
  </>}
  footer={<Sidebar.User avatar={<Avatar fallback="KM" alt="" />} name="Kate Moore" description="Admin"
    action={<IconButton icon="sign-out" label="Log out" size="sm" />} />}
/>
```

### Bring your own navigation

children still works and is not legacy: when the list comes from a router or a CMS, the <nav> and its label are yours.

```tsx
<Sidebar>
  <nav aria-label="Project">
    <a href="../button.html" aria-current="page">Button</a>
    <a href="../sidebar.html">Sidebar</a>
  </nav>
</Sidebar>
```

### Plain — no box

No background, no line, no shadow: the items sit loose on the page, in the floating sidebar's place and height. It is the "On this page" column of a documentation site.

```tsx
<Sidebar variant="plain" label="Components" current="button" items={items} />
```

### On the right

placement="right" puts the sidebar on the other side of the screen, with the content before it. It is the AppShell's aside column.

```tsx
<Sidebar placement="right" label="Components" current="button" items={items} />
```

### Scrollbar always on

By default the scrollbar is light and hidden at rest, and comes back with the pointer, with focus inside, and always on a touch screen. scrollbar="visible" keeps it on screen all the time.

```tsx
<Sidebar scrollbar="visible" label="Components" current="button" items={items} />
```

### The current item, five ways

indicator sets how the item you are on is drawn. brand is the default. segment is the capsule of the selected tab, with the text colour and no line; segment-dot and segment-line add a yellow dot or the yellow line; subtle is the grey alone.

```tsx
<Sidebar indicator="brand" label="Brand" current="button" items={items} />
<Sidebar indicator="segment" label="Segment" current="button" items={items} />
<Sidebar indicator="segment-dot" label="Segment with a dot" current="button" items={items} />
<Sidebar indicator="segment-line" label="Segment with a line" current="button" items={items} />
<Sidebar indicator="subtle" label="Subtle" current="button" items={items} />
```

### Collapsed into a capsule

collapsible="capsule": the rail of icons keeps the control radius instead of the card radius. In the AppShell it is sidebarCollapsible="capsule".

```tsx
<Sidebar collapsed collapsible="capsule" label="Components" current="button" items={items} />
```

### Off the screen, with its own state

Outside the AppShell, Sidebar.Provider keeps the state, and Sidebar.Toggle collapses it from anywhere: here beside the title, and as a row at the bottom of the sidebar. collapsible="offcanvas" takes the sidebar off the screen. Ctrl+B (Cmd+B on a Mac) toggles it too, except while you type in a field.

```tsx
<Sidebar.Provider collapsible="offcanvas">
  <Sidebar label="Components" current="button" items={items}
    footer={<Sidebar.Toggle variant="item" />} />
  <main>
    <Sidebar.Toggle />
  </main>
</Sidebar.Provider>
```

### Sections with a panel beside the rail

panel="docked": the first level of items becomes sections, shown as a rail of icons, and the list of the chosen section sits in a panel beside it. Collapsed, only the rail stays.

```tsx
<Sidebar panel="docked" label="Sections" current="orders" items={[
  {id: "home", label: "Home", icon: "house", items: [
    {id: "overview", label: "Overview", icon: "squares-four", href: "/"},
    {id: "orders", label: "Orders", icon: "receipt", href: "/orders"},
  ]},
  {id: "dashboard", label: "Dashboard", icon: "chart-bar", items: [
    {id: "analytics", label: "Analytics", icon: "chart-line", href: "/analytics"},
  ]},
]} />
```

### Sections in a panel over the page

panel="overlay": the rail stays narrow, and the list of a section opens over the page, next to its icon. Focus moves into the list, and Escape or a click outside closes it.

```tsx
<Sidebar panel="overlay" label="Sections" current="orders" items={sections} />
```

### Groups that fold, with actions

A group with collapsible folds its list: the name becomes a button with aria-expanded. action puts a small button beside the group ("+") or beside an item ("⋯") — next to the link, never inside it.

```tsx
<Sidebar label="Files" current="store" items={[
  {id: "file", label: "File", collapsible: true,
    action: <IconButton icon="plus" label="Add to File" size="xs" />, items: [
    {id: "store", label: "Store", icon: "storefront", href: "/store",
      action: <IconButton icon="dots-three" label="Store options" size="xs" />},
    {id: "company", label: "Company", icon: "buildings", href: "/company"},
  ]},
  {id: "archive", label: "Archive", collapsible: true, defaultOpen: false, items: [
    {id: "old", label: "Old projects", icon: "archive", href: "/old"},
  ]},
]} />
```

### Separators and avatars

The string "separator" between items splits the list with a gap — no line. avatar puts a photo or a team logo in place of the icon, and it stays on the rail when the sidebar collapses.

```tsx
<Sidebar label="Teams" current="catalog" items={[
  {id: "home", label: "Home", icon: "house", href: "/"},
  "separator",
  {id: "catalog", label: "Catalog", avatar: {fallback: "CA"}, href: "/catalog", badge: <Kbd>⌘1</Kbd>},
  {id: "warpspeed", label: "Warpspeed", avatar: {fallback: "WA"}, href: "/warpspeed", badge: <Kbd>⌘2</Kbd>},
]} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `SidebarEntry[]` | — | The navigation, as data. One shape covers grouping and nesting: an item with `items` and no href is a group heading; with an href it is a parent that also has a sublist. Each item is {id, label, href?, icon?, badge?, onClick?, items?}. An item may carry render (a ReactElement, your router's link) instead of href — it receives the item's skin, the current-page state and the item's content. An item also takes avatar ({src?, fallback?}, a photo or a team logo in place of the icon — it stays on the rail), action (a small IconButton such as "⋯" or "+", rendered NEXT TO the link, never inside it; hidden on the rail, as in the reference) and, on a group heading, collapsible and defaultOpen (the heading becomes a disclosure button with aria-expanded). The string "separator" between items splits the list in two with a gap — no line (ADR-0072). On the rail, sublists are hidden, as the reference does: a sub-item without an icon used to become an empty button there. |
| `variant` | `"floating" \| "flush" \| "plain"` | floating | floating is the default and it is what this design system looks like: the panel detaches from the edges, takes the card radius and a border all the way around. flush is the ONE exception this system makes to that rule, and it is opt-in: the sidebar sits against the edges, takes the full height and is separated from the content by a single rule instead of a gap. That is what four shipping admin panels do — the reference library's own dashboard among the ones measured. Aurea's own pages stay floating; flush is there for the applications that want it. plain is the sidebar with NO box — no fill, no line, no shadow — in the floating one's place and height: the items sit loose on the page, like a documentation page's "On this page" column. The 1px border stays, transparent, so switching variants moves nothing. |
| `current` | `string` | — | The id of the item you are on. It gets aria-current="page", which is also what the skin paints — one source for both, so they cannot drift apart. |
| `collapsed` | `boolean` | false | Icon rail. Labels stay in the DOM as screen-reader-only text, and the panel narrows to --sidebar-rail. In AppShell, a floating rail keeps its outer margins in the grid track; flush uses the token as the raw track width. Controlled by you: the sidebar never decides on its own when to collapse. |
| `collapsible` | `"icon" \| "capsule" \| "offcanvas"` | icon | How the sidebar looks when collapsed. icon is the rail of icons (the default, as before). capsule is the same rail with the control radius (a capsule) instead of the card radius. offcanvas takes the sidebar off the screen on the desktop — the name the reference uses. Inside Sidebar.Provider it comes from the provider. |
| `indicator` | `"brand" \| "segment" \| "segment-dot" \| "segment-line" \| "subtle"` | brand | How the current item is drawn. brand is today's: in the light theme, the primary button; in the dark one, the grey capsule with the yellow text and the line. segment is the capsule of the selected tab (--segment + --shadow-sm), the text in the text colour and regular weight, with no line — the current item of the reference's documentation. segment-dot adds a yellow dot before the name; segment-line adds the yellow line underneath. subtle is the grey alone (the same grey as hover: only the text weight and the filled icon set the current item apart). |
| `panel` | `"docked" \| "overlay"` | — | Sections with a panel. The first level of items becomes sections: the rail shows one icon per section, and the list of the chosen section lives in a panel. docked puts the panel beside the rail (collapsing hides only the panel); overlay opens it over the page, next to the icon, in a popover that takes focus and closes with Escape or a click outside. The section that contains the current page gets aria-current="true". |
| `label` | `string` | "Sidebar" | Accessible name of the <nav> that `items` renders. Two navigation landmarks with the same name fail axe, so name it when a page has more than one. |
| `children` | `ReactNode` | — | Escape hatch, not legacy: when the list comes from a router or a CMS, pass your own markup and the <nav> and its label are yours. Rendered after `items` when both are given. |
| `header` | `ReactNode` | — | The fixed top of the sidebar: the app brand (Sidebar.Brand), a search. It does not scroll with the list. With header or footer, only the middle (the list and children) scrolls. |
| `footer` | `ReactNode` | — | The fixed bottom of the sidebar: the person and the sign-out (Sidebar.User), a short list (Sidebar.Nav), a highlight card. It does not scroll with the list. |
| `Sidebar.Brand` | `component` | — | The app brand at the top: logo, name and description. variant="tile" (default) puts the logo in a 36 square in the primary colour; plain is the bare logo and a title-size name. Collapsed, only the logo shows; the name stays for screen readers. |
| `Sidebar.User` | `component` | — | The person at the bottom, in a box of the text colour at 6%: avatar, name, description and an action (sign out). Collapsed, the avatar and the action stack in the centre of the rail, without the box; the name stays for screen readers. |
| `Sidebar.Nav` | `component` | — | A second list with the sidebar skin (Support, Settings). label is required: two navigation landmarks with the same name fail axe. It follows the sidebar's collapsed state and current item. |
| `Sidebar.Show` | `component` | — | Content shown only while the sidebar is expanded (when="expanded": the search field, a highlight card) or only while it is collapsed (when="collapsed": the search button). |
| `Sidebar.Provider` | `component` | — | The sidebar state outside AppShell (collapsed or not, controlled with collapsed and onCollapsedChange, or not with defaultCollapsed), the collapse style (collapsible) and the Ctrl+B shortcut (Cmd+B on a Mac; shortcut, on by default, as in the reference). The shortcut does not act while the person is typing in a field — the one divergence from the reference, which steals the bold of an editor. Every Sidebar inside follows it, and Sidebar.Toggle and useSidebar read it. AppShell uses the same provider inside, when sidebarCollapsible is set. |
| `Sidebar.Toggle` | `component` | — | The collapse button, anywhere under a provider: next to the page title, inside the sidebar next to the brand, or as a row at the bottom (variant="item", "Collapse sidebar"). It carries aria-expanded and aria-controls pointing to the sidebar. Outside a provider it renders nothing. |
| `placement` | `left \| right` | left | Which side the sidebar lives on. On the right, the flush variant's line moves to the inner side. It is the AppShell's aside column. |
| `scrollbar` | `hover \| visible` | hover | hover is a light scrollbar that is invisible at rest and comes back with the pointer over the sidebar, with keyboard focus inside it, and always on a screen without hover (touch). It stays native and keeps its width, so nothing jumps when it shows. visible keeps the bar on screen all the time, for whoever needs it. |
