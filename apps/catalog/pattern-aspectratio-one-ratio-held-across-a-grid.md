# One ratio held across a grid

Cards of different image heights read as a broken grid even when every card is correct. Fixing the ratio in one place is what makes the row line up, and it survives a source image nobody checked.

## Usage

```tsx
import {AspectRatio} from "@aurea-uds/react";
```

```tsx
<div className="grid">
  {items.map(i => (
    <AspectRatio key={i.id} ratio={4 / 3}>
      <img src={i.cover} alt="" />
    </AspectRatio>
  ))}
</div>
```
