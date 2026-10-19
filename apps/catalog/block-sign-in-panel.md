# Sign-in panel

Card with credentials, an inline error slot and one primary action. No password is ever pre-filled.

## Usage

```tsx
import {Card, Field, Input, Button, Banner, Checkbox} from "@aurea-uds/react";
```

```tsx
<Card>
  <Banner variant="danger" title="Wrong credentials">Check both fields.</Banner>
  <Field label="Email"><Input type="email" autoComplete="email" /></Field>
  <Field label="Password"><Input type="password" autoComplete="current-password" /></Field>
  <Checkbox label="Keep me signed in" />
  <Button variant="primary" type="submit">Sign in</Button>
</Card>
```
