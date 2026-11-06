# Pinned filter

A filter that stays on: aria-pressed keeps the state visible and audible after the click.

## Usage

```tsx
import {Button} from "@aurea-uds/react";
```

```tsx
const [starred, setStarred] = useState(true);
const [archived, setArchived] = useState(false);

<Button pressed={starred} onClick={() => setStarred(!starred)} leadingIcon="star">Starred</Button>
<Button pressed={archived} onClick={() => setArchived(!archived)}>Archived</Button>
```
