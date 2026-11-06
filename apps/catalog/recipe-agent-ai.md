# Agents · AI

Agent console: conversation, runs with tool calls, explicit approval and an auditable receipt.

## Usage

```tsx
import {Card, Avatar, Icon, Text, Code, Heading, AgentStatus, Button, MessageList, MessageComposer, HumanApproval, TraceTimeline, DataList, CostMeter, Separator} from "@aurea-uds/react";
```

```tsx
import {useState} from "react";
import {AgentStatus, Avatar, Button, Card, Code, CostMeter, DataList, Heading, HumanApproval, Icon, MessageComposer,
  MessageList, Separator, Text, TraceTimeline} from "@aurea-uds/react";

export function AgentConsole({run, turns, spans, spend}) {
  const [state, setState] = useState("paused");
  const [decision, setDecision] = useState();
  const [messages, setMessages] = useState(turns);
  const say = (author, body) => setMessages(m => [...m, {id: String(m.length + 1), author, body}]);
  const deny = () => { setDecision("denied"); setState("idle"); };

  return (
    <Card>
      <header>
        <Avatar size="lg" tone="brand" emphasis="soft" fallback={<Icon name="robot" />} />
        <Text type="body-xs" tone="muted">Agent runs</Text> <Code>{run.id}</Code>
        <Heading level={3}>{run.title}</Heading>
        <AgentStatus state={state} />
        <Button variant="danger-ghost" leadingIcon="x" disabled={state !== "paused"} onClick={deny}>Cancel run</Button>
      </header>
      <Separator />

      <Card variant="outline">
        <MessageList label="Conversation" messages={messages} />
        <MessageComposer label="Message the agent" onSend={text => say("You", text)} />
      </Card>
      <Card variant="inset">
        <HumanApproval
          title="Write 4 values to 2 files"
          risk="medium"
          decision={decision}
          details={[{term: "Files", value: "aurea.css, tokens.json"}, {term: "Values", value: "4"}]}
          onApprove={() => { setDecision("approved"); setState("completed"); }}
          onDeny={deny}
        />
      </Card>
      <Card variant="inset">
        <TraceTimeline label={`Run ${run.id}, step by step`} spans={spans} />
      </Card>

      <div>
        <DataList items={[{term: "Agent", value: run.agent}, {term: "Resume from", value: run.checkpoint}]} />
        <Separator />
        <CostMeter label="Spend this month" spent={spend.total} limit={100} softLimit={80} segments={spend.segments} />
      </div>

      <Separator />

      <footer>
        <Text type="body-sm" tone="muted">No change is written without an approval. Cancelling also leaves a receipt.</Text>
      </footer>
    </Card>
  );
}
```
