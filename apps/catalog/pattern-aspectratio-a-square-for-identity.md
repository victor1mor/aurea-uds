# A square, for identity

`ratio={1}` is the default because the square is the shape identity uses — an avatar, a logo, a QR code. Naming it explicitly in the code is still worth it: a reader who sees `ratio={1}` knows the square was chosen, not inherited.

## Usage

```tsx
import {AspectRatio, QRCode} from "@aurea-uds/react";
```

```tsx
<AspectRatio ratio={1}>
  <QRCode value="https://aureauds.dev" />
</AspectRatio>
```
