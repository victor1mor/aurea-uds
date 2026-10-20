# ToolbarButton

ToolbarButton is the Button that belongs to a Toolbar. Same API, same skin — what changes is that it joins the roving tabindex of the bar instead of owning a tab stop of its own. Outside a Toolbar it has nothing to roam, so use Button there.

## Usage

```tsx
import {Toolbar, ToolbarButton} from "@aurea-uds/react";
```

```tsx
<Toolbar label="Style">
  <ToolbarButton pressed>Bold</ToolbarButton>
  <ToolbarButton>Italic</ToolbarButton>
  <ToolbarButton>Underline</ToolbarButton>
</Toolbar>
```

- Accepts every Button prop: variant, size, icons, loading, pressed, disabled.

- Ghost by default — inside a toolbar the surface already frames the action.

- Reachable by arrow keys, not by Tab: the bar owns the single tab stop.

- pressed makes it a toggle (bold, italic) with aria-pressed, the same state as Button.

- Disabled buttons stay in the arrow order so the row does not renumber under the user.

## Examples

### With icons

Glyph plus word: in a dense bar the icon speeds the scan and the label keeps the meaning.

```tsx
<ToolbarButton leadingIcon="arrow-counter-clockwise">Undo</ToolbarButton>
<ToolbarButton leadingIcon="arrow-clockwise">Redo</ToolbarButton>
```

### A destructive action in the bar

Even here the tone carries weight: ghost destructive reads as available, not as the main move.

```tsx
<ToolbarButton>Duplicate</ToolbarButton>
<ToolbarSeparator />
<ToolbarButton variant="danger-ghost" leadingIcon="trash">Delete</ToolbarButton>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `ButtonVariant \| danger-soft` | ghost | Ghost by default: inside a toolbar the surface already frames the action. `secondary` is the neutral fill with the brand-coloured label; `tertiary` the neutral fill with the plain label (the default). |
| `appearance` | `solid \| outline \| ghost \| link \| nav \| soft` | ghost | Inherited from Button. How much weight the box carries; the default here is ghost. |
| `tone` | `neutral \| brand \| danger \| success \| warning \| info` | neutral | Inherited from Button. What the colour means; every combination exists. |
| `pressed` | `boolean` | — | Toggle inside the toolbar (bold, italic). aria-pressed, not a variant. |
| `leadingIcon` | `AureaIcon` | — | Same icon API as Button; every Button prop is accepted. |
| `disabled` | `boolean` | false | Stays in the roving order but is not activatable, so the set does not shift. |
| `size` | `Responsive<ComponentSize>` | md | The system's size step, shared with Button. Responsive. |
| `href` | `string` | — | Renders an <a> instead of a <button>: a toolbar item that NAVIGATES has to be a link, or middle-click and open-in-new-tab stop working. |
| `loading` | `boolean` | false | Shows the spinner and sets aria-busy. |
| `trailingIcon` | `AureaIcon` | — | A glyph after the label. |
| `kbd` | `string \| string[]` | — | Shows the shortcut and announces it with aria-keyshortcuts. A list (["Ctrl", "K"]) shows one key cap per key and announces the combination (Control+K). |
| `fullWidth` | `boolean` | false | Fills the width of the container. |
| `grow` | `boolean` | false | In a row (Cluster), takes an equal share with the other buttons that also grow. `fullWidth` asks for the whole line instead. |
| `target` | `HTMLAttributeAnchorTarget` | — | Link attribute, only with `href`. |
| `rel` | `string` | — | Link attribute, only with `href`. |
| `download` | `boolean \| string` | — | Link attribute, only with `href`. |
| `render` | `ReactElement` | — | Inherited from Button: the element that renders the button — the router's link, for example — receiving the Aurea skin and the content. |
| `quiet` | `boolean` | false | Less weight: muted text one step smaller — the Button's quiet. |
