// BANCO DA LATERAL — o bloco 2 (25/10/2026): as quinze laterais que o Victor aprovou em 21/10/2026 (item 107), as cinco do
// item atual (item 101) e a lateral solta, montadas com as peças DE VERDADE. Uma variação por documento (o `AppShell` é dono
// da página): `?v=1` a `?v=15`, `?v=indicador&i=segment`, `?v=solta`; o tema vem de `?tema=light`.
//
// Como os outros bancos, este não afirma nada: monta. Quem afirma é `tests/visual/lateral-bloco-2.spec.ts`.
import {StrictMode, useState, type ReactNode} from "react";
import {createRoot} from "react-dom/client";
import {
  AppShell, AureaProvider, Avatar, Badge, Button, Card, IconButton, Kbd, Progress, SearchField, Sidebar,
  type SidebarEntry, type SidebarIndicator,
} from "@aurea-uds/react";
import "@aurea-uds/core/css";

const q = new URLSearchParams(location.search);
const v = q.get("v") ?? "1";
const tema = q.get("tema") === "light" ? "light" : "dark";
// O desenho dos ícones: o arquivo do pacote de ícones, servido da raiz do repositório (como o Playwright serve).
const SPRITE = new URL("../../../packages/icons/dist/aurea-icons.svg", location.href).href;

const PRINCIPAL: SidebarEntry[] = [
  {id: "home", label: "Home", icon: "house", href: "#home"},
  {id: "tasks", label: "Tasks", icon: "check-square", href: "#tasks"},
  {id: "docs", label: "Docs", icon: "file-text", href: "#docs"},
  {id: "schedule", label: "Schedule", icon: "calendar", href: "#schedule"},
  {id: "chat", label: "Chat", icon: "chat-circle", href: "#chat", badge: <Badge>2</Badge>},
  {id: "payments", label: "Payments", icon: "credit-card", href: "#payments"},
  {id: "customers", label: "Customers", icon: "users", href: "#customers"},
];
const PE: SidebarEntry[] = [
  {id: "support", label: "Support", icon: "lifebuoy", href: "#support"},
  {id: "settings", label: "Settings", icon: "gear", href: "#settings"},
];
const marca = <Sidebar.Brand variant="plain" logo={<Logo />} name="Acme" />;
const marcaDoApp = <Sidebar.Brand logo="A" name="Acme" description="Workspace" />;
const pessoa = <Sidebar.User avatar={<Avatar fallback="KM" />} name="Kate Moore" description="Administrator"
  action={<IconButton icon="sign-out" label="Sign out" size="sm" />} />;

function Logo() {
  return <svg className="icon" viewBox="0 0 256 256" aria-hidden="true"><path fill="currentColor" d="M223.68 66.15 135.68 18a15.88 15.88 0 0 0-15.36 0l-88 48.17a16 16 0 0 0-8.32 14v95.64a16 16 0 0 0 8.32 14l88 48.17a15.88 15.88 0 0 0 15.36 0l88-48.17a16 16 0 0 0 8.32-14V80.18a16 16 0 0 0-8.32-14.03ZM128 32l80.34 44L128 120 47.66 76ZM40 90l80 43.78v85.79l-80-43.75Zm96 129.57v-85.75L216 90v85.78Z" /></svg>;
}

// O conteúdo de toda variação: o título com o botão de recolher ao lado (quando a variação pede).
function Conteudo({titulo = "Project UI/UX", botao}: {titulo?: string; botao?: boolean}) {
  return <div className="bench-conteudo">
    <div className="bench-topo">{botao && <AppShell.SidebarToggle />}<h1>{titulo}</h1></div>
    <Card><p>Every variation uses the real Sidebar and the real AppShell from this branch.</p></Card>
  </div>;
}

// As que moram no AppShell.
function NoShell({children, ...p}: Parameters<typeof AppShell>[0]) {
  return <AppShell layout="sidebar" brand={marca} {...p}>{children}</AppShell>;
}

// As soltas (4-B): a lateral fora do AppShell, com o estado no `Sidebar.Provider`. A lateral escura numa página clara é o
// `data-theme` no próprio elemento (a 11, a 12 e a 15).
function Solta({children, lateral}: {children: ReactNode; lateral: ReactNode}) {
  return <Sidebar.Provider><div className="bench-solta">{lateral}<main className="bench-solta-main">{children}</main></div></Sidebar.Provider>;
}
function TituloSolto({botao}: {botao?: boolean}) {
  return <div className="bench-conteudo"><div className="bench-topo">{botao && <Sidebar.Toggle />}<h1>Project UI/UX</h1></div>
    <Card><p>A sidebar out of the AppShell: its state lives in Sidebar.Provider (Ctrl+B toggles it).</p></Card></div>;
}

const ADMIN: SidebarEntry[] = [
  ...PRINCIPAL.slice(0, 4),
  {id: "admin", label: "Administration", items: [
    {id: "users", label: "Users", icon: "user-gear", href: "#users"},
    {id: "billing", label: "Billing", icon: "receipt", href: "#billing"},
  ]},
];

function Variacao() {
  switch (v) {
    case "1": return <NoShell sidebarVariant="flush" sidebarCollapsible navItems={PRINCIPAL} currentNavId="tasks" sidebarFooter={<Sidebar.Nav label="Account" items={PE} />}><Conteudo botao /></NoShell>;
    case "2": return <NoShell sidebarVariant="flush" sidebarCollapsible="offcanvas" navItems={PRINCIPAL} currentNavId="tasks" sidebarFooter={<Sidebar.Nav label="Account" items={PE} />}><Conteudo botao /></NoShell>;
    case "3": return <NoShell sidebarCollapsible="capsule" navItems={PRINCIPAL} currentNavId="tasks" sidebarFooter={<Sidebar.Nav label="Account" items={PE} />}><Conteudo botao /></NoShell>;
    case "4": return <NoShell sidebarCollapsible="offcanvas" navItems={PRINCIPAL} currentNavId="tasks" sidebarFooter={<Sidebar.Nav label="Account" items={PE} />}><Conteudo botao /></NoShell>;
    case "5": return <NoShell sidebarCollapsed sidebarCollapsible="capsule" sidebarToggle="none" sidebarShortcut={false} navItems={PRINCIPAL} currentNavId="tasks" sidebarFooter={<Sidebar.Nav label="Account" items={PE} />}><Conteudo titulo="Always a capsule" /></NoShell>;
    case "6": return <NoShell sidebarCollapsible sidebarPanel="docked" navItems={SECOES} currentNavId="orders" sidebarFooter={<Sidebar.Nav label="Account" items={PE} />}><Conteudo botao /></NoShell>;
    case "7": return <Solta lateral={<Sidebar panel="overlay" items={SECOES} current="orders" header={<Sidebar.Brand variant="plain" logo={<Logo />} name="Acme" />} footer={<Sidebar.Nav label="Account" items={PE} />} />}><TituloSolto /></Solta>;
    case "8": return <NoShell sidebarVariant="flush" sidebarCollapsible navItems={TIMES} currentNavId="projects"><Conteudo botao /></NoShell>;
    case "9": return <NoShell sidebarCollapsible="capsule" navItems={DIVISORIAS} currentNavId="dashboard" sidebarFooter={<Sidebar.Show when="expanded"><Card className="bench-destaque"><strong>Used space</strong><span>Your team has used 80% of your space.</span><Progress value={80} label="Used space" size="sm" /></Card></Sidebar.Show>}><Conteudo botao /></NoShell>;
    case "10": return <NoShell sidebarCollapsible="capsule" navItems={DOBRA} currentNavId="tasks" brand={<><Sidebar.Brand variant="plain" logo={<Logo />} name="Acme" /><Sidebar.Show when="expanded"><SearchField placeholder="Search" aria-label="Search" /></Sidebar.Show></>}><Conteudo botao /></NoShell>;
    case "11": return <Solta lateral={<Sidebar variant="flush" data-theme="dark" items={ADMIN} current="docs" header={marcaDoApp} footer={<>{pessoa}<Sidebar.Toggle variant="item" /></>} />}><TituloSolto /></Solta>;
    case "12": return <Solta lateral={<Sidebar variant="flush" data-theme="dark" items={ADMIN} current="docs" header={marcaDoApp} footer={pessoa} />}><TituloSolto botao /></Solta>;
    case "13": return <NoShell sidebarVariant="flush" sidebarCollapsible sidebarToggle="none" navItems={PRINCIPAL} currentNavId="tasks" brand={<div className="bench-marca-com-botao"><Sidebar.Brand variant="plain" logo={<Logo />} name="Acme" /><Sidebar.Toggle /></div>} sidebarFooter={<Sidebar.Nav label="Account" items={PE} />}><Conteudo /></NoShell>;
    case "14": return <NoShell sidebarCollapsible="capsule" sidebarToggle="none" navItems={PRINCIPAL} currentNavId="tasks" brand={<div className="bench-marca-com-botao"><Sidebar.Brand variant="plain" logo={<Logo />} name="Acme" /><Sidebar.Toggle /></div>} sidebarFooter={<Sidebar.Nav label="Account" items={PE} />}><Conteudo /></NoShell>;
    case "15": return <Solta lateral={<Sidebar variant="flush" data-theme="dark" items={ADMIN} current="docs" header={<div className="bench-marca-com-botao">{marcaDoApp}<Sidebar.Toggle /></div>} footer={pessoa} />}><TituloSolto /></Solta>;
    case "indicador": return <Indicador />;
    case "fio": return <Fio />;
    case "solta": return <SoltaAltura />;
    default: return <p>Unknown variation.</p>;
  }
}

const SECOES: SidebarEntry[] = [
  {id: "s-home", label: "Home", icon: "house", items: [
    {id: "overview", label: "Overview", icon: "squares-four", href: "#overview"},
    {id: "products", label: "Products", icon: "package", href: "#products"},
    {id: "orders", label: "Orders", icon: "receipt", href: "#orders"},
    {id: "inbox", label: "Inbox", icon: "tray", href: "#inbox", badge: <Badge>4</Badge>},
  ]},
  {id: "s-dash", label: "Dashboard", icon: "chart-bar", items: [
    {id: "d-overview", label: "Overview", icon: "squares-four", href: "#d-overview"},
    {id: "notifications", label: "Notifications", icon: "bell", href: "#notifications", badge: <Badge>10</Badge>},
    {id: "analytics", label: "Analytics", icon: "chart-line", href: "#analytics"},
  ]},
  {id: "s-projects", label: "Projects", icon: "folder", items: [
    {id: "all", label: "View all", icon: "folders", href: "#all"},
    {id: "personal", label: "Personal", icon: "user", href: "#personal"},
    {id: "team", label: "Team", icon: "users", href: "#team"},
  ]},
];
const TIMES: SidebarEntry[] = [
  {id: "general", label: "General", items: [
    {id: "dashboard", label: "Dashboard", icon: "squares-four", href: "#dashboard"},
    {id: "projects", label: "Projects", icon: "folder", href: "#projects"},
    {id: "calendar", label: "Calendar", icon: "calendar", href: "#calendar"},
  ]},
  {id: "teams", label: "Your teams", items: [
    {id: "catalog", label: "Catalog", avatar: {fallback: "CA"}, href: "#catalog", badge: <Kbd>⌘1</Kbd>},
    {id: "warpspeed", label: "Warpspeed", avatar: {fallback: "WA"}, href: "#warpspeed", badge: <Kbd>⌘2</Kbd>},
    {id: "boltshift", label: "Boltshift", avatar: {fallback: "BO"}, href: "#boltshift", badge: <Kbd>⌘3</Kbd>},
  ]},
];
const DIVISORIAS: SidebarEntry[] = [
  {id: "home", label: "Home", icon: "house", href: "#home"},
  {id: "dashboard", label: "Dashboard", icon: "chart-bar", href: "#dashboard"},
  {id: "projects", label: "Projects", icon: "folder", href: "#projects"},
  "separator",
  {id: "folders", label: "Folders", icon: "folders", href: "#folders", items: [
    {id: "all", label: "View all", href: "#all", badge: <Badge>18</Badge>},
    {id: "recent", label: "Recent", href: "#recent", badge: <Badge>8</Badge>},
  ]},
  "separator",
  {id: "reporting", label: "Reporting", icon: "chart-pie", href: "#reporting"},
  {id: "support", label: "Support", icon: "lifebuoy", href: "#support"},
];
const mais = (rotulo: string) => <IconButton icon="plus" label={`Add to ${rotulo}`} size="xs" />;
const opcoes = (rotulo: string) => <IconButton icon="dots-three" label={`${rotulo} options`} size="xs" />;
const DOBRA: SidebarEntry[] = [
  ...PRINCIPAL.slice(0, 4),
  {id: "file", label: "File", collapsible: true, action: <>{mais("File")}{opcoes("File")}</>, items: [
    {id: "store", label: "Store", icon: "storefront", href: "#store", action: opcoes("Store")},
    {id: "company", label: "Company", icon: "buildings", href: "#company", action: opcoes("Company")},
  ]},
  {id: "archive", label: "Archive", collapsible: true, defaultOpen: false, action: mais("Archive"), items: [
    {id: "old", label: "Old projects", icon: "archive", href: "#old"},
  ]},
];

// O ITEM ATUAL (4-H): as cinco, lado a lado, com a lista de sempre.
function Indicador() {
  const opcoes: SidebarIndicator[] = ["brand", "segment", "segment-dot", "segment-line", "subtle"];
  return <div className="bench-indicadores">{opcoes.map((i) => <section key={i}><h2>{i}</h2>
    <Sidebar indicator={i} items={PRINCIPAL.slice(0, 5)} current="tasks" label={`Indicator ${i}`} /></section>)}</div>;
}

// 2-A — o fio e o texto (o item 102) e o subitem na trilha (o achado 13 do item 106). "Hoje" é o desenho da 0.43.0, refeito
// aqui: o recuo de 12 com o fio a 15, e a sublista que a trilha desenhava como botões vazios (a marcação que a 0.43.0 emitia).
function Fio() {
  const itens = PRINCIPAL.slice(0, 3);
  return <div className="bench-indicadores">
    <section className="bench-hoje"><h2>Today: text at 12, line at 15</h2><Sidebar items={itens} current="tasks" label="Today" /></section>
    <section><h2>Proposal: text and line at 16</h2><Sidebar items={itens} current="tasks" label="Proposal" /></section>
    <section className="bench-vazio"><h2>Today: the sub-items on the rail (two empty buttons)</h2>
      <aside className="sidebar sidebar-collapsed"><nav className="sidebar-nav" aria-label="Today rail"><ul className="sidebar-list">
        <li><a className="sidebar-item" href="#r"><svg className="icon" aria-hidden="true"><use href={`${SPRITE}#i-chart-bar`} /></svg><span className="sidebar-label sr-only">Reports</span></a>
          <ul className="sidebar-list sidebar-sub"><li><a className="sidebar-item" href="#m"><span className="sidebar-label sr-only">Monthly</span></a></li><li><a className="sidebar-item" href="#l"><span className="sidebar-label sr-only">Live</span></a></li></ul></li>
      </ul></nav></aside></section>
    <section><h2>Proposal: the rail hides them, as the reference does</h2>
      <Sidebar collapsed label="Proposal rail" items={[{id: "r", label: "Reports", icon: "chart-bar", href: "#r", items: [{id: "m", label: "Monthly", href: "#m"}, {id: "l", label: "Live", href: "#l"}]}]} /></section>
  </div>;
}
// 4-A — a lateral solta: hoje ela reserva a barra de cima (56) que não existe; a proposta vai do topo até embaixo.
function SoltaAltura() {
  return <div className="bench-duas-soltas">
    <div className="bench-hoje-altura"><Sidebar items={PRINCIPAL} current="tasks" label="Today" /><p>Today</p></div>
    <div><Sidebar items={PRINCIPAL} current="tasks" label="Proposal" /><p>Proposal</p></div>
  </div>;
}

function Bancada() {
  // O pedaço de CSS só da bancada: o arranjo da lateral solta e do conteúdo. As peças são as do pacote.
  return <>
    <style>{`
      .bench-conteudo { display:grid; gap:var(--space-5); padding:var(--space-4) var(--space-6); }
      .bench-topo { display:flex; align-items:center; gap:var(--space-3); }
      .bench-topo h1 { margin:0; font-size:var(--text-2xl); }
      .bench-solta { display:grid; grid-template-columns:auto minmax(0,1fr); min-height:100vh; background:var(--background); }
      .bench-solta > .sidebar { position:sticky; top:0; }
      .bench-solta > .sidebar:not(.sidebar-collapsed):not([class*="sidebar-panel-"]) { width:var(--sidebar-width); }
      .bench-solta > .sidebar.sidebar-collapsed:not([class*="sidebar-panel-"]) { width:var(--sidebar-rail); }
      .bench-solta-main { min-width:0; }
      .bench-marca-com-botao { display:flex; align-items:center; gap:var(--space-2); }
      .bench-marca-com-botao > .sidebar-brand { flex:1; min-width:0; }
      .sidebar-collapsed .bench-marca-com-botao { flex-direction:column; }
      .bench-destaque { display:grid; gap:var(--space-2); }
      .bench-indicadores { display:grid; grid-template-columns:repeat(auto-fit, minmax(16rem, 1fr)); gap:var(--space-4); padding:var(--space-4); }
      .bench-indicadores h2 { margin:0 0 var(--space-2); font-size:var(--text-sm); }
      .bench-indicadores .sidebar { position:static; height:auto; margin:0; }
      /* "Hoje", refeito: o recuo de 12 e o fio a 15 da 0.43.0. */
      .bench-hoje .sidebar { --sidebar-item-x:var(--space-3); }
      .bench-hoje .sidebar-item[aria-current]::after { inset-inline:15px; }
      .bench-vazio .sidebar-sub .sidebar-item { outline:1px dashed var(--fill-3); }
      .bench-duas-soltas { display:grid; grid-template-columns:1fr 1fr; min-height:100vh; }
      .bench-duas-soltas > div { position:relative; display:flex; align-items:flex-start; gap:var(--space-4); border-inline-end:1px dashed var(--fill-3); }
      .bench-duas-soltas p { margin:var(--space-4); }
      /* "Hoje", refeito: a solta reservava a barra de cima. */
      .bench-hoje-altura .sidebar { --shell-top:calc(var(--topbar-height) + var(--space-4) * 2); }
    `}</style>
    <Variacao />
  </>;
}

createRoot(document.getElementById("root")!).render(<StrictMode><AureaProvider theme={tema} spriteUrl={SPRITE}><Bancada /></AureaProvider></StrictMode>);
