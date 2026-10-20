# A password the user can check

The reveal exists because typing a password blind is how people get locked out. The button says the action, not the state — Show password, then Hide password — so a screen reader announces what will happen.

## Usage

```tsx
import {PasswordField} from "@aurea-uds/react";
```

```tsx
<Field label="Password"><PasswordField autoComplete="current-password" /></Field>
```
