# Button

Buttons trigger an action or navigate. Keep one primary button per view so the main action is unmistakable; everything else recedes to secondary, outline, ghost or link.

## Usage

```tsx
import {Button} from "@aurea-uds/react";
```

```tsx
<Button variant="primary">Publish</Button>
<Button variant="secondary">Edit</Button>
<Button variant="tertiary">Cancel</Button>
<Button variant="outline">Preview</Button>
<Button variant="ghost">Skip</Button>
<Button variant="danger">Delete</Button>
```

- Variants over two axes — appearance (solid, outline, ghost, link) and tone (neutral, brand, destructive) — plus secondary, the neutral fill with the brand-coloured label.

- Five sizes (xs / sm / md / lg / xl) from density tokens; the pill shape is invariant.

- type="button" by default: a Cancel button inside a <form> never fires submit by accident.

- Loading shows a spinner and sets aria-busy; the label stays for context.

- With href it renders an anchor — same skin, link semantics. Disabled becomes aria-disabled.

- share opens the device's share sheet when the browser has one; otherwise it copies the link and says "Link copied" under the button, at the button's own size, and to the screen reader.

- Stretch with fullWidth, announce a shortcut with kbd. For a button that STAYS on, the component is Toggle — `pressed` here is deprecated since 0.4.0 and goes away in 1.0.

## Examples

### Sizes

Five heights from density tokens. On a coarse pointer every size floors at 44px, so xs never becomes an impossible target.

```tsx
<Button size="xs">Extra small</Button>
<Button size="sm">Small</Button>
<Button>Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra large</Button>
```

### Destructive hierarchy

Deleting is not always the loudest action on the screen. Same tone, three weights.

```tsx
<Button variant="danger">Delete</Button>
<Button variant="danger-outline">Delete</Button>
<Button variant="danger-ghost">Delete</Button>
```

### Soft

The pale fill of the tone with the tone's letter — the reference's soft button. danger-soft is the shortcut for the destructive one that should not shout.

```tsx
<Button appearance="soft" tone="brand">Upgrade</Button>
<Button appearance="soft" tone="success">Approve</Button>
<Button variant="danger-soft">Remove</Button>
```

### Quiet

The muted letter, one step smaller: a secondary control that sits beside the main ones without competing, like the Theme button at the top of this site.

```tsx
<Button size="sm" quiet leadingIcon="paint-bucket">Theme</Button>
```

### Link appearance

Text with no capsule, for inline actions. The underline is there at rest — revealing it on hover would hide the affordance.

```tsx
<Button variant="link">Learn more</Button>
<Button variant="link-primary">Upgrade plan</Button>
<Button variant="link-danger">Delete account</Button>
```

### Loading

Busy and blocked, with the label kept: aria-busy is set and the spinner replaces nothing.

```tsx
<Button variant="primary" loading>Publishing…</Button>
```

### Disabled

Unavailable, not hidden — the reason has to be reachable somewhere on the screen.

```tsx
<Button variant="primary" disabled>Publish</Button>
<Button disabled>Save draft</Button>
<Button variant="outline" disabled>Preview</Button>
```

### With icons

Glyphs on either side. The icon never replaces the label — it repeats it.

```tsx
<Button leadingIcon="plus">New item</Button>
<Button variant="outline" trailingIcon="caret-down">Sort by</Button>
<Button variant="danger" leadingIcon="trash">Delete</Button>
```

### With shortcut

The key that fires it, shown and announced: kbd renders a Kbd inside the button and sets aria-keyshortcuts. Pass a list for a combination: one cap per key, and the reader hears Control+K.

```tsx
<Button variant="primary" kbd="⌘K">Command</Button>
<Button variant="outline" kbd="/">Search</Button>
<Button leadingIcon="magnifying-glass" kbd={["Ctrl", "K"]}>Search</Button>
```

### As a link

With href it renders an anchor wearing the same skin: a button that navigates is a link, and the reader announces it as one.

```tsx
<Button variant="outline" href="/docs" trailingIcon="arrow-right">Read the docs</Button>
```

### Share

share asks the browser whether it can share this link — feature detection, not device guessing. On a phone (and in Chrome, Edge or Safari on a computer) the device's share sheet opens, and closing it is not an error. Where the browser cannot share, the link is copied and "Link copied" appears under the button, at the button's own size. If copying fails, the link is shown selected for Ctrl+C.

```tsx
<Button share={{url: "https://example.com/report", title: "Weekly report"}} leadingIcon="share-network">Share</Button>
<IconButton icon="share-network" label="Share link" variant="secondary" share={{url: "https://example.com/report"}} />
```

### Full width

Stretched to the container for a form footer or a narrow screen — only the width changes.

```tsx
<Button variant="primary" fullWidth>Continue</Button>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `primary \| secondary \| tertiary \| outline \| ghost \| primary-outline \| primary-ghost \| danger \| danger-outline \| danger-ghost \| link \| link-primary \| link-danger \| nav \| danger-soft` | tertiary | A shortcut for the (appearance, tone) pair; the two-axis API is appearance + tone. `secondary` is the neutral fill with the brand-coloured label; `tertiary` the neutral fill with the plain label (the default). |
| `appearance` | `solid \| outline \| ghost \| link \| nav \| soft` | solid | How much weight the box carries. nav is an appearance of its own (a navigation item), not a tone. soft is the tone's light background with the tone's text (the reference's danger-soft). |
| `tone` | `neutral \| brand \| danger \| success \| warning \| info` | neutral | What the colour means. Every tone works with every appearance, filled included — each has its own colour and text pair per theme. |
| `size` | `xs \| sm \| md \| lg \| xl` | md | Height comes from the density tokens; the pill radius never changes. |
| `href` | `string` | — | Renders an <a> with the same skin. A button that navigates is a link. |
| `loading` | `boolean` | false | Shows the spinner, sets aria-busy and blocks interaction. The label stays. |
| `disabled` | `boolean` | false | Native disabled: the control leaves the tab order entirely. With href it becomes aria-disabled, since a link has no disabled state. USE IT WHEN THERE IS NOTHING TO EXPLAIN — measured on 2026-08-13, a disabled button cannot be focused, so a Tooltip hung on it is never read by anyone navigating with a keyboard, and wrapping it in a span (what other libraries document) fixes the pointer and not the keyboard, because the span comes in at tabIndex -1. |
| `aria-disabled` | `boolean` | — | Inert but REACHABLE: the control keeps its place in the tab order and announces itself as disabled, and this component blocks activation — the attribute is semantics only, so leaving it to the browser would announce "disabled" on a button that still acts. Use it when there IS a why to tell, and put the why in a Tooltip, which now reaches. There is no permission component in Aurea and there will not be one: hiding an action is {can ? … : …} in your own code, and hiding a button is not security — see ADR-0023. |
| `leadingIcon` | `AureaIcon` | — | Glyph before the label — a name from the allowlist, or the app’s own drawing (a component that returns its <svg>), as Icon and IconButton take. |
| `trailingIcon` | `AureaIcon` | — | Glyph after the label — a name, or the app’s own drawing, as leadingIcon. |
| `type` | `button \| submit \| reset` | button | Deliberately not submit: a Cancel inside a form must not fire the main action. |
| `fullWidth` | `boolean` | false | Stretches to the container. Only the width changes — the pill radius is invariant. |
| `quiet` | `boolean` | false | Less weight: muted text one step smaller (12 on sm) — a site header's tool button, as the reference's "Theme". The box and the background stay the appearance's. |
| `pressed` | `boolean` | — | DEPRECATED, removed in 1.0 — use <Toggle>. It only paints and announces (aria-pressed) and YOU keep the state; Toggle owns the state, returns onPressedChange and demands an accessible name when it is icon-only. On, it shows the raised capsule with a yellow underline. |
| `kbd` | `string \| string[]` | — | Shortcut shown as a Kbd inside the button and announced with aria-keyshortcuts. A list (["Ctrl", "K"]) shows one key cap per key and announces the combination (Control+K). |
| `grow` | `boolean` | false | In a row (Cluster), takes an equal share with the other buttons that also grow. `fullWidth` asks for the whole line instead. |
| `target` | `HTMLAttributeAnchorTarget` | — | Link attribute, only with `href`. |
| `rel` | `string` | — | Link attribute, only with `href`. |
| `download` | `boolean \| string` | — | Link attribute, only with `href`. |
| `render` | `ReactElement` | — | The element drawn instead of the <button>/<a> — your router's link, e.g. render={<Link href="/reports" />}. It receives the button's skin, content (icons, label, shortcut) and attributes; the destination is its own. Disabled or loading, its click is blocked too, like the disabled link. |
| `share` | `{ url?: string; title?: string; text?: string }` | — | The button shares. It asks the browser whether it can share this link (navigator.canShare) — detecting the capability, not guessing the device. If it can (phones; Chrome, Edge and Safari on desktop), the device's share sheet opens, and cancelling is not an error. If it cannot, it copies the link and shows "Link copied" anchored to the button, at the button's size. If the copy fails, it says so and shows the link selected. The notice speaks to the screen reader. Without url, it is the page's address. Needs the AureaProvider (or aurea.js on the page) to give the notice; it emits [data-aurea-share], which aurea.js also reads. Only on a <button> (ignored with href or render). On native, the same name opens the system share sheet. |
