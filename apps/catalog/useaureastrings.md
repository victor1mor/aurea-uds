# useAureaStrings

Read the string dictionary the provider is using, to translate your own labels with it.

## Usage

```tsx
import {useAureaStrings} from "@aurea-uds/react";
```

```tsx
const s = useAureaStrings();

<p>{s.loading}</p>   // "Loading" — or your own dictionary
```
