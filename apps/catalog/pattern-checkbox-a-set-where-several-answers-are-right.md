# A set where several answers are right

Checkbox, not radio, is the difference between 'pick any' and 'pick one'. The rule is the answer, not the look: if zero selected is a legitimate state, it is a checkbox.

## Usage

```tsx
import {Checkbox} from "@aurea-uds/react";
```

```tsx
<fieldset>
  <legend>Notify me about</legend>
  <Checkbox label="Failed runs" />
  <Checkbox label="New members" />
  <Checkbox label="Weekly summary" />
</fieldset>
```
