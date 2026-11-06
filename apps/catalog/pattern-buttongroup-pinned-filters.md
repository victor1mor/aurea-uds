# Pinned filters

Many-of-many: each button is its own toggle, so two can be on at once.

## Usage

```tsx
import {ButtonGroup, Button} from "@aurea-uds/react";
```

```tsx
const [on, setOn] = useState({starred: true, archived: false, shared: true});
const toggle = (k) => setOn({...on, [k]: !on[k]});

<ButtonGroup label="Filters">
  <Button pressed={on.starred} onClick={() => toggle("starred")}>Starred</Button>
  <Button pressed={on.archived} onClick={() => toggle("archived")}>Archived</Button>
  <Button pressed={on.shared} onClick={() => toggle("shared")}>Shared</Button>
</ButtonGroup>
```
