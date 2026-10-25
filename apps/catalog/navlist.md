# NavList

NavList is the list of tappable rows that open something: leading icon, label, an optional second line, an optional trailing value, and the chevron that says the row goes somewhere. It is the brick every settings screen is built from.

## Usage

```tsx
import {NavList} from "@aurea-uds/react";
```

```tsx
<Card>
  <NavList items={[
    {id: "profile", label: "Profile", description: "Name, photo, handle", icon: "user", href: "/profile"},
    {id: "alerts", label: "Notifications", description: "Push, email", icon: "bell", value: "On", href: "/alerts"},
    {id: "plan", label: "Plan", icon: "wallet", value: <Badge size="xs">Free</Badge>, href: "/plan"},
    {id: "sync", label: "Sync", icon: "cloud", value: <Status variant="success">Live</Status>, href: "/sync"},
  ]} />
</Card>
```

- It is a plain <ul> of links — NOT a landmark. Sidebar and BottomNav are app chrome and live in a <nav>; this is content inside the page, and a third <nav> on one screen only adds noise for anyone navigating by landmark.

- There is no current item, on purpose. aria-current would promise a current page in a list you enter and come back from — that is Sidebar's job, not this one.

- The trailing value takes any node, so Badge, Status or plain text compose in without this component knowing they exist. That is why there is no `badge` prop here.

- The text is the only track that shrinks. The value and the chevron never do: a clipped value lies ("R$ 1.2" for "R$ 1.234") and a clipped chevron stops saying the row opens.

- `href` decides the element AND the chevron. With it the row is a link and gets the arrow; without it the row is a button and has no arrow — because the arrow promises the row opens something, and signing out opens nothing.

- A disabled row stays FOCUSABLE and inert (aria-disabled), because :disabled drops a control out of the tab order and keyboard users never find out the row is there.

- On a coarse pointer the whole row grows to 44px — WCAG 2.5.5, and the size the iOS and Android guidelines both land on. The target is the row, never the chevron.

- The list paints no surface and draws no divider: Card already gives the grouped panel, and the row highlight here is the pill — a pill with a rule under it contradicts itself.

## Examples

### A list of conversations

AN-04: a photo at the start, in place of the icon, and small signs before the value — pinned, muted. Each sign has a name the screen reader reads; it is not drawn.

```tsx
<Card>
  <NavList items={[
    {id: "ana", label: "Ana", description: "See you tomorrow", avatar: {src: ana, fallback: "AN"},
      indicators: [{icon: "push-pin", label: "Pinned"}], value: <Badge size="xs">3</Badge>, href: "/chat/ana"},
    {id: "team", label: "Design team", description: "Bia: the new deck is up", avatar: {fallback: "DT"},
      indicators: [{icon: "bell-slash", label: "Muted"}], href: "/chat/team"},
  ]} />
</Card>
```

### Just label and chevron

The second line, the value and the icon are all optional. A row that only goes somewhere carries only the name and the arrow.

```tsx
<Card>
  <NavList items={[
    {id: "terms", label: "Terms of service", href: "/terms"},
    {id: "privacy", label: "Privacy", href: "/privacy"},
    {id: "about", label: "About", href: "/about"},
  ]} />
</Card>
```

### Rows that act, and rows that cannot

No href means the row is a <button> — and it carries NO chevron, because the arrow promises the row opens something and signing out opens nothing. A disabled row is a button too (a disabled link does not exist in HTML) and it stays focusable, so a keyboard user still hears that it is unavailable.

```tsx
<Card>
  <NavList items={[
    {id: "export", label: "Export data", description: "Sends a copy by email", icon: "download", onClick: startExport},
    {id: "beta", label: "Beta features", description: "Not on your plan", icon: "lightning", disabled: true},
    {id: "out", label: "Sign out", icon: "sign-out", onClick: signOut},
  ]} />
</Card>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `NavListItem[]` | — | The rows, as data — the house idiom, the same one Sidebar, BottomNav, Timeline and Breadcrumb use. Each item is {id, label, description?, value?, icon?, avatar?, indicators?, href?, onClick?, disabled?}. `description` is the second line and it is optional on purpose: a settings row often needs it ("Notifications" / "Push, email") and a plain destination row does not. `value` is the trailing accessory and takes any node, so Badge, Status or plain text compose in without this component knowing about them. `href` decides the element AND the chevron: with it the row is a link and gets the arrow, without it the row is a button and carries none — an arrow promises the row opens something. `disabled` forces the button form and marks it aria-disabled. An item may carry render (a ReactElement, your router's link) instead of href — it receives the item's skin, the current-page state and the item's content. `avatar` ({src?, fallback?}, the same shape as ChatMessage.avatar) puts a photo at the start of the row, in place of the icon. `indicators` ([{icon, label}]) are small muted signs before the value — pinned, muted — and each label is read by the screen reader, not drawn. |
| `className` | `string` | — | Merged onto the <ul>. The list paints no surface of its own — wrap it in Card when the design calls for a grouped panel. |
