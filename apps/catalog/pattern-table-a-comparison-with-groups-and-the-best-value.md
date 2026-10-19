# A comparison with groups and the best value

Items are columns, specs are rows. Each group of rows is a <tbody> that opens with a band; each row is named by a <th scope="row">. The name column stays put when the table scrolls sideways, and the header stays at the top of the box when it scrolls down. The best value is bold and also says so in text — a Badge, because colour alone tells nothing to someone who cannot see it.

## Usage

```tsx
import {Table, Badge} from "@aurea-uds/react";
```

```tsx
<Table caption="Compare models" stickyHeader stickyFirstColumn>
  <thead><tr><th scope="col">Spec</th><th scope="col">Model A</th>…</tr></thead>
  <tbody>
    <tr><th scope="rowgroup" colSpan={4}>Engine</th></tr>
    <tr>
      <th scope="row">Power</th>
      <td>120 hp</td>
      <td data-best>150 hp <Badge>Best</Badge></td>
      <td>110 hp</td>
    </tr>
  </tbody>
</Table>
```
