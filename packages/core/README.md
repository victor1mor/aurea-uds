# @aurea-uds/core

The **Aurea UDS** stylesheet, plus the little behaviour in plain JavaScript that does not need React.

```bash
pnpm add @aurea-uds/core @aurea-uds/fonts
```

```js
import "@aurea-uds/fonts/css";  // before the core: it bundles no font
import "@aurea-uds/core/css";
import "@aurea-uds/core/js";    // optional — tabs, open and close, and the like, without React
```

The JavaScript does nothing without a DOM, so it is safe to import during server rendering.

## What is here

Every rule the system needs, and nothing else. Documentation decoration and product mock-ups used to
live here; they were moved out, and a check keeps them out — a class in this stylesheet must be one that
some component actually produces.

The values come from `@aurea-uds/tokens`. A raw pixel of spacing, radius, font size, weight or line
height fails in CI, not in a review.

## Theme and density

```html
<html data-theme="dark" data-density="comfortable">
```

`data-theme` is `dark` or `light`; `data-density` is `compact`, `comfortable` or `spacious`. Both are
read from the root element, and a control of a given size measures the same in every combination.

## License

Apache-2.0.
