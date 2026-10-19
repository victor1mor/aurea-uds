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

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `TocItem[]` | — | The entries: {id, label, sub?}. `sub` indents one level and there is no level below that — a contents list that mirrors five heading levels is a second document. |
| `current` | `string` | — | The id of the section you are in; it gets aria-current. Which one that is depends on scroll, and scroll is the page's business, not the component's. |
| `label` | `string` | "On this page" | Both the visible heading and the accessible name of the <nav> — one string, so they cannot say different things. |
