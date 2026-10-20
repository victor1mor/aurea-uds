# Differences only

A switch hides the rows that are the same for every item — the page marks them <tr data-same>, and `differencesOnly` hides them. Removing what does not differ is what makes a long comparison readable.

## Usage

```tsx
import {Table, Switch, Badge} from "@aurea-uds/react";
```

```tsx
<Switch label="Differences only" checked={only} onChange={e => setOnly(e.target.checked)} />
<Table caption="Compare models" differencesOnly={only}>
  …<tr data-same><th scope="row">Fuel</th><td>Flex</td><td>Flex</td><td>Flex</td></tr>…
</Table>
```
