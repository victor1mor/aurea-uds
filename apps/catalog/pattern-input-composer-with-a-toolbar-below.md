# Composer with a toolbar below

One box, text on top and controls underneath. The addon takes a whole line instead of sitting beside the field, and the frame drops the pill radius for the panel radius — a group with a block addon is no longer a line, it is a surface. Measured: at 999px on a tall box the sides become half-circles and the field text collides with the curve.

## Usage

```tsx
import {InputGroup, Textarea, Button} from "@aurea-uds/react";
```

```tsx
<InputGroup>
  <Textarea rows={2} placeholder="Ask anything…" aria-label="Prompt" />
  <InputGroupAddon side="end" layout="block">
    <Button variant="ghost" size="sm">Attach</Button>
    <Button variant="primary" size="sm">Send</Button>
  </InputGroupAddon>
</InputGroup>
```
