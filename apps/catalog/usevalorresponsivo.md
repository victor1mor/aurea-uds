# useValorResponsivo

Resolves a Responsive<T> into the single value that applies right now — by viewport, by container, or not at all.

## Usage

```tsx
import {useValorResponsivo} from "@aurea-uds/react";
```

```tsx
const orientacao = useValorResponsivo(
  {base: "vertical", container: {sm: "horizontal"}},
  "horizontal",
  ancora,
);
```
