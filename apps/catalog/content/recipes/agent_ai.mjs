// RECEITA · Agents · AI (S-11, 05/11/2026) — o console do agente como tela de produto, na linguagem dos blocos v2 (a
// `Tela`): o cabeçalho com a trilha, o id da corrida, o estado e as ações (a destrutiva separada); no corpo, a conversa,
// o portão de aprovação e a cascata das chamadas; ao lado, as propriedades da corrida e o gasto contra o teto. Os quatro
// padrões da receita (`patterns/agent_ai.md`): RunSession (estado, cascata, ponto de retomada, recibo),
// ConversationChannel (a conversa e o campo), ResourceWorkbench (os arquivos que o agente toca) e ReviewCompare (a
// mudança antes de aprovar). Interação de verdade: aprovar, negar ou cancelar muda o estado e responde na conversa;
// mandar uma mensagem entra na conversa. O primeiro desenho (o HTML pronto) é o estado "esperando aprovação".
import {createElement as h, useState} from "react";
import * as A from "../../../../packages/react/dist/index.js";
import {Tela, Propriedades, Grupo} from "./_tela.mjs";

const CONVERSA = [
  {id: "1", author: "You", time: "09:13", direction: "outgoing", body: "Raise the contrast of the muted text in both themes."},
  {id: "2", author: "Agent", time: "09:14", avatar: {fallback: "AG"}, body: "Two files, four values. I read the tokens and drafted the change — it needs your approval to write."},
];
const PASSOS = [
  {id: "run", label: "run 184", start: 0, end: 4200},
  {id: "read", label: "read tokens", start: 120, end: 640, depth: 1, kind: "tool"},
  {id: "plan", label: "plan", start: 700, end: 2900, depth: 1, kind: "model"},
  {id: "diff", label: "diff", start: 2950, end: 3400, depth: 1, kind: "tool"},
  {id: "gate", label: "approval", start: 3400, end: 4200, depth: 1, kind: "gate"},
];
const ROTULO = {paused: "Waiting for approval", completed: "Done", idle: "Cancelled"};

function AgentConsole() {
  const [estado, setEstado] = useState("paused");
  const [decisao, setDecisao] = useState(undefined);
  const [conversa, setConversa] = useState(CONVERSA);
  const fala = (author, body, extra = {}) =>
    setConversa(xs => [...xs, {id: String(xs.length + 1), author, body, time: "09:15", ...extra}]);
  const doAgente = {avatar: {fallback: "AG"}};
  const aprovar = () => { setDecisao("approved"); setEstado("completed"); fala("Agent", "Applied to 2 files. Receipt r-184 is saved with the run.", doAgente); };
  const negar = () => { setDecisao("denied"); setEstado("idle"); fala("Agent", "Nothing was written. The run ended with a receipt that says so.", doAgente); };
  const terminou = estado !== "paused";
  return h(Tela, {icone: "robot", trilha: ["Agent runs"], id: "run_184", titulo: "Raise the muted text contrast",
    estado: h(A.AgentStatus, {state: estado, label: ROTULO[estado]}),
    propriedades: [["chat-circle", "Turn 2"], ["wrench", "3 tool calls"], ["clock", "Updated 09:14"]],
    acoes: h(A.Button, {variant: "danger-ghost", leadingIcon: "x", disabled: terminou, onClick: negar}, "Cancel run"),
    lado: [
      h(Propriedades, {key: "p", titulo: "Run", itens: [
        {term: "Agent", value: "Curator"}, {term: "Model", value: "opus-5"},
        {term: "Touches", value: "aurea.css, tokens.json"}, {term: "Resume from", value: "turn 2 · 09:13:41"}]}),
      h(A.CostMeter, {key: "c", label: "Spend this month", spent: 84.2, limit: 100, softLimit: 80, period: "November",
        segments: [{id: "i", label: "Input", amount: 31.4}, {id: "o", label: "Output", amount: 49.7}, {id: "k", label: "Cache read", amount: 3.1}]})],
    rodape: "No change is written without an approval. Cancelling also leaves a receipt."},
    h(A.Card, {variant: "outline"}, h("div", {style: {display: "grid", gap: "var(--space-4)"}},
      h(A.Text, {type: "body-xs", tone: "muted", weight: "semibold"}, "Activity"),
      h(A.MessageList, {label: "Conversation", messages: conversa}),
      h(A.MessageComposer, {label: "Message the agent", placeholder: "Ask for a change…", onSend: texto => fala("You", texto, {direction: "outgoing"})}))),
    // O portão numa caixa cinza própria: ele é um cartão, e no cartão de contorno da conversa a caixa dele sumia.
    h(Grupo, {titulo: "Approval"}, h(A.HumanApproval, {title: "Write 4 values to 2 files", risk: "medium", decision: decisao,
      description: "The agent will change the muted text colour in both themes.",
      details: [{term: "Files", value: "aurea.css, tokens.json"}, {term: "Values", value: "4"}, {term: "Scope", value: "light and dark"}],
      reasoning: "The muted text measured 4.1:1 on the page; the change brings it to 4.7:1.",
      onApprove: aprovar, onDeny: negar})),
    h(A.Card, {variant: "inset"}, h("div", {style: {display: "grid", gap: "var(--space-3)"}},
      h(A.Text, {type: "body-xs", tone: "muted", weight: "semibold"}, "Tool calls"),
      h(A.TraceTimeline, {label: "Run 184, step by step", spans: PASSOS}))));
}

export default {
  uses: ["Card", "Avatar", "Icon", "Text", "Code", "Heading", "AgentStatus", "Button", "MessageList", "MessageComposer",
    "HumanApproval", "TraceTimeline", "DataList", "CostMeter", "Separator"],
  code: `import {useState} from "react";
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
        <TraceTimeline label={\`Run \${run.id}, step by step\`} spans={spans} />
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
}`,
  render: () => h(AgentConsole),
};
