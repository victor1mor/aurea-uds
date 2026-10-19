# Mobile · PWA

An installable, responsive app: everything works at 320px and touch and keyboard keep parity.

## Usage

```tsx
import {Card, Banner, Field, Input, Button} from "@aurea-uds/react";
```

```tsx
// 320px is the target, not the exception: one column, full-width action,
// touch target never under 24px.
<Card>
  <Banner variant="warning" title="Offline">Saved locally, queued to send.</Banner>
  <Field label="Reading"><Input inputMode="numeric" defaultValue="41.2" /></Field>
  <Button variant="primary" fullWidth>Save reading</Button>
</Card>
```
