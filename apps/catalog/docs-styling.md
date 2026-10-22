# Styling

Style Aurea with props first, then with a class name, plain CSS and the tokens.

Aurea ships one stylesheet, `@aurea-uds/core/css`. Every component draws itself with class names from it. You change the look in four ways, from the most to the least preferred: props, a class name, your own CSS, and the tokens.

## Start with props

Most changes are already a prop. A button has two axes: `appearance` (how much weight the box has) and `tone` (what the color means). `variant` is a shortcut for common pairs, and `size` picks a step of the scale.

```tsx
<Cluster>
  <Button variant="primary">Save</Button>
  <Button appearance="outline" tone="success">Approve</Button>
  <Button appearance="soft" tone="danger">Delete</Button>
  <Button appearance="ghost" size="sm">Cancel</Button>
</Cluster>
```

A prop keeps the component inside the system. It also keeps both themes, the three densities and high contrast working. Reach for CSS only when no prop does the job.

## Basic styling

Components accept `className`. Your class is added after Aurea's own classes, never in place of them.

```tsx
<Button variant="primary" className="checkout-save">Save</Button>
```

The button above renders `class="btn btn-primary checkout-save"`. Components also accept `style` for inline values:

```tsx
<Card style={{maxInlineSize: "32rem"}}>Summary</Card>
```

## How your CSS wins

The whole stylesheet, tokens included, sits inside one cascade layer named `aurea`. A rule outside any layer beats a rule inside a layer, whatever the specificity. So plain CSS in your app overrides Aurea without `!important` and without long selectors.

```css
.checkout-save {
  min-inline-size: 12rem;
}
```

If your app puts its own CSS in layers too, declare the order once, with `aurea` first:

```css
@layer aurea, app;
```

## Use the tokens

In Aurea every color, radius, font size and space comes from a token. The tokens are CSS custom properties on `:root`. Use them in your own CSS, and your additions follow the theme and the density for free.

```css
.order-summary {
  padding: var(--space-4);
  border-radius: var(--radius-card);
  background: var(--fill-1);
  color: var(--foreground);
  font-size: var(--text-sm);
}
```

Two rules of the system apply to your CSS as well:

- **No gradients.** Aurea uses flat color only.
- **No lines.** Components draw no visible border; the `outline` card and the `Header` divider are the only lines. A piece that needs to stand out from the page gets a translucent fill (`--fill-1`, `--fill-2`, `--fill-3`) instead of an outline; in the light theme, a field on the page is white with a soft shadow instead (`--field-fill`, `--field-lift`). The focus ring stays.

All tokens, with their values in each theme, are on the [Tokens](./tokens.html) page. To change the tokens themselves, see [Theming](./docs-theming.html).

## State-based styling

Interactive components built on Base UI expose their state as `data-*` attributes. Aurea's stylesheet styles these attributes, and you can target them the same way.

| Attribute | Where you see it |
|---|---|
| `data-pressed` | a `Toggle` that is on |
| `data-highlighted` | the menu item under the pointer or the keyboard |
| `data-selected` | the selected tag, tree node or calendar day |
| `data-disabled` | a disabled slider, menu item or tag |
| `data-popup-open` | a menu trigger while its menu is open |
| `data-starting-style` / `data-ending-style` | a dialog, popover, tooltip or toast while it enters or leaves |

Navigation and fields use ARIA attributes instead, because a screen reader reads the same attribute: `aria-current` marks the current page, `aria-pressed` a pressed button, `aria-invalid` a field with an error.

```css
.toggle[data-pressed] {
  color: var(--primary);
}

.sidebar-item[aria-current] {
  font-weight: var(--weight-semibold);
}
```

Some components wrap a native element and use its own state. A `Switch` is a checkbox with `role="switch"`, so its state is `:checked`.

## Responsive design

`size` and other scale props take a responsive value. Give a `base` and the steps that change it. The `viewport` steps react to the window width:

```tsx
<Button size={{base: "sm", viewport: {md: "lg"}}}>Save</Button>
```

The `container` steps react to the width of the nearest `ContainerScope` instead. Use them for a component that lives in panels of different widths:

```tsx
<ContainerScope>
  <Button size={{base: "sm", container: {md: "lg"}}}>Save</Button>
</ContainerScope>
```

| Step | Viewport from | Container from |
|---|---|---|
| `2xs` | 360px | 360px |
| `xs` | 480px | 480px |
| `sm` | 640px | 640px |
| `md` | 768px | 768px |
| `lg` | 1024px | 1024px |
| `xl` | 1280px | none |
| `2xl` | 1536px | none |

A value reacts to the viewport or to the container, never to both. For anything else, write a media query or a container query in your own CSS.

## Class names

Class names are short and flat: the block, then a modifier joined by a hyphen. These are the names the components emit, and the names you use in plain HTML.

| Component | Classes |
|---|---|
| `Button` | `.btn`, `.btn-primary`, `.btn-outline`, `.btn-tone-success`, `.btn-sm`, `.btn-icon` |
| `Card` | `.card`, `.card-raised`, `.card-interactive`, `.card-header`, `.card-title`, `.card-content`, `.card-footer` |
| `Icon` | `.icon`, `.icon-sm`, `.icon-lg`, `.icon-xl` |

To see the classes of any component, open its page and read the rendered markup, or search the stylesheet in `@aurea-uds/core/dist/aurea.css`.

## Plain HTML

The stylesheet works without React. Load the fonts first, then the core, and write the classes yourself:

```html
<link rel="stylesheet" href="node_modules/@aurea-uds/fonts/dist/fonts.css">
<link rel="stylesheet" href="node_modules/@aurea-uds/core/dist/aurea.css">
<button class="btn btn-primary" type="button">Save</button>
```

The core also ships a small script, `@aurea-uds/core/js`. It is safe on any page and adds a few behaviors to plain markup:

- arrow keys, Home and End on an element with `role="tablist"`;
- copy to the clipboard for any trigger marked `data-aurea-copy`;
- `window.Aurea.setTheme`, `window.Aurea.setDensity` and `window.Aurea.toggleTheme`, which write the `data-theme` and `data-density` attributes;
- `window.Aurea.showToast` for a toast.

The React package does not need this script.

## Next steps

- Learn how components move in [Animation](./docs-animation.html).
- Change the tokens in [Theming](./docs-theming.html).
- Build bigger pieces in [Composition](./docs-composition.html).
