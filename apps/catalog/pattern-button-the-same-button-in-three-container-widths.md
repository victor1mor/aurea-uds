# The same button in three container widths

One button, one value, one viewport — three container widths. The step comes from the space the component was placed in, not from the size of the window, so a sidebar and a main column can show the same component at different steps at the same time. This is the proof that separates the two mechanisms: if the three measured the same, what existed would be a media query under another name. The parent needs `container-scope`, which names the container — an unnamed one matches the nearest ancestor that happens to be a container, including one somebody else declared for another reason.

## Usage

```tsx
import {Button} from "@aurea-uds/react";
```

```tsx
<div className="container-scope">
  <Button size={{base: "xs", container: {xs: "sm", sm: "md", md: "lg"}}}>
    Publish
  </Button>
</div>
```
