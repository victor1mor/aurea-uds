# What happened to this record

An ordered list because the order carries meaning: a screen reader announces "item 2 of 5" and the reader knows where in the story they are. A stack of divs would say the same words and lose that.

## Usage

```tsx
import {Timeline} from "@aurea-uds/react";
```

```tsx
<Timeline items={[
  {title: "Created", time: "09:02", description: "Drafted by Writer."},
  {title: "Reviewed", time: "10:41", description: "Two comments resolved."},
  {title: "Published", time: "11:15"},
]} />
```
