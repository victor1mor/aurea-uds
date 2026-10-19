# On the button that performs it

The one case where the keys must NOT be a bare Kbd: `kbd` on the Button both draws the shortcut and emits `aria-keyshortcuts`, so the shortcut is announced and not only seen. A Kbd dropped inside a button would be the decoration without the promise.

## Usage

```tsx
import {Button} from "@aurea-uds/react";
```

```tsx
<Button variant="primary" kbd="⌘ Enter">Send</Button>
```
