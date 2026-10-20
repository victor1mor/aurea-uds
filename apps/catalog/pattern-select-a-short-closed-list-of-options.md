# A short, closed list of options

The native select is the right answer more often than it gets used: it is the control the platform already knows how to render on a phone, and it needs no portal, no listbox and no keyboard code. Reach for a Combobox when typing beats scrolling.

## Usage

```tsx
import {Select, Field} from "@aurea-uds/react";
```

```tsx
<Field label="Visibility">
  <Select defaultValue="team">
    <option value="private">Only me</option>
    <option value="team">My team</option>
    <option value="public">Anyone with the link</option>
  </Select>
</Field>
```
