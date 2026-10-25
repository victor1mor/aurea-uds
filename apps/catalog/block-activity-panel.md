# Activity panel

Who did what, when — identity line, ordered history and the unread count in one surface.

## Usage

```tsx
import {Card, Avatar, Badge, Timeline, Button} from "@aurea-uds/react";
```

```tsx
<Card>
  <div className="cluster" style={{justifyContent:"space-between"}}>
    <strong>Activity <Badge>3</Badge></strong><Button variant="ghost" size="sm">Mark all read</Button>
  </div>
  <Timeline items={[{title:"Curator published v1.7.0",time:"09:12"}]} />
</Card>
```
