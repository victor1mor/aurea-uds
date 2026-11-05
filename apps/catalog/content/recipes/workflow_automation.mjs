// RECEITA · Automation · workflow (S-11, 05/11/2026) — uma automação como tela de produto, na linguagem dos blocos v2 (a
// `Tela`, e o "Visual builder" do desenho do Victor): o fluxo desenhado (`DependencyGraph`, de cima para baixo), o
// inspetor do passo escolhido na coluna, e a última execução em linhas (`LogStream`). Interação de verdade: escolher um
// passo no fluxo troca o inspetor; ligar e desligar a automação; "Run now" roda, e cada passo entra no registro.
import {createElement as h, useState} from "react";
import * as A from "../../../../packages/react/dist/index.js";
import {DependencyGraph} from "../../../../packages/react/dist/graph.js";
import {Tela, Propriedades, Grupo} from "./_tela.mjs";

const PASSOS = [
  {id: "hook", label: "Webhook", kind: "trigger", detail: "POST /hooks/invoices", saida: "payload received"},
  {id: "map", label: "Map fields", kind: "transform", detail: "12 fields → 9 fields", saida: "owner missing, default used"},
  {id: "check", label: "Amount over $5k?", kind: "condition", detail: "amount > 5000", saida: "no — straight to create"},
  {id: "create", label: "Create invoice", kind: "action", detail: "billing.create_invoice", saida: "inv_9921 created"},
  {id: "notify", label: "Notify the team", kind: "action", detail: "#billing channel", saida: "message sent"},
];
const LIGACOES = [{from: "hook", to: "map"}, {from: "map", to: "check"}, {from: "check", to: "create"}, {from: "create", to: "notify"}];
const ANTES = [{time: "08:14:02", text: "run 183 started by webhook"}, {time: "08:14:04", text: "run 183 finished · 5 steps · 2.1 s"}];

function Automation() {
  const [escolhido, setEscolhido] = useState("map");
  const [ligada, setLigada] = useState(true);
  const [linhas, setLinhas] = useState(ANTES);
  const [rodando, setRodando] = useState(false);
  const passo = PASSOS.find(p => p.id === escolhido) || PASSOS[0];
  const rodar = () => {
    setRodando(true);
    const novas = [{time: "09:20:00", text: "run 184 started by you"},
      ...PASSOS.map((p, n) => ({time: `09:20:0${n + 1}`, level: p.id === "map" ? "warn" : undefined, text: `${p.label} · ${p.saida}`})),
      {time: "09:20:06", text: "run 184 finished · 5 steps · 2.3 s"}];
    setLinhas(ls => [...ls, ...novas]); setRodando(false);
  };
  return h(Tela, {icone: "flow-arrow", trilha: ["Automations"], id: "flow_invoices", titulo: "Invoice sync",
    estado: h(A.Status, {variant: ligada ? "success" : "neutral"}, ligada ? "On" : "Off"),
    propriedades: [["lightning", "On new invoice webhook"], ["clock", "Last run 08:14"], ["check", "183 runs, 2 failed"]],
    acoes: [
      h(A.Switch, {key: "s", label: "Enabled", checked: ligada, onChange: e => setLigada(e.target.checked)}),
      h(A.Button, {key: "r", variant: "primary", leadingIcon: "play", disabled: !ligada || rodando, onClick: rodar}, "Run now")],
    lado: [
      h(Propriedades, {key: "p", titulo: "Selected step", itens: [{term: "Step", value: passo.label}, {term: "Kind", value: passo.kind},
        {term: "Does", value: passo.detail}, {term: "Last result", value: passo.saida}]})],
    rodape: "Every step can be reached from the list too: the flow is a picture of the order, not the only way in."},
    h(Grupo, {titulo: "Flow"}, h(DependencyGraph, {label: "Invoice sync, step by step", orientation: "vertical", height: "24rem",
      nodes: PASSOS.map(({id, label, kind}) => ({id, label, kind})), edges: LIGACOES, selectedId: escolhido, onSelect: id => id && setEscolhido(id)})),
    h(Grupo, {titulo: "Runs", contorno: true}, h(A.LogStream, {lines: linhas})),
    // As variáveis no corpo, que é largo (na coluna, o selo do segredo passava 30 da borda — o Victor achou, 05/11/2026).
    h(Grupo, {titulo: "Variables"}, h(A.DataList, {items: [{term: "BILLING_URL", value: h(A.Code, null, "billing.example.com")},
      {term: "BILLING_TOKEN", value: h(A.Badge, {tone: "info"}, "secret · never shown")}]})));
}

export default {
  uses: ["Card", "Separator", "Avatar", "Icon", "Text", "Code", "Heading", "Status", "Switch", "Button", "DependencyGraph", "DataList", "Badge", "LogStream"],
  code: `import {useState} from "react";
import {Button, Card, Code, DataList, Heading, LogStream, Separator, Status, Switch} from "@aurea-uds/react";
import {DependencyGraph} from "@aurea-uds/react/graph";
import "@xyflow/react/dist/base.css";

export function Automation({flow, steps, edges, runLog, run}) {
  const [selected, setSelected] = useState(steps[0].id);
  const [enabled, setEnabled] = useState(true);
  const [lines, setLines] = useState(runLog);
  const step = steps.find(s => s.id === selected);

  return (
    <Card>
      <header>
        <Heading level={3}>{flow.name}</Heading> <Status variant={enabled ? "success" : "neutral"}>{enabled ? "On" : "Off"}</Status>
        <Switch label="Enabled" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
        <Button variant="primary" leadingIcon="play" disabled={!enabled}
          onClick={async () => setLines(l => [...l, ...await run()])}>Run now</Button>
      </header>
      <Separator />

      <Card variant="inset">
        <DependencyGraph label={\`\${flow.name}, step by step\`} orientation="vertical" height="24rem"
          nodes={steps} edges={edges} selectedId={selected} onSelect={id => id && setSelected(id)} />
      </Card>
      <Card variant="outline">
        <LogStream lines={lines} />
      </Card>

      <div>
        <DataList items={[{term: "Step", value: step.label}, {term: "Does", value: <Code>{step.detail}</Code>}]} />
      </div>
    </Card>
  );
}`,
  render: () => h(Automation),
};
