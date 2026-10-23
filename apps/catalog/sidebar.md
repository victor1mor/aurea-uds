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

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `SidebarItem[]` | — | The navigation, as data. One shape covers grouping and nesting: an item with `items` and no href is a group heading; with an href it is a parent that also has a sublist. Each item is {id, label, href?, icon?, badge?, onClick?, items?}. An item may carry render (a ReactElement, your router's link) instead of href — it receives the item's skin, the current-page state and the item's content. |
| `variant` | `"floating" \| "flush" \| "plain"` | floating | floating is the default and it is what this design system looks like: the panel detaches from the edges, takes the card radius and a border all the way around. flush is the ONE exception this system makes to that rule, and it is opt-in: the sidebar sits against the edges, takes the full height and is separated from the content by a single rule instead of a gap. That is what four shipping admin panels do — the reference library's own dashboard among the ones measured. Aurea's own pages stay floating; flush is there for the applications that want it. plain is the sidebar with NO box — no fill, no line, no shadow — in the floating one's place and height: the items sit loose on the page, like a documentation page's "On this page" column. The 1px border stays, transparent, so switching variants moves nothing. |
| `current` | `string` | — | The id of the item you are on. It gets aria-current="page", which is also what the skin paints — one source for both, so they cannot drift apart. |
| `collapsed` | `boolean` | false | Icon rail. Labels stay in the DOM as screen-reader-only text, and the panel narrows to --sidebar-rail. In AppShell, a floating rail keeps its outer margins in the grid track; flush uses the token as the raw track width. Controlled by you: the sidebar never decides on its own when to collapse. |
| `label` | `string` | "Sidebar" | Accessible name of the <nav> that `items` renders. Two navigation landmarks with the same name fail axe, so name it when a page has more than one. |
| `children` | `ReactNode` | — | Escape hatch, not legacy: when the list comes from a router or a CMS, pass your own markup and the <nav> and its label are yours. Rendered after `items` when both are given. |
| `header` | `ReactNode` | — | The fixed top of the sidebar: the app brand (Sidebar.Brand), a search. It does not scroll with the list. With header or footer, only the middle (the list and children) scrolls. |
| `footer` | `ReactNode` | — | The fixed bottom of the sidebar: the person and the sign-out (Sidebar.User), a short list (Sidebar.Nav), a highlight card. It does not scroll with the list. |
| `Sidebar.Brand` | `component` | — | The app brand at the top: logo, name and description. variant="tile" (default) puts the logo in a 36 square in the primary colour; plain is the bare logo and a title-size name. Collapsed, only the logo shows; the name stays for screen readers. |
| `Sidebar.User` | `component` | — | The person at the bottom, in a box of the text colour at 6%: avatar, name, description and an action (sign out). Collapsed, the avatar and the action stack in the centre of the rail, without the box; the name stays for screen readers. |
| `Sidebar.Nav` | `component` | — | A second list with the sidebar skin (Support, Settings). label is required: two navigation landmarks with the same name fail axe. It follows the sidebar's collapsed state and current item. |
| `Sidebar.Show` | `component` | — | Content shown only while the sidebar is expanded (when="expanded": the search field, a highlight card) or only while it is collapsed (when="collapsed": the search button). |
| `placement` | `left \| right` | left | Which side the sidebar lives on. On the right, the flush variant's line moves to the inner side. It is the AppShell's aside column. |
| `scrollbar` | `hover \| visible` | hover | hover is a light scrollbar that is invisible at rest and comes back with the pointer over the sidebar, with keyboard focus inside it, and always on a screen without hover (touch). It stays native and keeps its width, so nothing jumps when it shows. visible keeps the bar on screen all the time, for whoever needs it. |
