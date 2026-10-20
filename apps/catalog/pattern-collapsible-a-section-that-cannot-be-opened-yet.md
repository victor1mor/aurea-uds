# A section that cannot be opened yet

`disabled` keeps the row in place while the content is unavailable, instead of removing it. A section that disappears and comes back renumbers everything around it; a section that stays says the same thing without moving anything.

## Usage

```tsx
import {Collapsible} from "@aurea-uds/react";
```

```tsx
<Collapsible trigger="Billing history" disabled>
  <p>Available once the first invoice is issued.</p>
</Collapsible>
```
