# A spec sheet in groups

A long list of facts reads better cut by subject. Each group is a card with its own title and its own list; the grid lays the cards side by side and stacks them on a phone. No group component to learn — the parts already exist.

## Usage

```tsx
import {Grid, Card, DataList} from "@aurea-uds/react";
```

```tsx
<Grid min="sm">
  <Card>
    <h3>Engine</h3>
    <DataList items={engine} />
  </Card>
  <Card>
    <h3>Transmission</h3>
    <DataList items={transmission} />
  </Card>
  <Card>
    <h3>Brakes</h3>
    <DataList items={brakes} />
  </Card>
</Grid>
```
