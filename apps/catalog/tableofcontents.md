# TableOfContents

In-page index of a document's sections. Sticky beside the content, marks the section in view.

## Usage

```tsx
import {TableOfContents} from "@aurea-uds/react";
```

```tsx
<TableOfContents label="On this page" current="preview" items={[
  {id: "preview", label: "Preview"},
  {id: "installation", label: "Installation"},
  {id: "reference", label: "Reference"},
]} />
```

## Examples

### Reading ring, raised current item

progress puts a ring in place of the heading icon, with how much of the page has been read, in ring and number; indicator="segment" raises the current item in a capsule, like the Sidebar's.

```tsx
<TableOfContents progress indicator="segment" current="preview" items={items} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `TocItem[]` | — | The entries: {id, label, sub?}. `sub` indents one level and there is no level below that — a contents list that mirrors five heading levels is a second document. |
| `current` | `string` | — | The id of the section you are in; it gets aria-current. Which one that is depends on scroll, and scroll is the page's business, not the component's. |
| `label` | `string` | "On this page" | Both the visible heading and the accessible name of the <nav> — one string, so they cannot say different things. |
| `progress` | `boolean` | false | A reading ring in place of the heading icon: how much of the page has been scrolled, in the ring and as a number at the end of the line. Decoration for reading — the ring and the number are hidden from screen readers, which already hear the current section through aria-current. |
| `indicator` | `line \| segment` | line | How the current item is marked: line, the stroke at the side, or segment, the raised capsule of the Sidebar. |
