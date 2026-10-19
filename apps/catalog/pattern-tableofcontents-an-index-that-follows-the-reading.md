# An index that follows the reading

It marks the section in view by itself — pass current only when something else owns that state. Sub-items are one level deep and no more: an index that needs three levels is a document that needs splitting.

## Usage

```tsx
import {TableOfContents} from "@aurea-uds/react";
```

```tsx
<TableOfContents items={[
  {id: "install", label: "Installation"},
  {id: "usage", label: "Usage"},
  {id: "props", label: "Props", sub: true},
  {id: "a11y", label: "Accessibility"},
]} />
```
