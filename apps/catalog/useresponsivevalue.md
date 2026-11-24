# useResponsiveValue

Resolves a Responsive<T> into the single value that applies right now — by viewport, by container, or not at all.

## Usage

```tsx
import {useResponsiveValue} from "@aurea-uds/react";
```

```tsx
const orientation = useResponsiveValue(
  {base: "vertical", container: {sm: "horizontal"}},
  "horizontal",
  anchorRef,
);
```
