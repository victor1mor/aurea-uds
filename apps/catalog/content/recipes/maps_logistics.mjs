// RECEITA · Maps · logistics (S-11, 05/11/2026) — a rota de entregas como tela de produto, na linguagem dos blocos v2 (a
// `Tela`). A Aurea não tem mapa: a receita mostra a metade que ela exige de todo mapa — a lista que espelha o mapa ("toda
// escolha no mapa espelha uma lista"): as paradas em ordem (`Stepper`), a grade das entregas (`DataGrid`, a
// decisão S-02), a hora prevista e a idade da posição, sempre à vista. Interação de verdade: escolher uma parada mostra o
// detalhe dela; "Mark as delivered" fecha a parada atual e a rota anda.
import {createElement as h, useState} from "react";
import * as A from "../../../../packages/react/dist/index.js";
import {DataGrid} from "../../../../packages/react/dist/data-grid.js";
import {Tela, Propriedades, Grupo, Numero} from "./_tela.mjs";

const numeros = {display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, calc(var(--space-24) * 2)), 1fr))", gap: "var(--space-3)"};
const PARADAS = [
  {id: "s1", stop: "Depot", address: "1 Harbour Road", eta: "13:10", parcels: 0, note: "loaded 18 parcels"},
  {id: "s2", stop: "Stop 2", address: "48 Harbour Road", eta: "14:05", parcels: 6, note: "leave at the reception"},
  {id: "s3", stop: "Stop 3", address: "12 Central Avenue", eta: "14:42", parcels: 7, note: "call on arrival"},
  {id: "s4", stop: "Stop 4", address: "3 Mill Lane", eta: "15:20", parcels: 5, note: "back door"},
];

function Route() {
  const [feitas, setFeitas] = useState(2);
  const [escolhida, setEscolhida] = useState("s3");
  const p = PARADAS.find(x => x.id === escolhida);
  const estadoDe = i => i < feitas ? "done" : i === feitas ? "active" : "default";
  const rotulo = i => i < feitas ? "Delivered" : i === feitas ? "Next" : "Planned";
  const tom = i => i < feitas ? "success" : i === feitas ? "info" : "neutral";
  const proxima = PARADAS[feitas];
  return h(Tela, {icone: "truck", trilha: ["Routes", "Today"], id: "rt_0611", titulo: "Harbour loop",
    estado: h(A.Status, {variant: feitas >= PARADAS.length ? "success" : "running"}, feitas >= PARADAS.length ? "Completed" : "On the road"),
    propriedades: [["user", "Driver: Planner"], ["package", `${PARADAS.reduce((t, x) => t + x.parcels, 0)} parcels`], ["map-pin", "Position 3 min old"]],
    acoes: proxima ? h(A.Button, {variant: "primary", leadingIcon: "check", onClick: () => { setFeitas(f => f + 1); setEscolhida(PARADAS[Math.min(feitas + 1, PARADAS.length - 1)].id); }},
      `Mark ${proxima.stop} as delivered`) : null,
    lado: [
      h(Propriedades, {key: "p", titulo: "Selected stop", itens: [{term: "Stop", value: p.stop}, {term: "Address", value: p.address},
        {term: "Planned", value: p.eta}, {term: "Parcels", value: String(p.parcels)}, {term: "Note", value: p.note}]}),
      h(A.Alert, {key: "b", variant: "warning", title: "Position 3 min old"}, "The ETA uses the last known position; it is never shown as live.")],
    rodape: "The list is the map's mirror: choosing a stop here is choosing it on the map, and the list works on its own."},
    h("div", {style: numeros},
      h(Numero, {label: "Next stop ETA", value: proxima ? proxima.eta : "—", trend: proxima ? "on time" : "route done", direction: "flat", tone: "success"}),
      h(Numero, {label: "Delivered", value: `${feitas} of ${PARADAS.length}`, trend: "stops", direction: "flat", tone: "neutral"})),
    h(Grupo, {titulo: "Route"}, h(A.Stepper, {label: "Route stops",
      items: PARADAS.map((x, i) => ({label: x.stop, state: estadoDe(i), optional: x.eta, onClick: () => setEscolhida(x.id)}))})),
    h(DataGrid, {label: "Stops", data: PARADAS.map((x, i) => ({...x, i})), getRowId: x => x.id,
      columns: [
        {accessorKey: "stop", header: "Stop", cell: ({row}) => h(A.Button, {variant: "link", onClick: () => setEscolhida(row.original.id),
          "aria-pressed": escolhida === row.original.id ? "true" : "false"}, row.original.stop)},
        {accessorKey: "address", header: "Address"},
        {accessorKey: "eta", header: "ETA"},
        {accessorKey: "i", header: "State", cell: ({getValue}) => h(A.Status, {variant: tom(getValue())}, rotulo(getValue()))}]}));
}

export default {
  uses: ["Card", "Separator", "Avatar", "Icon", "Text", "Code", "Heading", "Status", "Button", "DataList", "Alert", "KPI", "Stepper", "DataGrid"],
  code: `import {useState} from "react";
import {Alert, Button, Card, DataList, Heading, KPI, Separator, Status, Stepper} from "@aurea-uds/react";
import {DataGrid} from "@aurea-uds/react/data-grid";

// The map is the other half. This list is its mirror: selecting a stop here selects it there.
export function Route({stops}) {
  const [done, setDone] = useState(2);
  const [selected, setSelected] = useState(stops[done].id);
  const stop = stops.find(s => s.id === selected);

  return (
    <Card>
      <header>
        <Heading level={3}>Harbour loop</Heading> <Status variant="running">On the road</Status>
        {done < stops.length && (
          <Button variant="primary" onClick={() => setDone(d => d + 1)}>Mark {stops[done].stop} as delivered</Button>
        )}
      </header>
      <Separator />

      <Card variant="inset"><KPI variant="plain" label="Next stop ETA" value={stops[done]?.eta ?? "—"} /></Card>
      <Stepper label="Route stops"
        items={stops.map((s, i) => ({label: s.stop, optional: s.eta, onClick: () => setSelected(s.id),
          state: i < done ? "done" : i === done ? "active" : "default"}))} />
      <DataGrid label="Stops" data={stops} getRowId={s => s.id}
        columns={[{accessorKey: "stop", header: "Stop"}, {accessorKey: "address", header: "Address"}, {accessorKey: "eta", header: "ETA"}]} />

      <div>
        <DataList items={[{term: "Address", value: stop.address}, {term: "Note", value: stop.note}]} />
        <Alert variant="warning" title="Position 3 min old">The ETA uses the last known position.</Alert>
      </div>
    </Card>
  );
}`,
  render: () => h(Route),
};
