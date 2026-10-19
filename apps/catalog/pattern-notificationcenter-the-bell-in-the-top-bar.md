# The bell in the top bar

Grouped by day, unread first, and one control that clears the badge without opening every item. The count on the trigger is the only thing most people ever read.

## Usage

```tsx
import {NotificationCenter} from "@aurea-uds/react";
```

```tsx
<NotificationCenter
  label="Notifications"
  onMarkAllRead={markAll}
  onItemClick={item => go(item.id)}
  items={[
    {id: "1", title: "Build passed", time: "2m", group: "Today"},
    {id: "2", title: "Analyst finished the sweep", time: "1h", group: "Today"},
    {id: "3", title: "New member joined", time: "2d", group: "Earlier", read: true},
  ]}
/>
```
