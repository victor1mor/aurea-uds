// RECEITA · Support · service (S-11, 05/11/2026) — a caixa de entrada do atendimento como tela de produto, na linguagem dos
// blocos v2 (a `Tela`): a fila escolhida, a grade dos casos (`DataGrid`, a decisão S-02) com o prazo e o estado, e o caso
// aberto numa caixa abaixo, com a conversa e as ações da fase. Interação de verdade: abrir um caso mostra a
// conversa dele; responder entra na conversa e o caso passa a "waiting on customer"; "Escalate" e "Resolve" mudam o estado.
import {createElement as h, useState} from "react";
import * as A from "../../../../packages/react/dist/index.js";
import {DataGrid} from "../../../../packages/react/dist/data-grid.js";
import {Tela, Grupo} from "./_tela.mjs";

const ESTADO = {open: ["busy", "With support"], waiting: ["away", "Waiting on customer"], escalated: ["danger", "Escalated"], resolved: ["success", "Resolved"]};
const CASOS = [
  {id: "3412", subject: "Cannot sign in", customer: "Messenger", sla: "12 min left", tone: "danger", state: "open"},
  {id: "3411", subject: "Invoice mismatch", customer: "Analyst", sla: "2 h left", tone: "warning", state: "waiting"},
  {id: "3409", subject: "Export is slow", customer: "Planner", sla: "1 day left", tone: "neutral", state: "open"},
  {id: "3402", subject: "Add a second admin", customer: "Writer", sla: "met", tone: "success", state: "resolved"},
];
const CONVERSAS = {
  "3412": [{id: "a", author: "Messenger", time: "09:02", avatar: {fallback: "ME"}, body: "The sign-in link says it expired, and I clicked it right away."}],
  "3411": [{id: "a", author: "Analyst", time: "08:40", avatar: {fallback: "AN"}, body: "October was billed for 14 seats, we have 12."},
    {id: "b", author: "You", time: "08:52", direction: "outgoing", body: "Checking the seat history now — I will reply within the hour."}],
  "3409": [{id: "a", author: "Planner", time: "Yesterday", avatar: {fallback: "PL"}, body: "The CSV export of 40k rows takes minutes."}],
  "3402": [{id: "a", author: "Writer", time: "Mon", avatar: {fallback: "WR"}, body: "Can we have two admins?"}, {id: "b", author: "You", time: "Mon", direction: "outgoing", body: "Done — Analyst is an admin now."}],
};

function Inbox() {
  const [casos, setCasos] = useState(CASOS);
  const [conversas, setConversas] = useState(CONVERSAS);
  const [aberto, setAberto] = useState("3412");
  const [fila, setFila] = useState("All");
  const mudar = (id, state) => setCasos(cs => cs.map(c => c.id === id ? {...c, state} : c));
  const responder = (id, texto) => {
    setConversas(cv => ({...cv, [id]: [...cv[id], {id: String(cv[id].length + 1), author: "You", time: "09:15", direction: "outgoing", body: texto}]}));
    mudar(id, "waiting");
  };
  const colunas = [
    {accessorKey: "subject", header: "Case", cell: ({row}) => h("span", {style: {display: "grid", justifyItems: "start"}},
      h(A.Button, {variant: "link", onClick: () => setAberto(row.original.id), "aria-pressed": aberto === row.original.id ? "true" : "false"},
        `#${row.original.id} · ${row.original.subject}`), h(A.Text, {type: "body-xs", tone: "muted"}, row.original.customer))},
    {accessorKey: "sla", header: "SLA", cell: ({row}) => h(A.Badge, {tone: row.original.state === "resolved" ? "success" : row.original.tone}, row.original.state === "resolved" ? "met" : row.original.sla)},
    {accessorKey: "state", header: "State", cell: ({getValue}) => h(A.Status, {variant: ESTADO[getValue()][0]}, ESTADO[getValue()][1])},
  ];
  const detalhe = c => h("div", {style: {display: "grid", gap: "var(--space-3)"}},
    h(A.MessageList, {label: `Case ${c.id}`, messages: conversas[c.id]}),
    c.state === "resolved" ? h(A.Text, {type: "body-sm", tone: "muted"}, "This case is resolved. A new message reopens it.")
      : h(A.MessageComposer, {label: `Reply to ${c.customer}`, placeholder: "Write a reply…", onSend: t => responder(c.id, t)}),
    h("div", {style: {display: "flex", flexWrap: "wrap", gap: "var(--space-2)", justifyContent: "flex-end"}},
      h(A.Button, {variant: "danger-ghost", disabled: c.state === "escalated" || c.state === "resolved", onClick: () => mudar(c.id, "escalated")}, "Escalate"),
      h(A.Button, {appearance: "soft", tone: "brand", leadingIcon: "check", disabled: c.state === "resolved", onClick: () => mudar(c.id, "resolved")}, "Resolve")));
  const visiveis = fila === "All" ? casos : casos.filter(c => (fila === "Open" ? c.state !== "resolved" : c.state === "resolved"));
  const abertos = casos.filter(c => c.state !== "resolved").length;
  const caso = casos.find(c => c.id === aberto);
  return h(Tela, {icone: "headset", trilha: ["Support", "Queues"], id: "q_billing", titulo: "Inbox",
    estado: h(A.Status, {variant: abertos > 2 ? "warning" : "success"}, `${abertos} open`),
    propriedades: [["timer", "First reply under 1 h"], ["users", "3 agents online"], ["tray", `${casos.length} cases`]],
    rodape: "The SLA clock is always visible, and a resolved case keeps its whole conversation."},
    h(A.SegmentedControl, {label: "Queue", value: fila, onChange: setFila, items: ["All", "Open", "Resolved"].map(v => ({value: v, label: v}))}),
    h(DataGrid, {label: "Cases", data: visiveis, columns: colunas, getRowId: c => c.id, filterable: true}),
    // O caso aberto numa caixa ABAIXO da grade, e não ao lado da linha (o detalhe lado a lado da grade passava 16 da coluna a
    // 768 — achado pela medição de 05/11/2026).
    caso ? h(Grupo, {titulo: `Case #${caso.id} · ${caso.subject}`, contorno: true}, detalhe(caso)) : null);
}

export default {
  uses: ["Card", "Separator", "Avatar", "Icon", "Text", "Code", "Heading", "Status", "SegmentedControl", "DataGrid", "Badge", "MessageList", "MessageComposer", "Button"],
  code: `import {useState} from "react";
import {Badge, Button, Card, Heading, MessageComposer, MessageList, SegmentedControl, Separator, Status, Text} from "@aurea-uds/react";
import {DataGrid} from "@aurea-uds/react/data-grid";

export function Inbox({initialCases, initialThreads}) {
  const [cases, setCases] = useState(initialCases);
  const [threads, setThreads] = useState(initialThreads);
  const [openId, setOpenId] = useState(initialCases[0].id);
  const current = cases.find(c => c.id === openId);
  const setState = (id, state) => setCases(cs => cs.map(c => c.id === id ? {...c, state} : c));
  const reply = (id, body) => {
    setThreads(t => ({...t, [id]: [...t[id], {id: crypto.randomUUID(), author: "You", direction: "outgoing", body}]}));
    setState(id, "waiting");
  };

  return (
    <Card>
      <header><Heading level={3}>Inbox</Heading> <Status variant="warning">3 open</Status></header>
      <Separator />
      <SegmentedControl label="Queue" items={[{value: "All", label: "All"}, {value: "Open", label: "Open"}]} />
      <DataGrid
        label="Cases" data={cases} getRowId={c => c.id} filterable
        columns={[
          {accessorKey: "subject", header: "Case", cell: ({row}) => (
            <Button variant="link" onClick={() => setOpenId(row.original.id)}>{row.original.subject}</Button>
          )},
          {accessorKey: "sla", header: "SLA", cell: ({row}) => <Badge tone={row.original.tone}>{row.original.sla}</Badge>},
          {accessorKey: "state", header: "State", cell: ({getValue}) => <Status variant={variant[getValue()]}>{label[getValue()]}</Status>},
        ]}
      />
      <Card variant="outline">
        <MessageList label={\`Case \${current.id}\`} messages={threads[current.id]} />
        <MessageComposer label={\`Reply to \${current.customer}\`} onSend={text => reply(current.id, text)} />
        <Button variant="danger-ghost" onClick={() => setState(current.id, "escalated")}>Escalate</Button>
        <Button appearance="soft" tone="brand" leadingIcon="check" onClick={() => setState(current.id, "resolved")}>Resolve</Button>
      </Card>
    </Card>
  );
}`,
  render: () => h(Inbox),
};
