# A toolbar over the field

`block-start` takes the whole line above the control, which is the only place a row of actions fits without stealing width from the value. This is the shape a composer wants: the field is the work, the bar is what you do to it.

## Usage

```tsx
import {InputGroup, InputGroupAddon, Textarea, IconButton} from "@aurea-uds/react";
```

```tsx
<InputGroup>
  <InputGroupAddon side="start" layout="block">
    <IconButton icon="text-b" label="Bold" size="sm" />
    <IconButton icon="text-italic" label="Italic" size="sm" />
    <IconButton icon="link" label="Link" size="sm" />
  </InputGroupAddon>
  <Textarea aria-label="Notes" rows={3} defaultValue="" />
</InputGroup>
```
