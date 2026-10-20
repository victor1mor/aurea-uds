# Image

An image that reserves its box before the bytes arrive, and falls back when they never do.

## Usage

```tsx
import {Image} from "@aurea-uds/react";
```

```tsx
<Image src="/photo.jpg" alt="The product, from the front" ratio="16/9" />
<Image src="/photo.jpg" alt="The same photo, uncropped" ratio="1/1" fit="contain" />
<Image src="/home.png" srcDark="/home-dark.png" alt="The app's home screen" frame="phone" />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `src` | `string` | — | The image. Every <img> attribute is forwarded, srcset and sizes included — the point of this component is not to wrap them, it is to reserve the box around them. |
| `alt` | `string` | — | Accessible name. It survives the broken state: the fallback box keeps role="img" with this text, which is what the browser's broken-image glyph throws away. |
| `ratio` | `string` | auto | CSS aspect-ratio, as text: "16/9", "1/1", "4/5". This is the layout-shift fix — without a reserved box the image measures zero until it loads and the page jumps. Leave it off when you pass width and height, because then the browser already knows the intrinsic ratio. |
| `fit` | `cover \| contain` | cover | cover fills the reserved box and crops; contain shows the whole picture inside it and drops the background, which is what an enlarged photo wants. |
| `render` | `ReactElement` | — | Swap the <img> for someone else's — typically the framework's own optimised Image. Ours keeps the skin and the reserved box; theirs keeps the CDN, the srcset generation and the loader. Same render prop the engine uses elsewhere in this library. |
| `loading` | `lazy \| eager` | lazy | Defaulted, not forced. An image above the fold should be eager — a lazy hero delays the largest paint. |
| `frame` | `"phone"` | — | The capture inside a phone frame — GENERIC on purpose, with no island, notch or buttons: a manufacturer's marketing rules forbid simulating its device, and the Aurea carries no third-party marks. The frame follows the theme (card surface, border, medium shadow) and has the sheet's corner (--radius-sheet); the inner corner follows it. With a frame, className and style go to the FRAME (size and placement); ratio (default 9/19.5) goes to the capture. |
| `srcDark` | `string` | — | The capture for the dark theme. A page under data-theme="dark" shows this one; otherwise, src. The hidden one is display:none, out of the accessibility tree, and lazy, so the browser does not fetch it. On native the same prop is sourceDark (the native Image takes source). |
