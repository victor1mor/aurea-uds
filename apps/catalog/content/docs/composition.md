---
title: Composition
description: Build bigger pieces from parts, slots, item lists and the render prop.
icon: stack
---

Aurea components fit together in a few fixed ways. A component can have parts, take other elements in named slots, draw a list from data, or hand its look to an element you choose. This page shows each one.

## Parts

Some components come in parts that you arrange yourself. The parts hang from the main component, with a dot.

::: demo composition-card-parts

```tsx
<Card>
  <Card.Header>
    <Card.Title>Weekly report</Card.Title>
    <Card.Description>Sent every Monday at 9:00.</Card.Description>
  </Card.Header>
  <Card.Content>12 people receive it.</Card.Content>
  <Card.Footer>
    <Button variant="primary">Edit</Button>
    <Button>Pause</Button>
  </Card.Footer>
</Card>
```

| Component | Parts |
|---|---|
| `Card` | `Card.Media`, `Card.Header`, `Card.Title`, `Card.Description`, `Card.Content`, `Card.Footer` |
| `RadioGroup` | `RadioGroup.Item` |
| `Grid` | `Grid.Item`, which takes a `span` of 1 to 12 columns |

Each part is optional. Use the ones you need, in the order the design asks for. `Card.Title` is an `h3`.

## Slots

Many components take other elements through named props. The component places them and spaces them; you choose what goes in.

```tsx
<AppShell
  brand={<strong>Acme</strong>}
  navItems={[
    {id: "home", label: "Home", href: "/", icon: "house"},
    {id: "reports", label: "Reports", href: "/reports", icon: "chart-bar"},
  ]}
  currentNavId="reports"
  topbar={<SearchField aria-label="Search" placeholder="Search" />}
>
  <Reports />
</AppShell>
```

| Component | Slots |
|---|---|
| `AppShell` | `brand`, `navigation`, `topbar`, `aside`, `children` |
| `Header` | `brand`, `actions`, `menuActions`, `children` |
| `Button` | `leadingIcon`, `trailingIcon`, `kbd` |
| `Badge` | `leading`, `trailing` |
| `Popover` | `trigger` |
| `Tooltip` | its single child is the trigger |

## Lists from data

Navigation and lists take an `items` array and draw the markup themselves: `Sidebar`, `Header`, `Breadcrumb`, `Timeline`, `Accordion`, `TreeView` and others. You pass data, Aurea keeps the structure, the keyboard behavior and the current-item marker right.

```tsx
<Breadcrumb
  items={[
    {label: "Home", href: "/"},
    {label: "Reports", href: "/reports"},
    {label: "Weekly"},
  ]}
/>
```

## The render prop

A button that navigates should be your router's link, not a `button` with a click handler. The `render` prop does that. Pass an element, and Aurea draws its own look and content on it.

```tsx
import {RouterLink} from "./router";

<Button variant="primary" leadingIcon="chart-bar" render={<RouterLink to="/reports" />}>
  Reports
</Button>
```

The element receives the classes, the content (icons, text, shortcut) and the attributes of the button. The destination stays yours. When the button is disabled or loading, the click is blocked on your element too.

These accept `render`:

- `Button` and `IconButton`;
- `Card`, which needs it with `variant="interactive"`, so a whole card can be a link;
- navigation items: the items of `Sidebar`, `AppShell`, `Header` (and its `tabs`), `NavList` and `Breadcrumb`, and the action items of `DropdownMenu`;
- `Image`.

```tsx
<Card variant="interactive" render={<RouterLink to="/reports/weekly" />}>
  <Card.Title>Weekly report</Card.Title>
</Card>
```

Follow two rules so behavior and accessibility stay right:

- Render the element that matches the job: a link for navigation, a button for an action.
- Your element's own props win over Aurea's, and its `className` is added after Aurea's. Do not drop the props it receives.

For a plain link you do not need `render`. A `Button` with `href` already renders an `a`.

## Your own components

Wrap an Aurea component to fix the props your app repeats. Keep the rest open.

```tsx
import {Button, type ButtonProps} from "@aurea-uds/react";

export function SaveButton(props: Omit<ButtonProps, "variant">) {
  return <Button variant="primary" leadingIcon="floppy-disk" {...props} />;
}
```

Aurea itself grows the same way. A new need becomes a variation of an existing component, a new `variant` value or a new prop, before it becomes a new component. When you miss something, look for the variation first.

## Entry points

Everything is exported from `@aurea-uds/react`. The same components are also grouped by category, matching the catalog:

```tsx
import {Button, IconButton} from "@aurea-uds/react/actions";
import {Input, Select} from "@aurea-uds/react/inputs";
```

The categories are `actions`, `inputs`, `navigation`, `overlays`, `disclosure`, `feedback`, `data-display`, `identity`, `media`, `code`, `communication`, `layout`, `system` and `agents`. The package is tree-shaken either way. The categories help you read and adopt Aurea one area at a time.

Six heavier modules live only on their own entry point, so you install their engine only if you use them: `code-editor`, `data-grid`, `qrcode`, `calendar`, `chart` and `graph`.

## Next steps

- Change the look in [Styling](./docs-styling.html).
- Browse every component in [Components](./components.html).
- See full screens built from these pieces in [Patterns](./patterns.html).
