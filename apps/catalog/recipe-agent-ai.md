# Agents · AI

Agent console: conversation, runs with tool calls, explicit approval and an auditable receipt.

## Usage

```tsx
import {Card, MessageList, Timeline, Alert, Button} from "@aurea-uds/react";
```

```tsx
<Card>
  <MessageList messages={turns} />
  <Timeline items={[
    {title: "read_file · tokens.json", description: "18 KB", time: "09:14:03"},
    {title: "write_file · aurea.css", description: "awaiting approval", time: "09:14:05"},
  ]} />
  <Alert variant="warning" title="Approval required">This run writes to the repository.</Alert>
  <Button variant="ghost">Reject</Button>
  <Button variant="primary">Approve</Button>
</Card>
```
