// RECEITA · Mobile · PWA (S-11, 05/11/2026) — um app de celular que funciona sem rede como tela de produto, na linguagem dos
// blocos v2 (a `Tela`, aqui com o celular dentro): uma coluna de 20rem, a ação em largura inteira, toque de 44, e a barra de
// baixo (`BottomNav`) para trocar de parte. Ao lado, a chave da rede (para ver o app sem ela) e os dados do aparelho.
// Interação de verdade: trocar de parte pela barra; guardar uma leitura (sem rede, ela vai para a fila); voltar a rede envia a
// fila; a parte "Sync" mostra o que está na fila.
import {createElement as h, useState} from "react";
import * as A from "../../../../packages/react/dist/index.js";
import {Tela, Propriedades} from "./_tela.mjs";

const pilha = {display: "grid", gap: "var(--space-4)", minInlineSize: 0};
const LEITURAS = [{id: "r1", valor: 40.8, hora: "08:10", enviada: true}, {id: "r2", valor: 41.0, hora: "08:40", enviada: true}];

function MeterApp() {
  const [parte, setParte] = useState("new");
  const [online, setOnline] = useState(false);
  const [leituras, setLeituras] = useState(LEITURAS);
  const [valor, setValor] = useState(41.2);
  const [guardada, setGuardada] = useState(false);
  const fila = leituras.filter(l => !l.enviada);
  const guardar = () => {
    setLeituras(ls => [...ls, {id: `r${ls.length + 1}`, valor, hora: "09:12", enviada: online}]); setGuardada(true);
  };
  const trocarRede = on => { setOnline(on); if (on) setLeituras(ls => ls.map(l => ({...l, enviada: true}))); };
  const itens = [{id: "list", label: "Readings", icon: "list"}, {id: "new", label: "New", icon: "plus"},
    {id: "sync", label: "Sync", icon: online ? "cloud-check" : "cloud-slash", badge: fila.length ? h(A.Badge, {size: "xs", variant: "danger", emphasis: "solid"}, String(fila.length)) : undefined}];
  const tela = {
    list: h("div", {style: pilha}, h(A.Heading, {level: 4}, "Readings"),
      ...[...leituras].reverse().map(l => h("div", {key: l.id, style: {display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-2)"}},
        h(A.Text, {numeric: true, weight: "semibold"}, `${l.valor.toFixed(1)} m³`), h(A.Text, {type: "body-sm", tone: "muted"}, l.hora),
        h(A.Status, {variant: l.enviada ? "success" : "warning"}, l.enviada ? "sent" : "queued")))),
    new: h("div", {style: pilha}, h(A.Heading, {level: 4}, "New reading"),
      !online ? h(A.Banner, {variant: "warning", title: "Offline"}, "Saved on this phone, queued to send.") : null,
      guardada ? h(A.Alert, {variant: "success", title: online ? "Sent" : "Saved"}, online ? "The reading reached the server." : "It will go out when the network returns.") : null,
      h(A.NumberField, {label: "Meter reading (m³)", value: valor, onValueChange: v => { setValor(v ?? 0); setGuardada(false); }, step: 0.1, min: 0}),
      h(A.Button, {variant: "primary", fullWidth: true, leadingIcon: "check", onClick: guardar}, "Save reading")),
    sync: h("div", {style: pilha}, h(A.Heading, {level: 4}, "Sync"),
      fila.length ? h(A.TaskQueue, {label: "Waiting to send", tasks: fila.map(l => ({id: l.id, title: `${l.valor.toFixed(1)} m³ · ${l.hora}`, state: "queued"}))})
        : h(A.EmptyState, {icon: "cloud-check", title: "Nothing waiting", description: "Every reading reached the server."})),
  };
  return h(Tela, {icone: "device-mobile", trilha: ["Apps", "Meter reader"], id: "v3.2", titulo: "Meter reader",
    estado: h(A.Status, {variant: online ? "success" : "warning"}, online ? "Online" : "Offline"),
    propriedades: [["device-mobile", "Installed as an app"], ["cloud-slash", `${fila.length} queued`], ["clock", "Last sync 08:40"]],
    acoes: h(A.Switch, {label: "Network", description: online ? "Connected" : "No connection", checked: online, onChange: e => trocarRede(e.target.checked)}),
    lado: h(Propriedades, {titulo: "Device", itens: [{term: "Screen", value: "320 to 430 wide"}, {term: "Storage", value: "On the phone"}, {term: "Queue", value: `${fila.length} reading${fila.length === 1 ? "" : "s"}`}]}),
    rodape: "320 wide is the target, not the exception: one column, the action full width, touch targets never under 44."},
    h("div", {style: {display: "grid", justifyItems: "center"}},
      h(A.Card, {variant: "inset", style: {inlineSize: "min(100%, 20rem)"}},
        h("div", {style: {display: "grid", gap: "var(--space-4)", minBlockSize: "calc(var(--space-24) * 4)", alignContent: "space-between"}},
          tela[parte],
          h(A.BottomNav, {label: "Meter reader", current: parte, width: "full", items: itens.map(it => ({...it, onClick: () => setParte(it.id)}))})))));
}

export default {
  uses: ["Card", "Separator", "Avatar", "Icon", "Text", "Code", "Heading", "Status", "Switch", "DataList", "Banner", "Alert", "NumberField", "Button", "TaskQueue", "EmptyState", "BottomNav", "Badge"],
  code: `import {useState} from "react";
import {Alert, Badge, Banner, BottomNav, Button, EmptyState, Heading, NumberField, Status, TaskQueue} from "@aurea-uds/react";

// 320px is the target, not the exception: one column, the action full width, touch targets never under 44px.
export function MeterApp({online, save}) {
  const [tab, setTab] = useState("new");
  const [value, setValue] = useState(41.2);
  const [queue, setQueue] = useState([]);

  return (
    <>
      {tab === "new" && (
        <>
          <Heading level={1}>New reading</Heading>
          {!online && <Banner variant="warning" title="Offline">Saved on this phone, queued to send.</Banner>}
          <NumberField label="Meter reading (m³)" value={value} onValueChange={setValue} step={0.1} min={0} />
          <Button variant="primary" fullWidth onClick={async () => online ? save(value) : setQueue(q => [...q, value])}>Save reading</Button>
        </>
      )}
      {tab === "sync" && (queue.length
        ? <TaskQueue label="Waiting to send" tasks={queue.map((v, i) => ({id: String(i), title: \`\${v} m³\`, state: "queued"}))} />
        : <EmptyState icon="cloud-check" title="Nothing waiting" />)}

      <BottomNav label="Meter reader" current={tab} items={[
        {id: "list", label: "Readings", icon: "list", onClick: () => setTab("list")},
        {id: "new", label: "New", icon: "plus", onClick: () => setTab("new")},
        {id: "sync", label: "Sync", icon: "cloud-slash", badge: queue.length ? <Badge size="xs" variant="danger" emphasis="solid">{queue.length}</Badge> : undefined, onClick: () => setTab("sync")},
      ]} />
    </>
  );
}`,
  render: () => h(MeterApp),
};
