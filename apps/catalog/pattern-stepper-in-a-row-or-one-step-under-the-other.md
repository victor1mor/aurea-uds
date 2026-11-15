# In a row, or one step under the other

`orientation="horizontal"` (the default) puts the steps in a row. `"vertical"` is for a side column where a row does not fit: at 150 wide the labels of a horizontal stepper run into each other. The dot stays on the start side, the label sits beside it and wraps if it must, and the line runs down between the dots — yellow up to the current step.

## Usage

```tsx
import {Stepper} from "@aurea-uds/react";
```

```tsx
<Stepper label="Publish" orientation="horizontal" items={[
  {label: "Account", state: "done"},
  {label: "Content", state: "active"},
  {label: "Review"},
]} />
<Stepper label="Publish" orientation="vertical" items={[
  {label: "Account", state: "done"},
  {label: "Profile", state: "done"},
  {label: "Content", state: "active"},
  {label: "Schedule"},
  {label: "Review", optional: "Optional"},
]} />
```
