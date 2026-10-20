# Breadcrumb

Trail showing the current location in a hierarchy.

## Usage

```tsx
import {Breadcrumb} from "@aurea-uds/react";
```

```tsx
<Breadcrumb items={[
  {label: "Home", href: "/"},
  {label: "Patterns", href: "/patterns"},
  {label: "QR code"},
]} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `Array<{label: ReactNode; href?: string; render?: ReactElement}>` | — | The trail, in order. An item with no href renders as a <strong> carrying aria-current="page" instead of a link — the last crumb is where you already are, and a link to the current page is one more thing to skip. An item may carry render (a ReactElement, your router's link) instead of href — it receives the item's skin, the current-page state and the item's content. |
| `label` | `string` | "Breadcrumb" | Accessible name of the <nav>. Two navigation landmarks sharing a name fail axe. |
