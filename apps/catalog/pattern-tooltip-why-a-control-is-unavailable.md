# Why a control is unavailable

A disabled button says no and not why, and a disabled element does not receive focus — so the tip goes on a wrapper that does. Without that the explanation exists only for a mouse, which is the failure this pattern is here to avoid.

## Usage

```tsx
import {Tooltip, Button} from "@aurea-uds/react";
```

```tsx
<Tooltip content="Add a payment method first">
  <span tabIndex={0}>
    <Button variant="primary" disabled>Publish</Button>
  </span>
</Tooltip>
```
