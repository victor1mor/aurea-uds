# Fold driven from outside

`open` plus `onOpenChange` when something else in the screen decides — a "expand all" button, a deep link, a search that has to reveal the match it found. Passing `open` without `onOpenChange` freezes it, which is a legitimate read-only state and not a bug.

## Usage

```tsx
import {Collapsible, Button} from "@aurea-uds/react";
```

```tsx
const [open, setOpen] = useState(false);

<Button size="sm" variant="ghost" onClick={() => setOpen(o => !o)}>
  {open ? "Collapse all" : "Expand all"}
</Button>
<Collapsible trigger="Environment" open={open} onOpenChange={setOpen}>
  <CodeBlock>{env}</CodeBlock>
</Collapsible>
```
