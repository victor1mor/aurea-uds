# One box that gates the action

The label is the whole sentence and it is clickable — a checkbox whose label is not part of the target is a 16px hit area, which fails on touch. Never pre-checked when it grants permission.

## Usage

```tsx
import {Checkbox} from "@aurea-uds/react";
```

```tsx
<Checkbox
  label="Send me release notes"
  description="About once a month. You can turn this off any time."
/>
```
