# Messaging · social

Conversations, threads and feed: presence and read are signals, not permissions.

## Usage

```tsx
import {Card, Separator, Avatar, Icon, Text, Code, Heading, Status, NotificationCenter, ListBox, DataList, MessageList, Button, MessageComposer} from "@aurea-uds/react";
```

```tsx
import {useState} from "react";
import {Button, Card, DataList, Heading, ListBox, MessageComposer, MessageList, NotificationCenter, Separator, Status} from "@aurea-uds/react";

export function Chat({channels, threads: initialThreads, mentions}) {
  const [channel, setChannel] = useState(channels[0].id);
  const [threads, setThreads] = useState(initialThreads);
  const [replyTo, setReplyTo] = useState(null);
  const send = (body) => {
    setThreads(t => ({...t, [channel]: [...t[channel], {id: crypto.randomUUID(), author: "You", direction: "outgoing", body, replyTo}]}));
    setReplyTo(null);
  };

  return (
    <Card>
      <header>
        <Heading level={3}>{channel}</Heading> <Status variant="online">4 online</Status>
        <NotificationCenter label="Mentions" items={mentions} />
      </header>
      <Separator />

      <MessageList label={`Conversation in ${channel}`} messages={threads[channel]} />
      <Button appearance="soft" tone="brand" size="sm" onClick={() => setReplyTo(threads[channel].at(-1))}>Reply</Button>
      <MessageComposer label={`Message ${channel}`} attach onSend={send} replyTo={replyTo} onCancelReply={() => setReplyTo(null)} />

      <div>
        <ListBox label="Channels" selectionMode="single" value={[channel]} onValueChange={v => v[0] && setChannel(v[0])}
          items={channels.map(c => ({id: c.id, label: c.name, description: c.unread ? `${c.unread} unread` : "all read"}))} />
        <DataList items={[{term: "Analyst", value: <Status variant="online">online</Status>}]} />
      </div>
    </Card>
  );
}
```
