# NotificationCenter

Inbox surface aggregating notifications.

## Usage

```tsx
import {NotificationCenter} from "@aurea-uds/react";
```

```tsx
<NotificationCenter
  onMarkAllRead={markAll}
  items={[
    {id: "1", title: "Build passed", time: "2m", group: "Today"},
    {id: "2", title: "New member", time: "1h", group: "Today", read: true},
  ]}
/>
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `NotificationItem[]` | — | The feed, as data: {id, title, description?, time?, icon?, read?, group?, onClick?}. Read and unread are yours — the panel is presentational. So is the order: groups are formed in order of first appearance and never re-sorted. |
| `onItemClick` | `(item: NotificationItem) => void` | — | Fires for every item. An item that has neither this nor its own onClick renders as a <div>, not a button — nothing that does nothing is focusable. |
| `onMarkAllRead` | `() => void` | — | Draws the mark-all action, and only while something is unread. |
| `label` | `string` | "Notifications" | Accessible name of the trigger and of the panel. The unread count is appended to the trigger's name, so it is heard and not only seen. |
| `icon` | `IconName` | notification | Glyph on the trigger. |
| `side` | `top \| right \| bottom \| left` | bottom | Which side the panel opens on. It flips on its own when there is no room. |
