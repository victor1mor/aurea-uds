# A counter under the field

`block-end` for what the reader consults while typing, not before. The count belongs to the control, so it travels with it — unlike a hint on the Field, which describes the input before anyone has touched it.

## Usage

```tsx
import {InputGroup, InputGroupAddon, Textarea} from "@aurea-uds/react";
```

```tsx
<InputGroup>
  <Textarea aria-label="Summary" rows={3} value={text} onChange={e => setText(e.target.value)} />
  <InputGroupAddon side="end" layout="block">{text.length} / 280</InputGroupAddon>
</InputGroup>
```
