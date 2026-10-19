# Going back to a finished step

`onClick` turns a step into a real button — but only where going back is allowed. Leaving the unreached steps inert is the point: a stepper whose every step is clickable is a tab list wearing the wrong clothes.

## Usage

```tsx
import {Stepper} from "@aurea-uds/react";
```

```tsx
<Stepper label="Checkout" items={[
  {label: "Cart", state: "done", onClick: () => goTo(0)},
  {label: "Address", state: "done", onClick: () => goTo(1)},
  {label: "Payment", state: "active"},
  {label: "Review"},
]} />
```
