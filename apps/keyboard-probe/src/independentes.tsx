// BANCO DAS PEÇAS INDEPENDENTES — PV-14 (16/11/2026). O Victor (20/10/2026): "preciso de uma solução robusta que
// componentes sejam independentes em conjuntos de toda forma". Cada peça de leiaute aparece SOZINHA (numa caixa comum,
// sem `AppShell`) e dentro de `Stack`, de `Cluster` e de `Grid`. O teste (`tests/visual/independentes.spec.ts`) mede a
// caixa de cada uma: nenhuma pode sumir, sair da caixa onde foi posta nem ter o conteúdo cortado por dentro. O tema, a
// marca e a largura vêm do endereço (`?tema=dark&marca=ember&largura=900`).
import {StrictMode, useState, type ReactNode} from "react";
import {createRoot} from "react-dom/client";
import {
  AureaProvider, Breadcrumb, BottomNav, Button, Card, Cluster, Grid, Header, NavList, Pagination, SegmentedControl,
  Sidebar, Stack, Stepper, TableOfContents, Tabs, Toolbar, ToolbarButton,
} from "@aurea-uds/react";
import "@aurea-uds/core/css";

const q = new URLSearchParams(location.search);
const tema = q.get("tema") === "dark" ? "dark" : "light";
const marca = q.get("marca");
const largura = Number(q.get("largura") ?? 900);
document.documentElement.dataset.theme = tema;
if (marca) document.documentElement.dataset.brand = marca;
const SPRITE = new URL("../../../packages/icons/dist/aurea-icons.svg", location.href).href;

const ITENS = [
  {id: "inicio", label: "Home", icon: "house", href: "#inicio"},
  {id: "relatorios", label: "Reports", icon: "chart-bar", href: "#relatorios", badge: "3"},
  {id: "ajustes", label: "Settings", icon: "gear", href: "#ajustes"},
] as const;

function Abas() {
  const [v, setV] = useState("a");
  return <Tabs label="Sections" value={v} onChange={setV} tabs={[
    {id: "a", label: "Overview", content: "Overview content"},
    {id: "b", label: "Activity", content: "Activity content"},
  ]}/>;
}
function Segmentos() {
  const [v, setV] = useState("dia");
  return <SegmentedControl label="Period" value={v} onChange={setV} items={[
    {value: "dia", label: "Day"}, {value: "semana", label: "Week"}, {value: "mes", label: "Month"},
  ]}/>;
}
function Paginas() {
  const [p, setP] = useState(2);
  return <Pagination page={p} total={8} onPageChange={setP}/>;
}

// As peças de leiaute: o que monta a estrutura de uma tela.
export const PECAS: Array<[string, () => ReactNode]> = [
  ["Sidebar", () => <Sidebar items={[...ITENS]} current="relatorios" label="Main"/>],
  ["Header", () => <Header brand={<strong>Acme</strong>} items={[...ITENS]} current="inicio"/>],
  ["BottomNav", () => <BottomNav items={[...ITENS]} current="inicio" label="Main"/>],
  ["NavList", () => <NavList items={[...ITENS]}/>],
  ["TableOfContents", () => <TableOfContents items={[{id: "um", label: "Introduction"}, {id: "dois", label: "Installation"}]} current="um"/>],
  ["Breadcrumb", () => <Breadcrumb items={[{label: "Home", href: "#"}, {label: "Reports", href: "#"}, {label: "March"}]}/>],
  ["Stepper", () => <Stepper items={[{label: "Account", state: "complete"}, {label: "Profile", state: "current"}, {label: "Done"}]}/>],
  ["Tabs", () => <Abas/>],
  ["SegmentedControl", () => <Segmentos/>],
  ["Pagination", () => <Paginas/>],
  ["Toolbar", () => <Toolbar label="Text"><ToolbarButton>Bold</ToolbarButton><ToolbarButton>Italic</ToolbarButton></Toolbar>],
  ["Card", () => <Card><strong>March report</strong><p>Revenue grew 12%.</p><Button>Open</Button></Card>],
];

// Os quatro lugares. Cada peça vai sozinha numa caixa, e então dentro de cada peça de arrumar, com um vizinho comum.
const CONTEXTOS: Array<[string, (p: ReactNode) => ReactNode]> = [
  ["sozinha", (p) => <div>{p}</div>],
  ["Stack", (p) => <Stack>{p}<div className="vizinho">Neighbour</div></Stack>],
  ["Cluster", (p) => <Cluster>{p}<div className="vizinho">Neighbour</div></Cluster>],
  ["Grid", (p) => <Grid columns={2}>{p}<div className="vizinho">Neighbour</div></Grid>],
];

// Para a bancada (`?so=Sidebar&marcar=1`): só a peça pedida, com a borda amarela em volta dela e a largura escrita em
// cima, em letra grande — sem isso, uma peça sem fundo (o índice, os segmentos) muda de largura sem ninguém ver.
const SO = q.get("so");
const MARCAR = q.get("marcar") === "1";
if (MARCAR) {
  const st = document.createElement("style");
  st.textContent = "[data-caixa] > * > *:first-child{outline:3px solid #e5a000;outline-offset:0}" +
    ".medida{font:700 22px/1.3 system-ui,sans-serif;color:var(--foreground);margin:4px 0 6px}" +
    "[data-peca=Sidebar] .sidebar{block-size:auto;max-block-size:none;position:static}" +
    "[data-contexto]{padding:8px}[data-contexto] .rotulo{font-size:18px!important;opacity:1!important;font-weight:600}";
  document.head.append(st);
  const medir = () => document.querySelectorAll<HTMLElement>("[data-contexto]").forEach((ctx) => {
    const el = ctx.querySelector<HTMLElement>("[data-caixa] > * > *");
    if (!el) return;
    let m = ctx.querySelector<HTMLElement>(".medida");
    if (!m) { m = document.createElement("div"); m.className = "medida"; ctx.querySelector(".rotulo")!.after(m); }
    m.textContent = `Largura: ${Math.round(el.getBoundingClientRect().width)} px`;
  });
  addEventListener("load", () => setTimeout(medir, 300));
  setTimeout(medir, 800);
}

function Banco() {
  const pecas = SO ? PECAS.filter(([n]) => SO.split(",").includes(n)) : PECAS;
  return (
    <AureaProvider defaultTheme={tema} spriteUrl={SPRITE}>
      <main style={{padding: 16, display: "grid", gap: 24, background: "var(--background)"}}>
        <h1>Independent pieces (PV-14)</h1>
        {pecas.map(([nome, peca]) => (
          <section key={nome} data-peca={nome} aria-label={nome} style={{display: "grid", gap: 12}}>
            <h2>{nome}</h2>
            {CONTEXTOS.map(([ctx, envolve]) => (
              <div key={ctx} data-contexto={ctx} style={{width: largura, maxWidth: "100%", outline: "1px dashed color-mix(in oklab, var(--foreground) 25%, transparent)"}}>
                <div className="rotulo" style={{fontSize: 12, opacity: .7}}>{ctx}</div>
                <div data-caixa>{envolve(peca())}</div>
              </div>
            ))}
          </section>
        ))}
      </main>
    </AureaProvider>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><Banco/></StrictMode>);
