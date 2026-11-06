// RECEITA · Projects · CRM/ERP (S-11, 05/11/2026) — o funil de vendas como tela de produto, na linguagem dos blocos v2 (a
// `Tela`): os números do trimestre, a grade dos negócios (`DataGrid`, a decisão S-02) com a etapa, o dono e o valor, e a
// escolha em lote. Interação de verdade: "New deal" abre a janela e o negócio entra na grade; escolher linhas e "Mark as
// won" muda a etapa delas; os números acompanham.
import {createElement as h, useState} from "react";
import * as A from "../../../../packages/react/dist/index.js";
import {DataGrid} from "../../../../packages/react/dist/data-grid.js";
import {Tela, Numero} from "./_tela.mjs";

const pilha = {display: "grid", gap: "var(--space-4)", minInlineSize: 0};
const numeros = {display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, calc(var(--space-24) * 2)), 1fr))", gap: "var(--space-3)"};
const TOM = {Lead: "neutral", Qualified: "info", Proposal: "violet", Negotiation: "warning", Won: "success", Lost: "danger"};
const ETAPAS = ["Lead", "Qualified", "Proposal", "Negotiation"];
const dinheiro = n => `$${(n / 1000).toFixed(1)}k`;
const negociosDe = n => `${n} deal${n === 1 ? "" : "s"}`;

const NEGOCIOS = [
  {id: "1", deal: "Acme · renewal", stage: "Negotiation", owner: "Analyst", amount: 48000, close: "Nov 28"},
  {id: "2", deal: "Globex · pilot", stage: "Proposal", owner: "Curator", amount: 22000, close: "Dec 05"},
  {id: "3", deal: "Initech · expansion", stage: "Qualified", owner: "Writer", amount: 31500, close: "Dec 12"},
  {id: "4", deal: "Umbrella · new", stage: "Lead", owner: "Planner", amount: 12000, close: "Dec 20"},
  {id: "5", deal: "Hooli · upsell", stage: "Won", owner: "Analyst", amount: 18500, close: "Nov 02"},
];
const COLUNAS = [
  {accessorKey: "deal", header: "Deal"},
  {accessorKey: "stage", header: "Stage", cell: ({getValue}) => h(A.Badge, {tone: TOM[getValue()]}, getValue())},
  {accessorKey: "owner", header: "Owner", cell: ({getValue}) => h("span", {style: {display: "inline-flex", alignItems: "center", gap: "var(--space-2)"}},
    h(A.Avatar, {size: "sm", fallback: getValue().slice(0, 2).toUpperCase()}), getValue())},
  {accessorKey: "amount", header: "Amount", cell: ({getValue}) => h(A.Text, {numeric: true}, dinheiro(getValue()))},
  {accessorKey: "close", header: "Close"},
];

function Pipeline() {
  const [negocios, setNegocios] = useState(NEGOCIOS);
  const [aberta, setAberta] = useState(false);
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState(10000);
  const [etapa, setEtapa] = useState("Lead");
  const abertos = negocios.filter(n => n.stage !== "Won" && n.stage !== "Lost");
  const ganhos = negocios.filter(n => n.stage === "Won");
  const soma = xs => xs.reduce((t, n) => t + n.amount, 0);
  const criar = () => {
    if (!nome.trim()) return;
    setNegocios(ns => [...ns, {id: String(ns.length + 1), deal: nome, stage: etapa, owner: "You", amount: valor ?? 0, close: "Dec 31"}]);
    setNome(""); setAberta(false);
  };
  const ganhar = (linhas, limpar) => {
    const ids = new Set(linhas.map(l => l.id));
    setNegocios(ns => ns.map(n => ids.has(n.id) ? {...n, stage: "Won"} : n));
    limpar();
  };
  return h(Tela, {icone: "kanban", trilha: ["Sales", "Pipelines"], id: "pl_q4", titulo: "Q4 pipeline",
    estado: h(A.Status, {variant: "info"}, "On track"),
    propriedades: [["briefcase", `${negociosDe(abertos.length)} open`], ["users", "4 owners"], ["calendar", "Closes Dec 31"]],
    acoes: h(A.Button, {variant: "primary", leadingIcon: "plus", onClick: () => setAberta(true)}, "New deal"),
    rodape: "A deal moves forward one stage at a time; won and lost deals leave the open total."},
    h("div", {style: numeros},
      h(Numero, {label: "Open pipeline", value: dinheiro(soma(abertos)), trend: negociosDe(abertos.length), direction: "flat", tone: "neutral"}),
      h(Numero, {label: "Won this quarter", value: dinheiro(soma(ganhos)), trend: negociosDe(ganhos.length), direction: "up", tone: "success"}),
      h(Numero, {label: "Win rate", value: `${Math.round(ganhos.length / negocios.length * 100)}%`, trend: "of all deals", direction: "flat", tone: "neutral"})),
    h(DataGrid, {label: "Deals", data: negocios, columns: COLUNAS, getRowId: n => n.id, filterable: true, selectable: true,
      bulkActions: [{id: "won", label: "Mark as won", icon: "check", onAction: ganhar}]}),
    h(A.Dialog, {open: aberta, onClose: () => setAberta(false), title: "New deal", size: "sm",
      footer: h("div", {style: {display: "flex", justifyContent: "flex-end", gap: "var(--space-2)"}},
        h(A.Button, {variant: "ghost", onClick: () => setAberta(false)}, "Cancel"),
        h(A.Button, {variant: "primary", onClick: criar}, "Add deal"))},
      h("div", {style: pilha},
        h(A.Field, {label: "Deal"}, h(A.Input, {value: nome, onChange: e => setNome(e.target.value), placeholder: "Company · what"})),
        h(A.NumberField, {label: "Amount", value: valor, onValueChange: setValor, min: 0, step: 500, format: {style: "currency", currency: "USD", maximumFractionDigits: 0}}),
        h(A.Field, {label: "Stage"}, h(A.Select, {items: ETAPAS.map(v => ({value: v, label: v})), value: etapa, onValueChange: setEtapa})))));
}

export default {
  uses: ["Card", "Separator", "Avatar", "Icon", "Text", "Code", "Heading", "Status", "Button", "KPI", "DataGrid", "Badge", "Dialog", "Field", "Input", "NumberField", "Select"],
  code: `import {useState} from "react";
import {Avatar, Badge, Button, Card, Dialog, Field, Heading, Input, KPI, NumberField, Select, Separator, Status, Text} from "@aurea-uds/react";
import {DataGrid} from "@aurea-uds/react/data-grid";

const tone = {Lead: "neutral", Qualified: "info", Proposal: "violet", Negotiation: "warning", Won: "success", Lost: "danger"};
const columns = [
  {accessorKey: "deal", header: "Deal"},
  {accessorKey: "stage", header: "Stage", cell: ({getValue}) => <Badge tone={tone[getValue()]}>{getValue()}</Badge>},
  {accessorKey: "owner", header: "Owner", cell: ({getValue}) => <><Avatar size="sm" fallback={getValue().slice(0, 2)} /> {getValue()}</>},
  {accessorKey: "amount", header: "Amount", cell: ({getValue}) => <Text numeric>{money(getValue())}</Text>},
  {accessorKey: "close", header: "Close"},
];

export function Pipeline({initial}) {
  const [deals, setDeals] = useState(initial);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({deal: "", amount: 10000, stage: "Lead"});
  const openDeals = deals.filter(d => d.stage !== "Won" && d.stage !== "Lost");
  const markWon = (rows, clear) => {
    const ids = new Set(rows.map(r => r.id));
    setDeals(ds => ds.map(d => ids.has(d.id) ? {...d, stage: "Won"} : d));
    clear();
  };

  return (
    <Card>
      <header>
        <Heading level={3}>Q4 pipeline</Heading> <Status variant="info">On track</Status>
        <Button variant="primary" leadingIcon="plus" onClick={() => setOpen(true)}>New deal</Button>
      </header>
      <Separator />
      <Card variant="inset">
        <KPI variant="plain" label="Open pipeline" value={money(sum(openDeals))} trend={\`\${openDeals.length} deals\`} />
      </Card>
      <DataGrid label="Deals" data={deals} columns={columns} getRowId={d => d.id} filterable selectable
        bulkActions={[{id: "won", label: "Mark as won", icon: "check", onAction: markWon}]} />
      <Dialog open={open} onClose={() => setOpen(false)} title="New deal" size="sm"
        footer={<Button variant="primary" onClick={() => { setDeals(d => [...d, {...draft, id: crypto.randomUUID()}]); setOpen(false); }}>Add deal</Button>}>
        <Field label="Deal"><Input value={draft.deal} onChange={e => setDraft({...draft, deal: e.target.value})} /></Field>
        <NumberField label="Amount" value={draft.amount} onValueChange={amount => setDraft({...draft, amount})}
          format={{style: "currency", currency: "USD", maximumFractionDigits: 0}} />
        <Field label="Stage">
          <Select items={["Lead", "Qualified", "Proposal", "Negotiation"].map(v => ({value: v, label: v}))}
            value={draft.stage} onValueChange={stage => setDraft({...draft, stage})} />
        </Field>
      </Dialog>
    </Card>
  );
}`,
  render: () => h(Pipeline),
};
