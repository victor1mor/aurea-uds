# Pagination

Pagination moves between the pages of a list: the page numbers, with ellipses when there are many, previous and next. The current page has Aurea's light highlight. With href, every page is a real link a search engine can follow.

## Usage

```tsx
import {Pagination} from "@aurea-uds/react";
```

```tsx
<Pagination label="Search results" page={page} total={12} onPageChange={setPage} />
```

- Numbers by default: the first, the last, the current one and one on each side (siblings).

- summary puts a line on the left — "1 to 5 of 50 orders".

- href turns each page into a link (<a href>), with aria-current on the current one.

- variant="simple" keeps only previous and next; variant="compact" is the look up to 0.31.0.

- Each number is named "Page 3" for screen readers.

- label names the navigation landmark: with two paginations on one page, each says what it pages through.

## Examples

### With a summary

The line on the left says what the pages hold.

```tsx
<Pagination label="Orders" page={1} total={10} summary="1 to 5 of 50 orders" onPageChange={setPage} />
```

### Simple

Only previous and next — for an article split into parts.

```tsx
<Pagination variant="simple" label="Article parts" page={2} total={4} onPageChange={setPage} />
```

### Links

With href each page is a real link, which a search engine follows and a person can open in a new tab.

```tsx
<Pagination label="Blog posts" page={2} total={6} href={(p) => `/blog?page=${p}`} />
```

### Compact

The look up to 0.31.0, for a tight toolbar.

```tsx
<Pagination variant="compact" label="Log entries" page={3} total={12} onPageChange={setPage} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `page` | `number` | — | The current page, counting from 1. |
| `total` | `number` | — | How many PAGES there are, not how many rows. Previous and Next disable themselves at the ends. |
| `onPageChange` | `(page: number) => void` | — | Called with the new page. Optional with href: the page can just navigate. |
| `variant` | `numbers \| simple \| compact` | numbers | numbers: the page numbers, with ellipses (the default). simple: previous and next only. compact: Previous · 3 / 12 · Next, for a tight toolbar. |
| `summary` | `ReactNode` | — | The summary on the left — "1 to 5 of 50 orders". |
| `href` | `(page: number) => string` | — | The address of each page. With it, pages are real links a search engine follows. |
| `siblings` | `number` | 1 | How many pages show on each side of the current one. |
| `label` | `string` | strings.paginationLabel | The name of the navigation landmark. With two paginations on one page, each says what it pages through ("Orders", "Search results"); otherwise a screen reader hears two identical landmarks. |
| `className` | `string` | — | Merged onto the nav, after the Aurea skin. |
