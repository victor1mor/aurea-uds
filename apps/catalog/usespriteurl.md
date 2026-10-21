# useSpriteUrl

Read where the provider is loading icon glyphs from.

## Usage

```tsx
import {useSpriteUrl} from "@aurea-uds/react";
```

```tsx
const url = useSpriteUrl();

<svg><use href={`${url}#i-caret-down`} /></svg>
```
