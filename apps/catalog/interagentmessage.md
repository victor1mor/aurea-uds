# InterAgentMessage

A message from one agent to another, where the direction is the data.

## Usage

```tsx
import {InterAgentMessage} from "@aurea-uds/react";
```

```tsx
<InterAgentMessage messages={[
  {id: "1", from: "Curator", to: "Writer", kind: "handoff",
   body: "Draft ready for review.", time: "10:02"},
  {id: "2", from: "Orchestrator", kind: "broadcast",
   body: "Rate limit reached, pausing.", time: "10:04"},
]} />
```

## API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `messages` | `AgentMessage[]` | — | Each entry carries from, to, body and an optional kind. Not MessageList: that one is a conversation with a person; here the handoff between two agents is what you are reading, and a list with two authors cannot say who delivered what to whom. |
| `label` | `string` | "Agent messages" | Accessible name of the list. |
| `className` | `string` | — | On the list. |
