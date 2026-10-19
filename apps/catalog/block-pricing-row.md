# Pricing row

Three plans side by side, the recommended one marked by a Badge — not by a bigger box.

## Usage

```tsx
import {Card, Badge, Button, DataList} from "@aurea-uds/react";
```

```tsx
<Card>
  <div className="cluster" style={{justifyContent:"space-between"}}>
    <strong>Pro</strong><Badge variant="primary">Recommended</Badge>
  </div>
  <p><strong>$24</strong> / seat / month</p>
  <DataList items={[{term:"Seats",value:"Up to 50"},{term:"Support",value:"Priority"}]} />
  <Button variant="primary">Choose Pro</Button>
</Card>
```
