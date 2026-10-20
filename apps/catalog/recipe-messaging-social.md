# Messaging · social

Conversations, threads and feed: presence and read are signals, not permissions.

## Usage

```tsx
import {Card, Status, MessageList, MessageComposer} from "@aurea-uds/react";
```

```tsx
<Card>
  <Status variant="online">Analyst is online</Status>
  <MessageList messages={messages} />
  <MessageComposer placeholder="Message the team…" onSend={send} />
</Card>
```
