// BANCO DAS TABELAS — MNT-38 (a linha entre as fileiras), S-10 (o cabeçalho preso ao topo da página) e S-02 (o título
// dentro da moldura). A `Table` e a `DataGrid` de VERDADE: a linha é o `dividers` e o cabeçalho preso, o
// `stickyHeader="page"` (aprovados em 05/11/2026). O caso vem do endereço: `?caso=linha|preso|titulo&tema=light|dark&forma=hoje|proposta`.
import {StrictMode, useEffect} from "react";
import {createRoot} from "react-dom/client";
import {AppShell, AureaProvider, Badge, Card, Heading, MediaPlayer, Table, Text} from "@aurea-uds/react";
import {DataGrid} from "@aurea-uds/react/data-grid";
import "@aurea-uds/core/css";

const q = new URLSearchParams(location.search);
const caso = q.get("caso") ?? "linha";
const tema = q.get("tema") === "dark" ? "dark" : "light";
const forma = q.get("forma") === "proposta" ? "proposta" : "hoje";
const SPRITE = new URL("../../../packages/icons/dist/aurea-icons.svg", location.href).href;

type Disp = {name: string; ip: string; status: string; uptime: string};
const NOMES = ["core-sw-01", "core-sw-02", "edge-rt-01", "edge-rt-02", "ap-floor-1", "ap-floor-2", "ap-floor-3", "fw-main",
  "nas-backup", "printer-hall", "cam-gate", "cam-dock", "ups-rack-a", "ups-rack-b", "srv-db-01", "srv-db-02", "srv-web-01",
  "srv-web-02", "srv-mail", "voip-gw", "sensor-temp-1", "sensor-temp-2", "dist-sw-03", "dist-sw-04", "lab-ap-1", "lab-ap-2",
  "kiosk-01", "kiosk-02", "badge-reader", "dvr-main"];
const ESTADOS = ["Online", "Online", "Online", "Warning", "Online", "Offline"];
const DADOS: Disp[] = NOMES.map((n, i) => ({name: n, ip: `10.0.${Math.floor(i / 8)}.${10 + i}`,
  status: ESTADOS[i % ESTADOS.length], uptime: `${(i * 7) % 60 + 1} d`}));
const tom = (s: string) => s === "Online" ? "success" : s === "Warning" ? "warning" : "danger";
const COLUNAS = [
  {accessorKey: "name", header: "Device"},
  {accessorKey: "ip", header: "Address"},
  {accessorKey: "status", header: "Status", cell: (c: any) => <Badge tone={tom(c.getValue()) as any}>{c.getValue()}</Badge>},
  {accessorKey: "uptime", header: "Uptime"},
];

function TabelaSimples({linhas, caption, dividers}: {linhas: Disp[]; caption?: string; dividers?: boolean}) {
  return <Table caption={caption} dividers={dividers}>
    <thead><tr><th>Device</th><th>Address</th><th>Status</th><th>Uptime</th></tr></thead>
    <tbody>{linhas.map((d) => <tr key={d.name}><td>{d.name}</td><td>{d.ip}</td>
      <td><Badge tone={tom(d.status) as any}>{d.status}</Badge></td><td>{d.uptime}</td></tr>)}</tbody>
  </Table>;
}

const rotulo = {fontSize: "var(--text-2xl)", fontWeight: 700, margin: "0 0 var(--space-3)"} as const;

function Linha() {
  const cinco = DADOS.slice(0, 5);
  return <main style={{padding: "var(--space-8)", display: "grid", gap: "var(--space-10)", maxWidth: 1100, margin: "0 auto"}}>
    {(["hoje", "proposta"] as const).map((f) => <section key={f}>
      <p style={rotulo}>{f === "hoje" ? "HOJE — sem linha" : "PROPOSTA A — a linha clara entre as fileiras"}</p>
      <div style={{display: "grid", gap: "var(--space-6)"}}>
        <div><Text size="sm" tone="muted">Table</Text><TabelaSimples linhas={cinco} dividers={f === "proposta"} /></div>
        <div><Text size="sm" tone="muted">DataGrid</Text><DataGrid label="Devices" dividers={f === "proposta"} data={cinco} columns={COLUNAS as any} /></div>
      </div>
    </section>)}
  </main>;
}

function Preso() {
  useEffect(() => { if (q.get("rolar")) scrollTo(0, Number(q.get("rolar"))); }, []);
  return <AppShell layout="sidebar" brand={<strong>Rede</strong>} navItems={[{id: "d", label: "Devices", icon: "desktop-tower", href: "#"}]}
    currentNavId="d" topbar={<strong>{forma === "hoje" ? "HOJE — a caixa de 540 com rolagem própria" : "PROPOSTA — o cabeçalho preso ao topo da página"}</strong>}>
    <Card>
      <Heading level={2}>Devices</Heading>
      <Text tone="muted">30 devices on the network.</Text>
      <div style={{marginTop: "var(--space-4)"}}>
        <DataGrid label="Devices" stickyHeader={forma === "proposta" ? "page" : true} data={DADOS} columns={COLUNAS as any} />
      </div>
      <Text tone="muted">End of the list.</Text>
    </Card>
  </AppShell>;
}

function Titulo() {
  const fila = [{track: "Episode 15", length: "41:02", queued: true}, {track: "Episode 16", length: "38:47", queued: false}];
  return <main style={{padding: "var(--space-8)", display: "grid", gap: "var(--space-10)", maxWidth: 820, margin: "0 auto"}}>
    {(["hoje", "proposta"] as const).map((f) => <section key={f}>
      <p style={rotulo}>{f === "hoje" ? "HOJE — Table, o título dentro da moldura" : "PROPOSTA — DataGrid, sem título à vista (o nome fica para o leitor de tela)"}</p>
      <div style={{display: "grid", gap: "var(--space-4)"}}>
        <MediaPlayer kind="audio" title="Episode 14" subtitle="Season 2" />
        {f === "hoje"
          ? <Table caption="Up next"><thead><tr><th>Track</th><th>Length</th></tr></thead>
              <tbody>{fila.map((x) => <tr key={x.track}><td><span style={{display: "inline-flex", gap: "var(--space-2)", alignItems: "center"}}>{x.track}{x.queued && <Badge>queued</Badge>}</span></td><td>{x.length}</td></tr>)}</tbody></Table>
          : <DataGrid label="Up next" data={fila} columns={[
              {accessorKey: "track", header: "Track", cell: (c: any) => <span style={{display: "inline-flex", gap: "var(--space-2)", alignItems: "center"}}>{c.getValue()}{c.row.original.queued && <Badge>queued</Badge>}</span>},
              {accessorKey: "length", header: "Length"}] as any} />}
      </div>
    </section>)}
  </main>;
}

function Banco() {
  return <AureaProvider defaultTheme={tema} spriteUrl={SPRITE}>
    {caso === "preso" ? <Preso /> : caso === "titulo" ? <Titulo /> : <Linha />}
  </AureaProvider>;
}

createRoot(document.getElementById("root")!).render(<StrictMode><Banco /></StrictMode>);
