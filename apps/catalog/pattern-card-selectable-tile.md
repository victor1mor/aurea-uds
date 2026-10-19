# Selectable tile

A card that is a target. The interactive variant carries the hover and the focus ring — and it requires `render`, because only the caller knows whether the tile is an action (<button>) or a link (<a href>).

## Usage

```tsx
import {Card, Status} from "@aurea-uds/react";
```

```tsx
<Card variant="interactive" render={<button type="button" />}>
  <strong>Production</strong>
  <Status variant="online">healthy</Status>
</Card>
```
