// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import {MessageList} from "../../../../packages/react/dist/index.js";

export default [
  {
    variant: "Conversation",
    name: "A thread between a person and an agent",
    description: "Author, time and body, with the delivery state on the message that has one. The list is a log: it does not reorder, and a failed message stays where it was written so the retry lands in context.",
    uses: ["MessageList"],
    code: `<MessageList label="Conversation" messages={[
  {id: "1", author: "Analyst", time: "09:12", body: "The sweep is green.", avatar: {fallback: "AN"}},
  {id: "2", author: "You", time: "09:14", body: "Ship it.",
   status: {label: "sent", variant: "success"}},
  {id: "3", author: "You", time: "09:15", body: "And tag the release.",
   status: {label: "failed", variant: "danger"}},
]} />`,
    render: () => h("div", {style: {width: "min(520px,100%)"}}, h(MessageList, {
      label: "Conversation", messages: [
        {id: "1", author: "Analyst", time: "09:12", body: "The sweep is green.", avatar: {fallback: "AN"}},
        {id: "2", author: "You", time: "09:14", body: "Ship it.", status: {label: "sent", variant: "success"}},
        {id: "3", author: "You", time: "09:15", body: "And tag the release.", status: {label: "failed", variant: "danger"}},
      ]})),
  },
];
