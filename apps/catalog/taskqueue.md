# TaskQueue

The work queue: what is waiting, what is running, what failed.

## Usage

```tsx
import {TaskQueue} from "@aurea-uds/react";
```

```tsx
<TaskQueue tasks={[
  {id: "1", title: "Index the archive", state: "running", progress: 0.4},
  {id: "2", title: "Rebuild the sitemap", state: "queued", priority: "high"},
]} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `tasks` | `QueueTask[]` | — | The queue. Six states and three priority steps, measured from the reference. The reference's task carries 15 fields and five of them belong to OTHER components in this same family — token and cost are ModelUsage and CostMeter, checkpoints are TraceTimeline, assignee is AgentCard. Absorbing them here would make the queue answer for four contracts and none of them properly. |
| `label` | `string` | "Task queue" | Accessible name of the list. |
| `onRetry` | `(task: QueueTask) => void` | — | Shows a retry button on failed tasks only. Without it a failure is reported and cannot be acted on. |
| `className` | `string` | — | On the list. |
