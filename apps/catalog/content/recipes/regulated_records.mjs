// RECEITA · Regulated records (S-11, 05/11/2026) — um registro regulado como tela de produto, na linguagem dos blocos v2 (a
// `Tela`): os dados e o consentimento, as abas com a trilha de auditoria (`Timeline`) e quem pode o quê, e a ação
// destrutiva separada, que pede a confirmação escrita. Interação de verdade: "Delete record" abre a janela; só com o
// "I understand" marcado ela apaga; o registro vira "Deleted" e a própria exclusão entra na trilha — que nunca se apaga.
import {createElement as h, useState} from "react";
import * as A from "../../../../packages/react/dist/index.js";
import {Tela, Propriedades} from "./_tela.mjs";

const pilha = {display: "grid", gap: "var(--space-4)", minInlineSize: 0};
const TRILHA = [
  {title: "Viewed by Curator", description: "reason: quarterly review", time: "09:14"},
  {title: "Consent renewed", description: "signed by the record holder", time: "Mar 12"},
  {title: "Record created", description: "by Analyst · import batch 88", time: "Jan 03"},
];

function Record() {
  const [apagado, setApagado] = useState(false);
  const [aberta, setAberta] = useState(false);
  const [entendi, setEntendi] = useState(false);
  const [trilha, setTrilha] = useState(TRILHA);
  const [aba, setAba] = useState("details");
  const apagar = () => {
    setApagado(true); setAberta(false); setAba("audit");
    setTrilha(t => [{title: "Record deleted by you", description: "the content is gone; this entry stays for 7 years", time: "09:16"}, ...t]);
  };
  return h(Tela, {icone: "identification-card", trilha: ["Records", "Customers"], id: "rec_2207", titulo: "Messenger Ltd.",
    estado: apagado ? h(A.Status, {variant: "danger"}, "Deleted") : h(A.Status, {variant: "success"}, "Retention active"),
    propriedades: [["shield-check", "Consent given Mar 12"], ["hourglass", "Kept 7 years"], ["lock-key", "Restricted"]],
    acoes: h(A.Button, {variant: "danger-ghost", leadingIcon: "trash", disabled: apagado, onClick: () => { setEntendi(false); setAberta(true); }}, "Delete record"),
    lado: h(Propriedades, {titulo: "Retention", itens: [{term: "Policy", value: "Contracts, 7 years"}, {term: "Ends", value: "Jan 2033"},
      {term: "Last access", value: "Curator · 09:14"}]}),
    rodape: "Every read and every change is logged with a name and a reason. The log outlives the record."},
    apagado ? h(A.Banner, {variant: "danger", title: "This record was deleted"}, "Its content is gone. The audit log below keeps the fact, the time and who did it.") : null,
    h(A.Tabs, {label: "Record", value: aba, onChange: setAba, panel: "plain", tabs: [
      {id: "details", label: "Details", content: apagado ? h(A.EmptyState, {icon: "trash", title: "Nothing to show", description: "The record's content was deleted."})
        : h(A.Card, {variant: "inset"}, h(A.DataList, {items: [{term: "Legal name", value: "Messenger Ltd."}, {term: "Tax id", value: h(A.Code, null, "PT 509 112 004")},
          {term: "Contact", value: "messenger@example.com"}, {term: "Consent", value: "Given Mar 12, 2026 · marketing off"}]}))},
      {id: "audit", label: `Audit log (${trilha.length})`, content: h(A.Card, {variant: "inset"}, h(A.Timeline, {items: trilha}))},
      {id: "access", label: "Access", content: h(A.Card, {variant: "inset"}, h(A.DataList, {items: [{term: "Analyst", value: "Edit"},
        {term: "Curator", value: "Read, with a reason"}, {term: "Everyone else", value: "No access"}]}))}]}),
    h(A.Dialog, {open: aberta, onClose: () => setAberta(false), title: "Delete this record?", size: "sm", icon: "warning", iconTone: "danger",
      footer: h("div", {style: {display: "flex", justifyContent: "flex-end", gap: "var(--space-2)"}},
        h(A.Button, {variant: "ghost", onClick: () => setAberta(false)}, "Keep it"),
        h(A.Button, {variant: "danger", disabled: !entendi, onClick: apagar}, "Delete record"))},
      h("div", {style: pilha},
        h(A.Text, null, "Deleting breaks the retention chain before its end. It cannot be undone, and it is logged with your name."),
        h(A.Checkbox, {label: "I understand the consequence", checked: entendi, onChange: e => setEntendi(e.target.checked)}))));
}

export default {
  uses: ["Card", "Separator", "Avatar", "Icon", "Text", "Code", "Heading", "Status", "Button", "Banner", "Tabs", "DataList", "Timeline", "EmptyState", "Dialog", "Checkbox"],
  code: `import {useState} from "react";
import {Banner, Button, Card, Checkbox, DataList, Dialog, Heading, Separator, Status, Tabs, Text, Timeline} from "@aurea-uds/react";

export function Record({record}) {
  const [deleted, setDeleted] = useState(false);
  const [open, setOpen] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const [log, setLog] = useState(record.log);
  const remove = () => {
    setDeleted(true); setOpen(false);
    setLog(l => [{title: "Record deleted by you", description: "this entry stays for 7 years", time: now()}, ...l]);
  };

  return (
    <Card>
      <header>
        <Heading level={3}>{record.name}</Heading>
        <Status variant={deleted ? "danger" : "success"}>{deleted ? "Deleted" : "Retention active"}</Status>
        <Button variant="danger-ghost" leadingIcon="trash" disabled={deleted} onClick={() => setOpen(true)}>Delete record</Button>
      </header>
      <Separator />
      {deleted && <Banner variant="danger" title="This record was deleted">The audit log keeps the fact.</Banner>}
      <Tabs label="Record" panel="plain" tabs={[
        {id: "details", label: "Details", content: <DataList items={record.fields} />},
        {id: "audit", label: "Audit log", content: <Timeline items={log} />},
      ]} />
      <Dialog open={open} onClose={() => setOpen(false)} title="Delete this record?" icon="warning" iconTone="danger"
        footer={<Button variant="danger" disabled={!understood} onClick={remove}>Delete record</Button>}>
        <Text>It cannot be undone, and it is logged with your name.</Text>
        <Checkbox label="I understand the consequence" checked={understood} onChange={e => setUnderstood(e.target.checked)} />
      </Dialog>
    </Card>
  );
}`,
  render: () => h(Record),
};
