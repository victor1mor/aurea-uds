# A thread between a person and an agent

Author, time and body, with the delivery state on the message that has one. The list is a log: it does not reorder, and a failed message stays where it was written so the retry lands in context.

## Usage

```tsx
import {MessageList} from "@aurea-uds/react";
```

```tsx
<MessageList label="Conversation" messages={[
  {id: "1", author: "Analyst", time: "09:12", body: "The sweep is green.", avatar: {fallback: "AN"}},
  {id: "2", author: "You", time: "09:14", body: "Ship it.",
   status: {label: "sent", variant: "success"}},
  {id: "3", author: "You", time: "09:15", body: "And tag the release.",
   status: {label: "failed", variant: "danger"}},
]} />
```
