# Pinned filters

Many-of-many is a ToggleGroup with multiple: each button is its own toggle, so two can be on at once.

## Usage

```tsx
import {ToggleGroup, Toggle} from "@aurea-uds/react";
```

```tsx
const [on, setOn] = useState(["starred", "shared"]);

<ToggleGroup label="Filters" multiple value={on} onValueChange={setOn}>
  <Toggle value="starred">Starred</Toggle>
  <Toggle value="archived">Archived</Toggle>
  <Toggle value="shared">Shared</Toggle>
</ToggleGroup>
```
