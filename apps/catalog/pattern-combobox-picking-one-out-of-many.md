# Picking one out of many

A select stops working somewhere around twenty options — the eye cannot scan them. A combobox lets the user type what they already know instead of hunting for it.

## Usage

```tsx
import {Combobox} from "@aurea-uds/react";
```

```tsx
const [zone, setZone] = useState(null);

<Combobox
  label="Time zone"
  placeholder="Start typing a city…"
  value={zone}
  onValueChange={setZone}
  items={[
    {value: "sao_paulo", label: "America/Sao_Paulo"},
    {value: "lisbon", label: "Europe/Lisbon"},
    {value: "tokyo", label: "Asia/Tokyo"},
  ]}
/>
```
