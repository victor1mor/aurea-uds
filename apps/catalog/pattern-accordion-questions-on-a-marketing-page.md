# Questions on a marketing page

The title is the question in the reader's own words, not a category. An accordion earns its place when the reader wants one answer, not all of them — otherwise plain headings read faster.

## Usage

```tsx
import {Accordion} from "@aurea-uds/react";
```

```tsx
<Accordion items={[
  {id: "ship", title: "How do I ship it?",
   content: "Install the three packages and import the CSS. Nothing to configure."},
  {id: "theme", title: "Can I match my brand?",
   content: "Every visual value is a token. Override the ones you need."},
  {id: "a11y", title: "Is it accessible?",
   content: "Keyboard and ARIA come from the engine; contrast is gated in CI."},
]} />
```
