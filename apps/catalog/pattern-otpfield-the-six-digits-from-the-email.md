# The six digits from the email

One box per character, and paste fills all of them — because nobody types a code they can copy. Masking is for a secret; a verification code is not one, and hiding it only makes it harder to check.

## Usage

```tsx
import {OTPField} from "@aurea-uds/react";
```

```tsx
<OTPField label="Verification code" length={6} onValueChange={check} />
```
