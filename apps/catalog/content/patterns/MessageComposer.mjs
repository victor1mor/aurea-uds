// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import {MessageComposer} from "../../../../packages/react/dist/index.js";

export default [
  {
    variant: "Chat",
    name: "The line you type into",
    description: "One field and one send. The icon is optional and the field does not reserve space for one that is not there — a defect this component actually shipped with, and the reason the InputGroup exists.",
    uses: ["MessageComposer"],
    code: `<MessageComposer
  label="Message"
  placeholder="Message the team…"
  sendLabel="Send"
  onSend={text => post(text)}
/>`,
    render: () => h("div", {style: {width: "min(520px,100%)"}}, h(MessageComposer, {
      label: "Message", placeholder: "Message the team…", sendLabel: "Send", onSend: () => {}})),
  },
  {
    variant: "Chat",
    name: "Disabled while the answer is being written",
    description: "Sending twice is the mistake to prevent. Disabling the composer says the turn is not yours yet, which is clearer than a spinner somewhere else on the screen.",
    uses: ["MessageComposer"],
    code: `<MessageComposer disabled={pending} placeholder="Waiting for a reply…" onSend={post} />`,
    render: () => h("div", {style: {width: "min(520px,100%)"}}, h(MessageComposer, {
      disabled: true, label: "Message", placeholder: "Waiting for a reply…", onSend: () => {}})),
  },
];
