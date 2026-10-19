# Between two parts of the same card

The line says "the section above is finished" without spending a heading on it. Inside a card, where a heading would be too loud and blank space alone reads as an accident.

## Usage

```tsx
import {Card, Separator, DataList, Button} from "@aurea-uds/react";
```

```tsx
<Card>
  <DataList items={fields} />
  <Separator />
  <Button variant="ghost" size="sm">Edit details</Button>
</Card>
```
