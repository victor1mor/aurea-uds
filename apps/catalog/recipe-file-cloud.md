# Files · cloud

Browse, transfer and restore files with verifiable integrity.

## Usage

```tsx
import {Card, Table, Status, Progress, Button} from "@aurea-uds/react";
```

```tsx
<Card>
  <Table caption="Files">
    <thead><tr><th>Name</th><th>Size</th><th>Integrity</th></tr></thead>
    <tbody><tr><td>tokens.json</td><td>18 KB</td>
      <td><Status variant="success">checksum ok</Status></td></tr></tbody>
  </Table>
  <Progress value={62} label="Uploading fonts.woff2" />
  <Button variant="ghost" size="sm">Pause</Button>
</Card>
```
