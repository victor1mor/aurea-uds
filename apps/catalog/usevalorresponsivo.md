# useValorResponsivo

The old name of useResponsiveValue. Same hook, still works the same; use useResponsiveValue.

## Usage

```tsx
import {useValorResponsivo} from "@aurea-uds/react";
```

```tsx
const orientation = useValorResponsivo(
  {base: "vertical", container: {sm: "horizontal"}},
  "horizontal",
  anchorRef,
);
```
