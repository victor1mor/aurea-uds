# EventStream

What happened, in order, live.

## Usage

```tsx
import {EventStream} from "@aurea-uds/react";
```

```tsx
<EventStream events={[
  {id: "1", title: "Run started", time: "10:02", group: "Today"},
  {id: "2", title: "Tool denied", time: "10:04", severity: "danger"},
]} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `events` | `StreamEvent[]` | — | Consecutive events sharing a `group` are rendered under one heading. This is NOT LogStream, and the difference is the ROLE, not the look: `role="log"` is for text output that piles up; an event has structure — title, time, severity — so it is `role="feed"`. |
| `follow` | `boolean` | false | Scrolls to the newest event. Opt-in, and deliberately so: without it whoever is reading the top misses what arrives, but WITH it and no control, whoever is reading the middle gets dragged down. |
| `label` | `string` | "Events" | Accessible name of the feed. |
| `className` | `string` | — | On the feed. |
