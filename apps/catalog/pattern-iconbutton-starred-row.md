# Starred row

State that survives the click: aria-pressed keeps it visible and audible.

## Usage

```tsx
import {IconButton} from "@aurea-uds/react";
```

```tsx
const [starred, setStarred] = useState(true);

<IconButton icon="star" label="Star this row" pressed={starred} onClick={() => setStarred(!starred)} />
```
