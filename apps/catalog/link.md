# Link

Link is a text link: medium weight in the link colour, with no underline until the pointer rests on it. external opens in a new tab and shows the arrow; disabled does not navigate.

## Usage

```tsx
import {Link} from "@aurea-uds/react";
```

```tsx
<p>Read the <Link href="/terms">terms of use</Link> before you sign.</p>
<Link href="/pricing">See the plans</Link>
```

- A real <a href> — the browser opens it in a new tab, copies it, and a search engine follows it.

- The underline appears on hover and while pressed, 4 below the text.

- external sets target="_blank" with rel="noopener noreferrer" and draws the arrow.

- disabled renders without href and with aria-disabled.

- It wraps inside a paragraph, which a page zoomed to 200% needs.

## Examples

### External and disabled

The arrow says it leaves the site; the disabled one does not go anywhere.

```tsx
<Link href="https://example.com" external>Documentation</Link>
<Link href="/export" disabled>Export (no permission)</Link>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `href` | `string` | — | Where it goes. |
| `external` | `boolean` | false | Opens in a new tab (target="_blank", rel="noopener noreferrer") and shows the reference library's arrow, drawn by CSS mask. |
| `disabled` | `boolean` | false | Does not navigate: rendered without href and with aria-disabled. |
| `children` | `ReactNode` | — | The link text. |
| `className` | `string` | — | Added to the <a>. |
