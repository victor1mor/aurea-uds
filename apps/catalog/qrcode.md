# QRCode

Scannable QR code rendered as a styled SVG with Aurea soft geometry.

## Usage

```tsx
import {QRCode} from "@aurea-uds/react/qrcode";
```

```tsx
<QRCode value="https://aureauds.dev" size="sm" />
<QRCode value="https://aureauds.dev" size="md" />
<QRCode value="https://aureauds.dev" size="lg" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | — | REQUIRED. What the code encodes. It is also what the default accessible name reads out, so a reader that cannot scan still gets the payload. |
| `size` | `sm \| md \| lg` | md | 7.5rem, 10rem or 15rem, quiet zone included (the box is border-box). A free number is deliberately gone — it forced raw pixels on you. For an odd size, such as print, override --qr-size in CSS. PICK BY SCANNING, NOT BY LAYOUT: what decides is how many pixels each module gets, and below roughly 4 an ordinary phone camera starts to miss it. Measured on a short URL (33 modules across, quiet zone included): sm gives 2.85 px per module, md 4.06, lg 6.48 — sm is already under the line, and a longer payload makes every one of them worse, because more data means more modules in the same box. |
| `ecc` | `low \| medium \| quartile \| high` | quartile | Error correction. Higher than the usual default on purpose: round dots cover less area than squares, so more correction is what keeps this skin scannable. |
| `quietZone` | `number` | 4 | Blank border in modules, not pixels — it is part of the matrix, not of the layout. Four is the specified minimum; below it, scanners start failing. |
| `label` | `string` | "QR code: {value}" | Accessible name. Replace the default when the value is a long opaque token and the purpose is what matters — "Ticket for row 12", not the token. |
