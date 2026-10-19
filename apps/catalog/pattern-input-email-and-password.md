# Email and password

The sign-in pair, with the autoComplete tokens the browser actually looks for.

## Usage

```tsx
import {Field, Input, Button} from "@aurea-uds/react";
```

```tsx
<Field label="Email"><Input type="email" autoComplete="email" /></Field>
<Field label="Password"><Input type="password" autoComplete="current-password" /></Field>
<Button variant="primary" type="submit" fullWidth>Sign in</Button>
```
