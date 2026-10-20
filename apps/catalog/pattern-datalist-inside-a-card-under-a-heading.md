# Inside a card, under a heading

The shape a detail panel repeats: a title that names the record and the list that describes it. The card supplies the surface; the list supplies the structure — neither tries to do the other's job.

## Usage

```tsx
import {Card, DataList, Button} from "@aurea-uds/react";
```

```tsx
<Card>
  <h3>Invoice AU-2026-0184</h3>
  <DataList items={fields} />
  <Button variant="secondary" size="sm" leadingIcon="download">Download PDF</Button>
</Card>
```
