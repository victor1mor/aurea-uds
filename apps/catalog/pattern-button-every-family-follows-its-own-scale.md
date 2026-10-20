# Every family follows its own scale

The same three containers, now with one piece from each family. Control, mark and avatar come from the control height and step together; the icon inside the button comes from the glyph scale and does NOT follow the button — a large button with a huge glyph is not a larger button, it is a different drawing. The two behaviours in one picture are the point: sharing a step is measured, never assumed.

## Usage

```tsx
import {Button, Checkbox, Switch, Avatar} from "@aurea-uds/react";
```

```tsx
<div className="container-scope">
  <Button leadingIcon="plus" size={{base: "xs", container: {xs: "sm", sm: "md", md: "lg"}}}>Add</Button>
  <Checkbox label="Include drafts" size={{base: "sm", container: {sm: "md", md: "lg"}}} />
  <Switch label="Live" size={{base: "sm", container: {sm: "md", md: "lg"}}} />
  <Avatar fallback="AB" size={{base: "sm", container: {sm: "md", md: "lg"}}} />
</div>
```
