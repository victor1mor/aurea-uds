// RECEITA · Messaging · social (S-11, 05/11/2026) — a conversa de uma equipe como tela de produto, na linguagem dos blocos
// v2 (a `Tela`): os canais com as não lidas (`ListBox`), a conversa (`MessageList`), o campo que anexa e responde
// (`MessageComposer`), quem está por aqui (`Status`), e as menções que chegam (`NotificationCenter`). Interação de verdade:
// trocar de canal troca a conversa e zera as não lidas dele; mandar uma mensagem entra na conversa; "Reply" cita uma
// mensagem no campo; marcar as menções como lidas.
import {createElement as h, useState} from "react";
import * as A from "../../../../packages/react/dist/index.js";
import {Tela, Propriedades, Grupo} from "./_tela.mjs";

const CANAIS = [{id: "design", nome: "#design", nao: 0}, {id: "release", nome: "#release", nao: 3}, {id: "random", nome: "#random", nao: 1}];
const CONVERSAS = {
  design: [{id: "1", author: "Analyst", time: "09:12", avatar: {fallback: "AN"}, body: "The sweep is green on all three browsers."},
    {id: "2", author: "You", time: "09:14", direction: "outgoing", body: "Shipping it.", status: {label: "read", variant: "success"}}],
  release: [{id: "1", author: "Curator", time: "08:40", avatar: {fallback: "CU"}, body: "0.55 notes are drafted."},
    {id: "2", author: "Writer", time: "08:52", avatar: {fallback: "WR"}, body: "I can review them at ten."},
    {id: "3", author: "Curator", time: "09:01", avatar: {fallback: "CU"}, body: "@you can you check the native screenshots?"}],
  random: [{id: "1", author: "Planner", time: "Yesterday", avatar: {fallback: "PL"}, body: "Coffee machine is fixed."}],
};
const MENCOES = [{id: "m1", title: "Curator mentioned you in #release", time: "09:01", group: "Today"},
  {id: "m2", title: "Analyst reacted to your message", time: "08:30", group: "Today", read: true}];

function Chat() {
  const [canal, setCanal] = useState("design");
  const [canais, setCanais] = useState(CANAIS);
  const [conversas, setConversas] = useState(CONVERSAS);
  const [citada, setCitada] = useState(null);
  const [mencoes, setMencoes] = useState(MENCOES);
  const abrir = id => { setCanal(id); setCitada(null); setCanais(cs => cs.map(c => c.id === id ? {...c, nao: 0} : c)); };
  const mandar = texto => {
    setConversas(cv => ({...cv, [canal]: [...cv[canal], {id: String(cv[canal].length + 1), author: "You", time: "09:20", direction: "outgoing", body: texto,
      ...(citada ? {replyTo: {id: citada.id, author: citada.author, body: citada.body}} : {}), status: {label: "sent", variant: "neutral"}}]}));
    setCitada(null);
  };
  const ultima = conversas[canal].filter(m => m.direction !== "outgoing").at(-1);
  const atual = canais.find(c => c.id === canal);
  return h(Tela, {icone: "chats-circle", trilha: ["Acme", "Channels"], id: atual.nome, titulo: atual.nome.slice(1),
    estado: h(A.Status, {variant: "online"}, "4 online"),
    propriedades: [["users", "12 members"], ["bell-ringing", (n => `${n} unread mention${n === 1 ? "" : "s"}`)(mencoes.filter(m => !m.read).length)], ["clock", "Quiet hours 22:00–07:00"]],
    acoes: h(A.NotificationCenter, {label: "Mentions", items: mencoes, onMarkAllRead: () => setMencoes(ms => ms.map(m => ({...m, read: true}))),
      onItemClick: item => { if (item.id === "m1") abrir("release"); setMencoes(ms => ms.map(m => m.id === item.id ? {...m, read: true} : m)); }}),
    lado: [
      h(Grupo, {key: "c", titulo: "Channels"}, h(A.ListBox, {label: "Channels", selectionMode: "single", value: [canal], onValueChange: v => v[0] && abrir(v[0]),
        items: canais.map(c => ({id: c.id, label: c.nome, description: c.nao ? `${c.nao} unread` : "all read"}))})),
      h(Propriedades, {key: "p", titulo: "Here now", itens: [{term: "Analyst", value: h(A.Status, {variant: "online"}, "online")},
        {term: "Curator", value: h(A.Status, {variant: "busy"}, "in a call")}, {term: "Writer", value: h(A.Status, {variant: "away"}, "away")}]})],
    rodape: "A new message is announced once, off-screen; the conversation stays readable when the connection drops."},
    h(Grupo, {titulo: `Conversation in ${atual.nome}`, contorno: true},
      h(A.MessageList, {label: `Conversation in ${atual.nome}`, messages: conversas[canal]}),
      ultima ? h("div", null, h(A.Button, {appearance: "soft", tone: "brand", size: "sm", leadingIcon: "arrow-bend-up-left", onClick: () => setCitada(ultima)}, `Reply to ${ultima.author}`)) : null,
      h(A.MessageComposer, {label: `Message ${atual.nome}`, placeholder: `Message ${atual.nome}…`, attach: true, onSend: mandar,
        replyTo: citada ? {id: citada.id, author: citada.author, body: citada.body} : null, onCancelReply: () => setCitada(null)})));
}

export default {
  uses: ["Card", "Separator", "Avatar", "Icon", "Text", "Code", "Heading", "Status", "NotificationCenter", "ListBox", "DataList", "MessageList", "Button", "MessageComposer"],
  code: `import {useState} from "react";
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

      <MessageList label={\`Conversation in \${channel}\`} messages={threads[channel]} />
      <Button appearance="soft" tone="brand" size="sm" onClick={() => setReplyTo(threads[channel].at(-1))}>Reply</Button>
      <MessageComposer label={\`Message \${channel}\`} attach onSend={send} replyTo={replyTo} onCancelReply={() => setReplyTo(null)} />

      <div>
        <ListBox label="Channels" selectionMode="single" value={[channel]} onValueChange={v => v[0] && setChannel(v[0])}
          items={channels.map(c => ({id: c.id, label: c.name, description: c.unread ? \`\${c.unread} unread\` : "all read"}))} />
        <DataList items={[{term: "Analyst", value: <Status variant="online">online</Status>}]} />
      </div>
    </Card>
  );
}`,
  render: () => h(Chat),
};
