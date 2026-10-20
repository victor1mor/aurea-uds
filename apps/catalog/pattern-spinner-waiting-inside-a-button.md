# Waiting inside a button

The label stays while the spinner runs — replacing it with a bare spinner loses what the user is waiting for. Decorative here, because the button already announces itself busy.

## Usage

```tsx
import {Spinner, Button} from "@aurea-uds/react";
```

```tsx
<Button variant="primary" loading>Saving…</Button>
```
