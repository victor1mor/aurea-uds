# Prose

The skin for long-form text. It is not the parser — that stays yours.

## Usage

```tsx
import {Prose} from "@aurea-uds/react";
```

```tsx
<Prose>
  <h2>The joke tax</h2>
  <p>The king thought long and hard, and finally came up with <a href="#">a plan</a>.</p>
  <blockquote>Everyone enjoys a good joke, so it is only fair that they pay.</blockquote>
  <ul><li>Puns: 5 coins</li><li>One-liners: 20 coins</li></ul>
</Prose>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | The rendered article. Bring your own Markdown renderer — react-markdown, MDX, or the HTML your CMS already returns. Prose styles h1-h4, p, a, ul, ol, li, blockquote, code, pre, img, hr, figcaption, table, th and td, all scoped under .prose. |
| `dangerouslySetInnerHTML` | `{__html: string}` | — | Accepted because it is a div, and it is the most likely way to use this. SANITISE FIRST — with DOMPurify or your framework's sanitiser. Aurea styles the text; it cannot and must not decide what is safe to render. |
| `--prose-measure` | `CSS custom property` | 68ch | The reading measure. Long lines are hard to track back to the next one, so the text caps its own width rather than filling the container. Set it, or set it to none if the page already constrains the column. |
| `--font-editorial` | `CSS custom property` | not applied | An alias of the body font, kept so code that already uses it keeps working: the fonts package has no serif face, and Prose reads in the body font. To give long-form text a different face, point font-family at a typeface of your own on .prose. |
