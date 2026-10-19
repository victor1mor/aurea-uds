# Reacting to the window instead

The other mechanism, for when the decision really does belong to the application and not to the slot: the step follows the viewport. Same axis, same scale, and the prefix in the emitted class says which of the two is measuring — `md` is always 768px, and never means two things depending on where you read it. Resize the window to see it move; the example above will not move, because its containers have fixed widths.

## Usage

```tsx
import {Button} from "@aurea-uds/react";
```

```tsx
<Button size={{base: "xs", viewport: {sm: "md", lg: "xl"}}}>Publish</Button>
```
