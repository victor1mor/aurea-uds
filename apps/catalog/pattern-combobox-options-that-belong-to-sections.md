# Options that belong to sections

A flat list of forty time zones is a wall; the same forty under continents is a map. Pass groups — `{label, items}` — in the same `items` prop, and the engine's filter runs inside each section, dropping a section that has nothing left to show. `empty` writes what appears when nothing matches, which is where a list stops saying No results and starts saying what the user can do about it.

## Usage

```tsx
import {Combobox} from "@aurea-uds/react";
```

```tsx
<Combobox
  label="Time zone"
  placeholder="Start typing a city…"
  empty="No zone by that name — try the city, not the country."
  value={zone}
  onValueChange={setZone}
  items={[
    {label: "Americas", items: [
      {value: "sao_paulo", label: "America/Sao_Paulo"},
      {value: "new_york", label: "America/New_York"},
    ]},
    {label: "Europe", items: [
      {value: "lisbon", label: "Europe/Lisbon"},
      {value: "berlin", label: "Europe/Berlin"},
    ]},
  ]}
/>
```
