# Pinned filter

A filter that stays on is a Toggle: it keeps the state, and aria-pressed keeps it visible and audible after the click.

## Usage

```tsx
import {Toggle} from "@aurea-uds/react";
```

```tsx
const [starred, setStarred] = useState(true);
const [archived, setArchived] = useState(false);

<Toggle pressed={starred} onPressedChange={setStarred} icon="star">Starred</Toggle>
<Toggle pressed={archived} onPressedChange={setArchived}>Archived</Toggle>
```
