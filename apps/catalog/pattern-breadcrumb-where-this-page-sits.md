# Where this page sits

Every level is a link except the last, which is the page itself and carries aria-current. A breadcrumb whose last item is also a link tells the screen reader that the user can navigate to where they already are.

## Usage

```tsx
import {Breadcrumb} from "@aurea-uds/react";
```

```tsx
<Breadcrumb items={[
  {label: "Components", href: "./index.html"},
  {label: "Actions", href: "./index.html#actions"},
  {label: "Button"},
]} />
```
