# Where you are in a sequence

Three states in one row: what is done, what you are on, what is left. The current step carries `aria-current="step"`, so the position is announced and not only drawn — a stepper that only draws is a decoration.

## Usage

```tsx
import {Stepper} from "@aurea-uds/react";
```

```tsx
<Stepper label="Checkout" items={[
  {label: "Cart", state: "done"},
  {label: "Address", state: "active"},
  {label: "Payment"},
]} />
```
