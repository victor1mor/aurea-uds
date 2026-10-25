# IconButton

IconButton is a Button whose whole label is a glyph. The `label` prop is required and becomes the accessible name — an icon carries no text, so without it the control is mute to a screen reader. That requirement is the reason this component exists instead of a Button you happen to fill with an Icon.

## Usage

```tsx
import {IconButton} from "@aurea-uds/react";
```

```tsx
<IconButton icon="pencil-simple" label="Edit" />
<IconButton icon="copy" label="Duplicate" variant="outline" />
<IconButton icon="gear" label="Settings" variant="secondary" />
<IconButton icon="trash" label="Delete" variant="danger-ghost" />
```

- label is required, not optional: the API refuses to let you ship a nameless control.

- Square target — the width follows the same density token as the height, at every size.

- Softly squared, not pill: a round-ended square would read as a dot next to a text button.

- Every Button variant and state applies, including loading, href and pressed.

- Pair it with Tooltip when the glyph alone is not obvious; the tooltip repeats the label.

## Examples

### Sizes

Five square targets. The glyph keeps its own scale; the box grows with the density token.

```tsx
<IconButton icon="plus" label="Add" size="xs" />
<IconButton icon="plus" label="Add" size="sm" />
<IconButton icon="plus" label="Add" />
<IconButton icon="plus" label="Add" size="lg" />
<IconButton icon="plus" label="Add" size="xl" />
```

### With tooltip

When the glyph is not self-evident, the tooltip says the same words as the label — never different ones. Point at the button, or reach it with Tab, to see the balloon.

```tsx
<Tooltip content="Duplicate">
  <IconButton icon="copy" label="Duplicate" />
</Tooltip>
```

### Toggle

aria-pressed works here too: a pinned view, a muted channel, a starred row.

```tsx
<IconButton icon="star" label="Star" pressed />
<IconButton icon="push-pin" label="Pin" pressed={false} />
```

### Loading and disabled

Busy replaces the glyph with the spinner and sets aria-busy; disabled keeps the target in place.

```tsx
<IconButton icon="floppy-disk" label="Save" loading />
<IconButton icon="floppy-disk" label="Save" disabled />
```

### Row of actions

Grouped, they get one accessible name for the set — the classic end of a table row.

```tsx
<ButtonGroup label="Row actions">
  <IconButton icon="eye" label="Open" />
  <IconButton icon="pencil-simple" label="Edit" />
  <IconButton icon="trash" label="Delete" variant="danger-ghost" />
</ButtonGroup>
```

### Appearances

How much weight the circle carries, from the fill to the bare glyph. nav is the navigation item.

```tsx
<IconButton icon="star" label="Appearance solid" appearance="solid" />
<IconButton icon="star" label="Appearance soft" appearance="soft" />
<IconButton icon="star" label="Appearance outline" appearance="outline" />
<IconButton icon="star" label="Appearance ghost" appearance="ghost" />
<IconButton icon="star" label="Appearance link" appearance="link" />
<IconButton icon="star" label="Appearance nav" appearance="nav" />
```

### Tones

What the colour means; every tone works with every appearance. Here, solid.

```tsx
<IconButton icon="star" label="Tone neutral" appearance="solid" tone="neutral" />
<IconButton icon="star" label="Tone brand" appearance="solid" tone="brand" />
<IconButton icon="star" label="Tone info" appearance="solid" tone="info" />
<IconButton icon="star" label="Tone success" appearance="solid" tone="success" />
<IconButton icon="star" label="Tone warning" appearance="solid" tone="warning" />
<IconButton icon="star" label="Tone danger" appearance="solid" tone="danger" />
```

### Every shortcut

variant is the short name for an (appearance, tone) pair — the same list as Button.

```tsx
<IconButton icon="star" label="Variant primary" variant="primary" />
<IconButton icon="star" label="Variant secondary" variant="secondary" />
<IconButton icon="star" label="Variant tertiary" variant="tertiary" />
<IconButton icon="star" label="Variant outline" variant="outline" />
<IconButton icon="star" label="Variant ghost" variant="ghost" />
<IconButton icon="star" label="Variant link" variant="link" />
<IconButton icon="star" label="Variant nav" variant="nav" />
<IconButton icon="star" label="Variant primary-outline" variant="primary-outline" />
<IconButton icon="star" label="Variant primary-ghost" variant="primary-ghost" />
<IconButton icon="star" label="Variant link-primary" variant="link-primary" />
<IconButton icon="star" label="Variant danger" variant="danger" />
<IconButton icon="star" label="Variant danger-soft" variant="danger-soft" />
<IconButton icon="star" label="Variant danger-outline" variant="danger-outline" />
<IconButton icon="star" label="Variant danger-ghost" variant="danger-ghost" />
<IconButton icon="star" label="Variant link-danger" variant="link-danger" />
```

### Every size

The control scale; on a touch screen every size keeps a 44 target.

```tsx
<IconButton icon="star" label="Size xs" size="xs" />
<IconButton icon="star" label="Size sm" size="sm" />
<IconButton icon="star" label="Size md" size="md" />
<IconButton icon="star" label="Size lg" size="lg" />
<IconButton icon="star" label="Size xl" size="xl" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | REQUIRED. Becomes aria-label: an icon with no text has no accessible name without it. |
| `icon` | `AureaIcon` | — | Glyph, from the contract's allowlist — or the app's own drawing (a component that returns its <svg>), as Icon and the native IconButton take. |
| `variant` | `ButtonVariant \| danger-soft` | ghost | Same variants as Button. Ghost by default, so a row of them stays quiet. `secondary` is the neutral fill with the brand-coloured label; `tertiary` the neutral fill with the plain label (the default). |
| `appearance` | `solid \| outline \| ghost \| link \| nav \| soft` | ghost | Inherited from Button. How much weight the box carries; the default here is ghost. |
| `tone` | `neutral \| brand \| danger \| success \| warning \| info` | neutral | Inherited from Button. What the colour means; every combination exists. |
| `size` | `xs \| sm \| md \| lg \| xl` | md | Square target: the width follows the same density token as the height. |
| `loading` | `boolean` | false | Spinner in place of the glyph, aria-busy set, interaction blocked. |
| `href` | `string` | — | Renders an anchor with the same skin, like Button. |
| `leadingIcon` | `AureaIcon` | — | A second glyph before the main one. Rare on an icon button, and it is here because the type is shared with Button. |
| `trailingIcon` | `AureaIcon` | — | A glyph after the main one — a chevron on a button that opens a menu, for instance. |
| `kbd` | `string \| string[]` | — | Shows the shortcut inside the button AND announces it with aria-keyshortcuts. Showing it without announcing would be decoration. A list (["Ctrl", "K"]) shows one key cap per key and announces the combination (Control+K). |
| `fullWidth` | `boolean` | false | Fills the width of the container instead of hugging the glyph. |
| `grow` | `boolean` | false | In a row (Cluster), takes an equal share with the other buttons that also grow. `fullWidth` asks for the whole line instead. |
| `target` | `HTMLAttributeAnchorTarget` | — | Link attribute, only with `href`. |
| `rel` | `string` | — | Link attribute, only with `href`. |
| `download` | `boolean \| string` | — | Link attribute, only with `href`. |
| `render` | `ReactElement` | — | The element drawn instead of the <button>/<a> — your router's link, e.g. render={<Link href="/reports" />}. It receives the button's skin, content (icons, label, shortcut) and attributes; the destination is its own. Disabled or loading, its click is blocked too, like the disabled link. |
| `pressed` | `boolean` | — | Deprecated, removed in 1.0: paints and announces aria-pressed while YOU keep the state. Use Toggle, which keeps the state and demands an accessible name when it is icon-only. |
| `share` | `{ url?: string; title?: string; text?: string }` | — | The button shares. It asks the browser whether it can share this link (navigator.canShare) — detecting the capability, not guessing the device. If it can (phones; Chrome, Edge and Safari on desktop), the device's share sheet opens, and cancelling is not an error. If it cannot, it copies the link and shows "Link copied" anchored to the button, at the button's size. If the copy fails, it says so and shows the link selected. The notice speaks to the screen reader. Without url, it is the page's address. Needs the AureaProvider (or aurea.js on the page) to give the notice; it emits [data-aurea-share], which aurea.js also reads. Only on a <button> (ignored with href or render). On native, the same name opens the system share sheet. |
| `quiet` | `boolean` | false | Less weight: muted text one step smaller — the Button's quiet. |
