# Grouping a menu without labelling it

The line groups the destructive action away from the rest so it is not reached by accident. Note what it is not doing: a screen reader hears one flat list, and that is correct — the separation is a pointer affordance, and the wording of the item is what carries the warning.

## Usage

```tsx
import {Separator, Button} from "@aurea-uds/react";
```

```tsx
<div className="menu">
  <button className="menu-item" type="button">Rename</button>
  <button className="menu-item" type="button">Duplicate</button>
  <Separator />
  <button className="menu-item" type="button">Delete permanently</button>
</div>
```
