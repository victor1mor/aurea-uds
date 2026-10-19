# A description field that grows

Rows set the starting height, not the limit. The field keeps the pill radius of every other control, because a text area is still a field — the shape changes only when it becomes a composition box with its own toolbar.

## Usage

```tsx
import {Textarea, Field} from "@aurea-uds/react";
```

```tsx
<Field label="Description" hint="Markdown is supported">
  <Textarea rows={4} placeholder="What does this project do?" />
</Field>
```
