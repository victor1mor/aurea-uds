// RECEITA · Observability · ops (S-11, 05/11/2026) — o painel de quem está de plantão como tela de produto, na linguagem dos
// blocos v2 (a `Tela`): o incidente aberto com "Acknowledge", a saúde dos serviços (`HealthMatrix`), a latência no gráfico
// (`Chart`, desenhado antes pelo gerador — `prerender`) e em números, os eventos (`EventStream`) e o registro ao vivo
// (`LogStream`) que pausa sem perder linhas. Interação de verdade: "Acknowledge" assume o incidente e ele entra nos eventos;
// "Mitigate" volta o serviço ao normal; "Pause live tail" segura o registro.
import {createElement as h, useState} from "react";
import * as A from "../../../../packages/react/dist/index.js";
import {Chart} from "../../../../packages/react/dist/chart.js";
import {AreaChart, Area, CartesianGrid, XAxis} from "recharts";
import {Tela, Propriedades, Grupo, Numero} from "./_tela.mjs";

const numeros = {display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, calc(var(--space-24) * 2)), 1fr))", gap: "var(--space-3)"};
const LATENCIA = [["09:00", 212], ["09:03", 219], ["09:06", 231], ["09:09", 248], ["09:12", 284], ["09:15", 279]].map(([t, ms]) => ({t, ms}));
const NORMAL = [["09:18", 236], ["09:21", 214]].map(([t, ms]) => ({t, ms}));
const EVENTOS = [
  {id: "1", title: "Error rate above 2% on checkout-api", time: "09:12", severity: "danger", detail: "runbook: checkout / upstream timeouts", group: "Today"},
  {id: "2", title: "Deploy 4.18.2 to checkout-api", time: "09:05", severity: "info", detail: "by Analyst", group: "Today"},
];
const REGISTRO = [{time: "09:12:41", level: "error", text: "upstream timeout after 30s (payments)"},
  {time: "09:12:44", level: "warn", text: "retry 1 of 3"}, {time: "09:12:47", level: "error", text: "upstream timeout after 30s (payments)"}];

function OnCall() {
  const [fase, setFase] = useState("open");
  const [eventos, setEventos] = useState(EVENTOS);
  const [pausado, setPausado] = useState(false);
  const [registro, setRegistro] = useState(REGISTRO);
  const evento = (title, severity) => setEventos(es => [{id: String(es.length + 1), title, time: "09:16", severity, group: "Today"}, ...es]);
  const assumir = () => { setFase("ack"); evento("Incident acknowledged by you", "warning"); };
  const mitigar = () => {
    setFase("ok"); evento("Rolled back to 4.18.1 — error rate 0.3%", "success");
    if (!pausado) setRegistro(r => [...r, {time: "09:17:02", text: "rollback complete; payments responding in 180 ms"}]);
  };
  const serie = fase === "ok" ? [...LATENCIA, ...NORMAL] : LATENCIA;
  return h(Tela, {icone: "pulse", trilha: ["Services", "checkout-api"], id: "inc_7731", titulo: "Checkout",
    estado: h(A.Status, {variant: fase === "ok" ? "success" : "danger"}, fase === "ok" ? "Operational" : "Incident"),
    propriedades: [["bell-ringing", fase === "open" ? "Paging on-call" : "Acknowledged"], ["git-branch", "4.18.2"], ["clock", "Started 09:12"]],
    acoes: fase === "open" ? h(A.Button, {variant: "primary", leadingIcon: "check", onClick: assumir}, "Acknowledge")
      : fase === "ack" ? h(A.Button, {variant: "primary", leadingIcon: "arrow-counter-clockwise", onClick: mitigar}, "Mitigate: roll back") : null,
    lado: [
      h(Propriedades, {key: "p", titulo: "Incident", itens: [{term: "Severity", value: "SEV-2"}, {term: "Owner", value: fase === "open" ? "unassigned" : "You"},
        {term: "Runbook", value: h(A.Link, {href: "#runbook"}, "checkout / timeouts")}]}),
      h(Grupo, {key: "e", titulo: "Events"}, h(A.EventStream, {label: "Events", events: eventos}))],
    rodape: "Pausing the live tail keeps the stream; it does not throw lines away. The runbook is linked from the incident, not from memory."},
    fase !== "ok" ? h(A.Alert, {variant: "danger", title: "Error rate above 2% since 09:12"}, "Payments time out after the 09:05 deploy.") : null,
    h("div", {style: numeros},
      h(Numero, {label: "p95 latency", value: fase === "ok" ? "214 ms" : "284 ms", trend: fase === "ok" ? "−70 ms" : "+38 ms", direction: fase === "ok" ? "down" : "up", tone: fase === "ok" ? "success" : "danger"}),
      h(Numero, {label: "Error rate", value: fase === "ok" ? "0.3%" : "2.4%", trend: "last 5 min", direction: "flat", tone: "neutral"}),
      h(Numero, {label: "Requests", value: "1.2k/s", trend: "steady", direction: "flat", tone: "neutral"})),
    h(Grupo, {titulo: "p95 latency, in milliseconds"}, h(Chart, {label: "p95 latency over the last 20 minutes"},
      h(AreaChart, {data: serie},
        h(CartesianGrid, {vertical: false}),
        h(XAxis, {dataKey: "t", tickLine: false, axisLine: false}),
        h(Area, {dataKey: "ms", name: "p95", stroke: "var(--chart-4)", fill: "var(--chart-4)", fillOpacity: 0.15})))),
    h(Grupo, {titulo: "Services"}, h(A.HealthMatrix, {label: "Services", entries: [
      {id: "a", name: "checkout-api", state: fase === "ok" ? "operational" : "degraded", detail: fase === "ok" ? "0.3% errors" : "2.4% errors"},
      {id: "b", name: "payments", state: fase === "ok" ? "operational" : "down", detail: fase === "ok" ? "180 ms" : "timeouts"},
      {id: "c", name: "catalog", state: "operational", detail: "90 ms"}, {id: "d", name: "search", state: "maintenance", detail: "until 10:00"}]})),
    h(Grupo, {titulo: "Live tail"},
      h("div", null, h(A.Button, {appearance: "soft", tone: "brand", size: "sm", leadingIcon: pausado ? "play" : "pause", onClick: () => setPausado(p => !p)}, pausado ? "Resume live tail" : "Pause live tail")),
      h(A.LogStream, {lines: registro})));
}

export default {
  uses: ["Card", "Separator", "Avatar", "Icon", "Text", "Code", "Heading", "Status", "Button", "DataList", "Link", "EventStream", "Alert", "KPI", "Chart", "HealthMatrix", "LogStream"],
  prerender: "recharts-surface",
  code: `import {useState} from "react";
import {Alert, Button, Card, DataList, EventStream, HealthMatrix, Heading, KPI, LogStream, Separator, Status} from "@aurea-uds/react";
import {Chart} from "@aurea-uds/react/chart";
import {Area, AreaChart, CartesianGrid, XAxis} from "recharts";

export function OnCall({incident, services, latency, events: initialEvents, tail}) {
  const [phase, setPhase] = useState("open");
  const [events, setEvents] = useState(initialEvents);
  const [paused, setPaused] = useState(false);

  return (
    <Card>
      <header>
        <Heading level={3}>{incident.service}</Heading> <Status variant="danger">Incident</Status>
        {phase === "open" && <Button variant="primary" onClick={() => setPhase("ack")}>Acknowledge</Button>}
        {phase === "ack" && <Button variant="primary" onClick={() => setPhase("ok")}>Mitigate: roll back</Button>}
      </header>
      <Separator />

      {phase !== "ok" && <Alert variant="danger" title={incident.title}>{incident.cause}</Alert>}
      <Card variant="inset"><KPI variant="plain" label="p95 latency" value={incident.p95} direction="up" tone="danger" /></Card>
      <Card variant="inset">
        <Chart label="p95 latency over the last 20 minutes">
          <AreaChart data={latency}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="t" tickLine={false} axisLine={false} />
            <Area dataKey="ms" name="p95" stroke="var(--chart-4)" fill="var(--chart-4)" fillOpacity={0.15} />
          </AreaChart>
        </Chart>
      </Card>
      <Card variant="inset"><HealthMatrix label="Services" entries={services} /></Card>
      <Card variant="inset">
        <Button appearance="soft" tone="brand" size="sm" onClick={() => setPaused(p => !p)}>{paused ? "Resume live tail" : "Pause live tail"}</Button>
        <LogStream lines={tail} />
      </Card>

      <aside>
        <DataList items={[{term: "Severity", value: incident.severity}, {term: "Owner", value: incident.owner}]} />
        <EventStream label="Events" events={events} />
      </aside>
    </Card>
  );
}`,
  render: () => h(OnCall),
};
