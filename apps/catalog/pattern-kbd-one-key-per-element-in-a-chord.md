# One key per element in a chord

`⌘ ⇧ P` is three elements, not one string. Split like this the keys line up with the physical keys the reader is looking for, and a chord never renders as a single wide pill that reads like one impossible key.

## Usage

```tsx
import {Kbd} from "@aurea-uds/react";
```

```tsx
<span className="cluster">
  <Kbd>⌘</Kbd><Kbd>⇧</Kbd><Kbd>P</Kbd>
</span>
```
