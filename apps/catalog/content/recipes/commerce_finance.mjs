// RECEITA · Commerce · finance (S-11, 05/11/2026) — o pagamento de um pedido como tela de produto, na linguagem dos blocos
// v2 (a `Tela`, e o "Transaction flow" do desenho do Victor): o valor é o título, os itens com subtotal, taxa e total, a
// linha do tempo da cobrança (`Timeline variant="latest"`), e ao lado o método e os ids. Interação de verdade: "Pay" cobra
// (o estado e a linha do tempo mudam, e o botão some — a chave do pedido impede cobrar duas vezes); depois, "Refund" pede
// confirmação e devolve.
import {createElement as h, useState} from "react";
import * as A from "../../../../packages/react/dist/index.js";
import {Tela, Propriedades} from "./_tela.mjs";

const ESTADO = {pending: ["warning", "Payment pending"], paid: ["success", "Paid"], refunded: ["info", "Refunded"]};
// O id não quebra no meio: numa coluna estreita ele desce inteiro para a linha de baixo.
const id = t => h("span", {style: {whiteSpace: "nowrap"}}, h(A.Code, null, t));
const INICIO = [{title: "Order placed", description: "3 items · web checkout", time: "09:02"}];

function Checkout() {
  const [estado, setEstado] = useState("pending");
  const [eventos, setEventos] = useState(INICIO);
  const [confirmar, setConfirmar] = useState(false);
  const soma = (titulo, descricao, hora) => setEventos(es => [{title: titulo, description: descricao, time: hora}, ...es]);
  const pagar = () => { setEstado("paid"); soma("Charged $261.60", "Visa ending 4242 · ch_7Qa2", "09:04"); soma("Receipt sent", "to curator@example.com", "09:04"); };
  const devolver = () => { setConfirmar(false); setEstado("refunded"); soma("Refunded $261.60", "back to Visa ending 4242 · in 5 to 10 days", "09:11"); };
  const [tom, rotulo] = ESTADO[estado];
  return h(Tela, {icone: "receipt", trilha: ["Orders"], id: "ord_4812", titulo: "$261.60",
    estado: h(A.Status, {variant: tom}, rotulo),
    propriedades: [["user", "Curator"], ["credit-card", "Visa ending 4242"], ["clock", "Placed 09:02"]],
    acoes: estado === "pending"
      ? h(A.Button, {variant: "primary", leadingIcon: "credit-card", onClick: pagar}, "Pay $261.60")
      : estado === "paid" ? h(A.Button, {variant: "danger-ghost", leadingIcon: "arrow-counter-clockwise", onClick: () => setConfirmar(true)}, "Refund") : null,
    lado: [
      h(Propriedades, {key: "m", titulo: "Payment method", itens: [{term: "Card", value: "Visa ending 4242"}, {term: "Expires", value: "08/29"}, {term: "Country", value: "Portugal"}]}),
      h(Propriedades, {key: "i", titulo: "References", itens: [{term: "Order", value: id("ord_4812")},
        {term: "Idempotency key", value: id("ord_4812")}, {term: "Charge", value: estado === "pending" ? "—" : id("ch_7Qa2")}]})],
    rodape: "The order id is the idempotency key: paying twice is impossible, and a refund never deletes the charge."},
    h(A.Card, {variant: "inset"}, h("div", {style: {display: "grid", gap: "var(--space-3)"}},
      h(A.Text, {type: "body-xs", tone: "muted", weight: "semibold"}, "Items"),
      h(A.DataList, {items: [
        {term: "Desk lamp × 2", value: h(A.Text, {numeric: true}, "$120.00")},
        {term: "Notebook × 4", value: h(A.Text, {numeric: true}, "$80.00")},
        {term: "Shipping", value: h(A.Text, {numeric: true}, "$40.00")},
        {term: "Tax (9%)", value: h(A.Text, {numeric: true}, "$21.60")},
        {term: h("strong", null, "Total"), value: h(A.Text, {numeric: true, weight: "bold"}, "$261.60")}]}))),
    h(A.Card, {variant: "inset"}, h("div", {style: {display: "grid", gap: "var(--space-3)"}},
      h(A.Text, {type: "body-xs", tone: "muted", weight: "semibold"}, "History"),
      h(A.Timeline, {variant: "latest", items: eventos}))),
    h(A.ConfirmDialog, {open: confirmar, title: "Refund $261.60?", destructive: true, confirmLabel: "Refund", cancelLabel: "Keep the charge",
      description: "The money goes back to Visa ending 4242. The charge and this refund both stay in the history.",
      onConfirm: devolver, onCancel: () => setConfirmar(false)}));
}

export default {
  uses: ["Card", "Separator", "Avatar", "Icon", "Text", "Code", "Heading", "Status", "Button", "DataList", "Timeline", "ConfirmDialog"],
  code: `import {useState} from "react";
import {Button, Card, Code, ConfirmDialog, DataList, Heading, Separator, Status, Text, Timeline} from "@aurea-uds/react";

export function Checkout({order}) {
  const [state, setState] = useState("pending");
  const [events, setEvents] = useState(order.events);
  const [confirm, setConfirm] = useState(false);
  const add = (title, description) => setEvents(e => [{title, description, time: now()}, ...e]);

  return (
    <Card>
      <header>
        <Code>{order.id}</Code>
        <Heading level={3}>{order.total}</Heading>
        <Status variant={state === "paid" ? "success" : "warning"}>{state === "paid" ? "Paid" : "Payment pending"}</Status>
        {state === "pending" && (
          <Button variant="primary" leadingIcon="credit-card"
            onClick={() => { setState("paid"); add(\`Charged \${order.total}\`, order.card); }}>Pay {order.total}</Button>
        )}
        {state === "paid" && <Button variant="danger-ghost" onClick={() => setConfirm(true)}>Refund</Button>}
      </header>
      <Separator />

      <Card variant="inset">
        <DataList items={order.lines.map(l => ({term: l.label, value: <Text numeric>{l.amount}</Text>}))} />
      </Card>
      <Card variant="inset">
        <Timeline variant="latest" items={events} />
      </Card>

      <aside>
        <DataList items={[{term: "Order", value: <Code>{order.id}</Code>}, {term: "Idempotency key", value: <Code>{order.id}</Code>}]} />
      </aside>

      <ConfirmDialog open={confirm} destructive title={\`Refund \${order.total}?\`} confirmLabel="Refund"
        description="The charge and this refund both stay in the history."
        onConfirm={() => { setConfirm(false); setState("refunded"); add(\`Refunded \${order.total}\`, order.card); }}
        onCancel={() => setConfirm(false)} />
    </Card>
  );
}`,
  render: () => h(Checkout),
};
