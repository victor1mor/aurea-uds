# BottomNav

BottomNav is the bar an application's top-level navigation lives in on a phone. It takes the SAME item type as Sidebar, on purpose: one list feeds the sidebar on a desktop and the bar on a phone, and two lists of one menu drift apart.

## Usage

```tsx
import {BottomNav} from "@aurea-uds/react";
```

```tsx
const items: SidebarItem[] = [
  {id: "garage", label: "Garage", icon: "car", href: "/"},
  {id: "fuel", label: "Fuel", icon: "gas-pump", href: "/fuel",
    badge: <Badge size="xs" variant="primary" emphasis="solid">3</Badge>},
  {id: "service", label: "Service", icon: "wrench", href: "/service"},
  {id: "me", label: "Profile", icon: "user", href: "/me"},
];

<BottomNav variant="edge" label="Garage" current={route} items={items} />
```

- TWO AXES, and they do not mix. `variant` says where the bar sits — `edge` against the screen, `floating` as a loose pill. `indicator` says what SHAPE marks the current item. The meaning never changes with the shape: current is always gold.

- Nine indicators: none, subtle, pill, circle, circle-raised, circle-bold, circle-outline, capsule, expand. Everything else is shared — touch target, icon frame, typography, badge anchoring, safe area. That is what makes them variants of one component instead of nine.

- The bar stands still when you pick another destination. No size depends on which item is current — not the item, not the label weight — so only the paint moves. The one item that grows is the current one in `expand`, and it grows into a FIXED slot: the buttons shift, the bar does not.

- Every item keeps its label, in every indicator but `expand`. Icon-only navigation only works when the symbols are unmistakable, and Garage/Fuel/Service are not. In `expand` the other items keep their name for the screen reader only.

- The container is a <nav> landmark and each item is a link — not a tab. A tab swaps a panel inside the page; a bottom bar changes page. Giving role="tablist" to a menu makes the screen reader promise arrow keys that lead nowhere.

- The counter hangs off the icon's top corner and is smaller than it — 16px on a 24px icon, the ratio measured in four apps that ship. With no number it is a plain dot: `badge: ""`.

- The current item is marked with aria-current="page" — the same attribute the screen reader announces and the skin paints, so they cannot drift apart.

- One list, two chromes: pass your Sidebar `items` straight in. A nested `items` is ignored here, because a bottom bar is flat.

- It reserves room for the iPhone home indicator with env(safe-area-inset-bottom). That needs viewport-fit=cover in YOUR meta viewport; without it the bar just gets its normal spacing.

- Positioning is sticky, not fixed: it stays inside its container, so it cannot cover a page it does not own, and it falls back to static when there is nothing to scroll.

- The four names of 17/08/2026 — flat, surface, pill, dock — still work and map onto the pair. They are deprecated, not removed.

## Examples

### Floating subtle — a soft container

The bar floats, and the current item gets a soft brand-tinted container around icon and label. The lightest of the filled indicators.

```tsx
<BottomNav indicator="subtle" label="Garage" current={route} items={items} />
```

### Floating pill — the same container, fully rounded

Identical to subtle except for the radius. Nothing else changes, which is the point of separating layout from indicator.

```tsx
<BottomNav indicator="pill" label="Garage" current={route} items={items} />
```

### Floating circle — the fill wraps only the icon

The label stays below the circle, outside it. This is what a messaging app does, and it is the shape that survives long names.

```tsx
<BottomNav indicator="circle" label="Garage" current={route} items={items} />
```

### Floating circle raised — depth instead of colour

The circle becomes a surface of its own, lifted off the bar. The only indicator that separates by elevation rather than by fill.

```tsx
<BottomNav indicator="circle-raised" label="Garage" current={route} items={items} />
```

### Floating circle bold — solid gold

The only indicator that fills with the brand colour, so it is the only one that flips the whole foreground — icon, label and counter inside the shape.

```tsx
<BottomNav indicator="circle-bold" label="Garage" current={route} items={items} />
```

### Floating circle subtle — a ring, no fill

A soft disc behind the icon frame (no line since 0.34.0). It marks position without adding mass, which is what a navigation bar wants.

```tsx
<BottomNav indicator="circle-outline" label="Garage" current={route} items={items} />
```

### Floating capsule — a wide pill behind the icon

A 56 × 32 gold capsule behind the icon only, the active indicator of the design reference. The label stays below it, so the shape never stretches with a long name.

```tsx
<BottomNav indicator="capsule" label="Garage" current={route} items={items} />
```

### Floating expand — only the current item says its name

The other items show the icon alone; the current one becomes a gold capsule with the name beside the icon. Its slot is fixed, so the bar never changes size.

```tsx
<BottomNav indicator="expand" label="Garage" current={route} items={items} />
```

### A dot, when there is no number

An empty badge is the plain dot that means "something new". It has no accessible name — there is nothing to read — so put the meaning in the label.

```tsx
<BottomNav
  variant="edge"
  label="Garage"
  current={route}
  items={[
    {id: "garage", label: "Garage", icon: "car", href: "/"},
    {id: "fuel", label: <>Fuel <span className="sr-only">(new)</span></>, icon: "gas-pump", href: "/fuel", badge: ""},
  ]}
/>
```

### Driven by a router

An item without href is a <button>. Same skin, same aria-current — what changes is who performs the navigation. Three to five destinations is the range this component is for; with two, a segmented control usually says it better.

```tsx
<BottomNav
  label="Garage router"
  current={route}
  items={[
    {id: "garage", label: "Garage", icon: "car", onClick: () => go("/")},
    {id: "fuel", label: "Fuel", icon: "gas-pump", onClick: () => go("/fuel")},
    {id: "service", label: "Service", icon: "wrench", onClick: () => go("/service")},
  ]}
/>
```

### Content width — the pill as wide as its items

width="content" sizes the floating pill to its items and centres it, instead of spanning the screen. It only applies while the bar floats; the edge bar stays as wide as the screen.

```tsx
<BottomNav width="content" indicator="capsule" label="Garage content" current={route} items={items} />
```

### The four older names

flat, surface, pill and dock still work and map onto the pair: flat is edge with no indicator, surface and dock are floating with the circle, pill is floating with the pill. They are deprecated — write variant and indicator instead.

```tsx
<BottomNav variant="flat" label="Garage flat" current={route} items={items} />
<BottomNav variant="surface" label="Garage surface" current={route} items={items} />
<BottomNav variant="pill" label="Garage pill" current={route} items={items} />
<BottomNav variant="dock" label="Garage dock" current={route} items={items} />
```

### The colour of the current item

currentStyle (ADR-0084) — indicator picks the shape, currentStyle the colour; here on the capsule. current (the default), neutral, contrast, brand, ring, plain; with yellow and white: brand-white (it fails WCAG — white on the yellow measures 1.91:1), white-ring and brand-gradient; and the whole bar in yellow: bar-ink, bar-ring, bar-plain and bar-light. Floating and edge bars alike.

```tsx
<BottomNav indicator="capsule" currentStyle="current" label="Garage" current={route} items={items} />
<BottomNav indicator="capsule" currentStyle="neutral" label="Garage" current={route} items={items} />
<BottomNav indicator="capsule" currentStyle="contrast" label="Garage" current={route} items={items} />
<BottomNav indicator="capsule" currentStyle="brand" label="Garage" current={route} items={items} />
<BottomNav indicator="capsule" currentStyle="ring" label="Garage" current={route} items={items} />
<BottomNav indicator="capsule" currentStyle="plain" label="Garage" current={route} items={items} />
<BottomNav indicator="capsule" currentStyle="brand-white" label="Garage" current={route} items={items} />
<BottomNav indicator="capsule" currentStyle="white-ring" label="Garage" current={route} items={items} />
<BottomNav indicator="capsule" currentStyle="brand-gradient" label="Garage" current={route} items={items} />
<BottomNav indicator="capsule" currentStyle="bar-ink" label="Garage" current={route} items={items} />
<BottomNav indicator="capsule" currentStyle="bar-ring" label="Garage" current={route} items={items} />
<BottomNav indicator="capsule" currentStyle="bar-plain" label="Garage" current={route} items={items} />
<BottomNav indicator="capsule" currentStyle="bar-light" label="Garage" current={route} items={items} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `SidebarItem[]` | — | The navigation, as data — the SAME type Sidebar takes, on purpose: one list feeds the sidebar on desktop and the bar on the phone, and two lists of one menu drift apart. Each item is {id, label, href?, icon?, badge?, onClick?}. A nested `items` is ignored here: a bottom bar is flat. `badge` hangs off the icon's top corner and is sized against it (16px on a 24px icon, the ratio measured in shipping apps); pass an EMPTY badge (`badge: ""`) to get the plain dot that means "something new". An item may carry render (a ReactElement, your router's link) instead of href — it receives the item's skin, the current-page state and the item's content. |
| `current` | `string` | — | The id of the item you are on. It gets aria-current="page", which is also what the skin paints — one source for both, so they cannot drift apart. |
| `variant` | `"floating" \| "edge"` | "floating" | Where the BAR sits: floating as a loose pill, or edge against the screen with a hairline above it. It says nothing about how the current item is marked — that is `indicator`, and keeping the two apart is the point. The older names (flat, surface, pill, dock) are still accepted and map onto the pair; they are deprecated, not removed. |
| `indicator` | `"none" \| "subtle" \| "pill" \| "circle" \| "circle-raised" \| "circle-bold" \| "circle-outline" \| "capsule" \| "expand"` | "none" | The SHAPE that marks the current item. The meaning never changes with the shape: current is always the brand gold. `none` marks by colour alone; `subtle` and `pill` wrap icon and label in a tinted container and differ only in radius; `circle`, `circle-raised` and `circle-outline` wrap only the icon, by fill, by elevation or by a ring; `circle-bold` is a solid disc around icon and label, the only one that flips the whole foreground; `capsule` is a 56 × 28 capsule behind the icon (the active indicator of the design reference, kept at the bar's height), behind the icon; `expand` draws only icons and grows the current item into a gold capsule with its label — the others keep theirs for the screen reader. Every other indicator keeps every label visible. No measure depends on which item is current, so the bar never moves (ADR-0055). |
| `width` | `"full" \| "content"` | "full" | How wide the floating pill is. `full` spans the screen minus the margin, as it always has; `content` sizes the pill to its items and centres it. Items then measure their own content instead of sharing the width equally, with the item's own touch target (--control-h-lg) as the minimum. Ignored on `edge`, which sits against the screen edge and stays full width. |
| `label` | `string` | "Main" | Accessible name of the <nav>. Two navigation landmarks with the same name fail axe, and a page with a bottom bar usually has a Topbar or Sidebar too — name it. |
| `currentStyle` | `"current" \| "neutral" \| "contrast" \| "brand" \| "ring" \| "plain" \| "brand-white" \| "white-ring" \| "brand-gradient" \| "bar-ink" \| "bar-ring" \| "bar-plain" \| "bar-light"` | "current" | The COLOUR of the current item (ADR-0084) — indicator picks the shape, currentStyle the colour. current (the default), neutral (grey), contrast (graphite), brand (solid yellow), ring (a yellow ring, no fill), plain (only the filled icon and a semibold label); brand-white (yellow with white — it FAILS WCAG: white on the yellow measures 1.91:1, chosen knowing it), white-ring (white with a yellow ring, ink inside) and brand-gradient (a yellow gradient — the one gradient in a navigation component; on React Native without gradients, solid yellow); and the whole bar in yellow, with every icon and label in ink: bar-ink, bar-ring, bar-plain and bar-light. The colour goes where the shape paints: the item in pill, subtle and expand; the icon frame in circle, circle-outline, circle-raised and capsule; the disc in circle-bold. The none indicator has no fill and does not change. Floating and edge bars alike. Written as data-current-style; the same attribute on a container sets it for every bar inside. Web and React Native. |
