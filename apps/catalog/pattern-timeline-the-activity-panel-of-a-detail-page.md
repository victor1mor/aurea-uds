# The activity panel of a detail page

Beside the record, not under it: the timeline answers "what has been done to this" while the page answers "what is this". Putting it in a card of its own is what keeps the two questions from running together.

## Usage

```tsx
import {Card, Timeline} from "@aurea-uds/react";
```

```tsx
<Card>
  <h3>Activity</h3>
  <Timeline items={activity} />
</Card>
```
