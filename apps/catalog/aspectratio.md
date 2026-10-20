# AspectRatio

A box that keeps its proportion, whatever the width.

## Usage

```tsx
import {AspectRatio} from "@aurea-uds/react";
```

```tsx
<AspectRatio ratio={16 / 9}>
  <img src="/cover.jpg" alt="" />
</AspectRatio>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `ratio` | `number` | 1 | Width over height, as a number — 16/9 is 1.777…. It becomes the CSS aspect-ratio, so the box keeps the proportion at any width. |
