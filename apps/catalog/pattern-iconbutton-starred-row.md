# Starred row

State that survives the click is a Toggle with only an icon: aria-pressed keeps it visible and audible.

## Usage

```tsx
import {Toggle} from "@aurea-uds/react";
```

```tsx
const [starred, setStarred] = useState(true);

<Toggle icon="star" label="Star this row" variant="ghost" pressed={starred} onPressedChange={setStarred} />
```
