# Rejected value

The error joins the accessible description and marks the control invalid. A red field alone tells a colour-blind user nothing.

## Usage

```tsx
import {Field, Input} from "@aurea-uds/react";
```

```tsx
<Field label="Slug" error="Already taken.">
  <Input defaultValue="button" />
</Field>
```
