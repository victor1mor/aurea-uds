// BANCO DA MARCA NA TRILHA — o lote 108 (26/11/2026). Na lateral com painel (`sidebarPanel`), a marca (`Sidebar.Brand`) e a
// pessoa (`Sidebar.User`) ficam na TRILHA de ícones, mas a regra que as centra só existe para a lateral recolhida
// (`.sidebar-collapsed`): o "L" do app saía 8 à direita dos ícones. Cada quadro é o `AppShell` de verdade; o "Hoje" usa o
// CSS do pacote, a "Proposta" acrescenta só as regras que faltam (as mesmas da recolhida, para a trilha). A linha tracejada
// passa pelo centro dos ícones da trilha.
//
// `?quadro=1&caso=painel-aberto&fix=1&tema=light&marca=ember` desenha um quadro; sem `quadro`, a página põe dois lado a lado.
import {StrictMode, useEffect, useState, type ReactNode} from "react";
import {createRoot} from "react-dom/client";
import {AppShell, AureaProvider, Avatar, IconButton, SegmentedControl, Select, Sidebar, type SidebarEntry} from "@aurea-uds/react";
import "@aurea-uds/core/css";

const q = new URLSearchParams(location.search);
const SPRITE = new URL("../../../packages/icons/dist/aurea-icons.svg", location.href).href;
const MARCAS = ["aurea", "ember", "sun", "honey", "orange", "magenta", "violet", "indigo", "cobalt", "cyan", "turquoise", "emerald", "lime"];
const CASOS: {id: string; nome: string}[] = [
  {id: "painel-aberto", nome: "Painel ao lado, aberto"},
  {id: "painel-recolhido", nome: "Painel ao lado, recolhido"},
  {id: "painel-por-cima", nome: "Painel por cima"},
  {id: "contraste", nome: "Lateral escura"},
  {id: "pessoa", nome: "Com a pessoa no pé"},
  {id: "marca-com-botao", nome: "Marca com botão"},
  {id: "marca-solta", nome: "Marca sem quadrinho"},
  {id: "recolhida", nome: "Sem painel, recolhida"},
];
// As regras que faltam — as da recolhida (`aurea.css`, "Recolhida: a marca vira só o quadrinho"), para a trilha com painel.
const PROPOSTA = `
.sidebar-rail-box .sidebar-brand { justify-content:center; padding-inline:0; }
.sidebar-rail-box .sidebar-brand-with-action { flex-direction:column; gap:var(--space-2); }
.sidebar-rail-box .sidebar-user { flex-direction:column; padding-inline:0; background:transparent; }`;

const SECOES: SidebarEntry[] = [
  {id: "s-home", label: "Home", icon: "house", items: [
    {id: "overview", label: "Overview", icon: "squares-four", href: "#overview"},
    {id: "orders", label: "Orders", icon: "receipt", href: "#orders"},
  ]},
  {id: "s-books", label: "Library", icon: "books", items: [{id: "all", label: "All books", icon: "book-open", href: "#all"}]},
  {id: "s-map", label: "Map", icon: "map-trifold", items: [{id: "regions", label: "Regions", icon: "map-pin", href: "#regions"}]},
  {id: "s-prod", label: "Production", icon: "palette", items: [
    {id: "look", label: "Appearance", href: "#look"}, {id: "body", label: "Body and age", href: "#body"},
    {id: "clothes", label: "Clothes", href: "#clothes"}, {id: "notes", label: "Image notes", href: "#notes"},
    {id: "sheets", label: "Production sheets", href: "#sheets"},
  ]},
  {id: "s-check", label: "Review", icon: "seal-check", items: [{id: "queue", label: "Queue", href: "#queue"}]},
];
const PLANA: SidebarEntry[] = [
  {id: "home", label: "Home", icon: "house", href: "#home"},
  {id: "books", label: "Library", icon: "books", href: "#books"},
  {id: "map", label: "Map", icon: "map-trifold", href: "#map"},
  {id: "notes", label: "Production", icon: "palette", href: "#notes"},
];
const PE: SidebarEntry[] = [{id: "keys", label: "Shortcuts", icon: "keyboard", href: "#keys"}];

function Logo() {
  return <svg className="icon" viewBox="0 0 256 256" aria-hidden="true"><path fill="currentColor" d="M223.68 66.15 135.68 18a15.88 15.88 0 0 0-15.36 0l-88 48.17a16 16 0 0 0-8.32 14v95.64a16 16 0 0 0 8.32 14l88 48.17a15.88 15.88 0 0 0 15.36 0l88-48.17a16 16 0 0 0 8.32-14V80.18a16 16 0 0 0-8.32-14.03ZM128 32l80.34 44L128 120 47.66 76ZM40 90l80 43.78v85.79l-80-43.75Zm96 129.57v-85.75L216 90v85.78Z" /></svg>;
}

// UM QUADRO: o AppShell de verdade, com a lateral até o topo, como o app usa.
function Quadro() {
  const caso = q.get("caso") ?? "painel-aberto";
  const marcaDoApp = <Sidebar.Brand logo="L" name="Production" description="Workspace" />;
  let brand: ReactNode = marcaDoApp;
  let footer: ReactNode = <Sidebar.Nav label="More" items={PE} />;
  const p: Record<string, unknown> = {sidebarCollapsible: true, sidebarPanel: "docked", navItems: SECOES, currentNavId: "notes"};
  if (caso === "painel-recolhido") p.defaultSidebarCollapsed = true;
  if (caso === "painel-por-cima") p.sidebarPanel = "overlay";
  if (caso === "contraste") p.sidebarContrast = true;
  if (caso === "pessoa") footer = <><Sidebar.User avatar={<Avatar fallback="KM" />} name="Kate Moore" description="Admin"
    action={<IconButton icon="sign-out" label="Sign out" size="sm" />} /><Sidebar.Toggle variant="item" /></>;
  if (caso === "marca-com-botao") brand = <Sidebar.Brand logo="L" name="Production" description="Workspace" action={<IconButton icon="bell" label="Notifications" size="sm" />} />;
  if (caso === "marca-solta") brand = <Sidebar.Brand variant="plain" logo={<Logo />} name="Production" />;
  if (caso === "recolhida") { delete p.sidebarPanel; p.navItems = PLANA; p.currentNavId = "notes"; p.defaultSidebarCollapsed = true; }
  useEffect(() => {
    // A linha de prumo: o centro do primeiro ícone da trilha, medido depois de desenhar.
    const medir = () => {
      const linha = document.getElementById("prumo");
      if (!linha) return;
      const it = document.querySelector(".sidebar-rail-box .sidebar-nav .sidebar-item, .sidebar-collapsed .sidebar-nav .sidebar-item");
      if (!it) { linha.style.display = "none"; return; }
      const b = it.getBoundingClientRect();
      linha.style.display = "block"; linha.style.left = `${b.left + b.width / 2 - 1}px`;
    };
    const t = setInterval(medir, 300); medir();
    return () => clearInterval(t);
  }, []);
  return <>
    {q.get("fix") === "1" && <style>{PROPOSTA}</style>}
    <style>{`#prumo { position:fixed; inset-block:0; inline-size:0; border-inline-start:2px dashed #ff2d6f; z-index:9999; pointer-events:none; }
      .bench-c { padding:var(--space-6); } .bench-c h1 { margin:0; font-size:var(--text-2xl); }`}</style>
    <AppShell layout="sidebar" brand={brand} sidebarFooter={footer} {...p}><div className="bench-c"><h1>Image notes</h1></div></AppShell>
    {q.get("prumo") !== "0" && <div id="prumo" />}
  </>;
}

// A PÁGINA DA BANCADA: o hoje e a proposta lado a lado, com o caso, o tema e a marca escolhidos aqui.
function Bancada() {
  const [caso, setCaso] = useState(q.get("caso") ?? "painel-aberto");
  const [tema, setTema] = useState<"light" | "dark">(q.get("tema") === "light" ? "light" : "dark");
  const [marca, setMarca] = useState(MARCAS.includes(q.get("marca") ?? "") ? q.get("marca")! : "aurea");
  const [perto, setPerto] = useState(q.get("perto") !== "0");
  const url = (fix: number) => `marca.html?quadro=1&caso=${caso}&fix=${fix}&tema=${tema}&marca=${marca}`;
  const escala = perto ? 2 : 1;
  return <div className="bench-pagina">
    <style>{`
      .bench-pagina { display:grid; gap:var(--space-4); padding:var(--space-4); min-height:100vh; background:var(--background); color:var(--foreground); }
      .bench-ctl { display:flex; flex-wrap:wrap; gap:var(--space-3) var(--space-5); align-items:center; }
      .bench-ctl label { display:grid; gap:var(--space-1); font-size:var(--text-sm); }
      .bench-par { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:var(--space-4); }
      .bench-par h2 { margin:0 0 var(--space-2); font-size:var(--text-2xl); }
      .bench-janela { overflow:auto; border-radius:var(--radius-card); block-size:${perto ? 1000 : 820}px; background:var(--card); }
      .bench-escala { inline-size:${1280 * escala}px; block-size:${820 * escala}px; }
      .bench-janela iframe { border:0; inline-size:1280px; block-size:820px; transform:scale(${escala}); transform-origin:0 0; }
    `}</style>
    <div className="bench-ctl">
      <label>Caso<Select aria-label="Caso" value={caso} onValueChange={(v) => setCaso(v)} items={CASOS.map((c) => ({value: c.id, label: c.nome}))} /></label>
      <label>Marca<Select aria-label="Marca" value={marca} onValueChange={(v) => setMarca(v)} items={MARCAS.map((m) => ({value: m, label: m === "aurea" ? "Aurea Gold" : m === "ember" ? "Aurea Ember" : m}))} /></label>
      <label>Tema<SegmentedControl label="Tema" value={tema} onChange={(v) => setTema(v as "light" | "dark")} items={[{value: "light", label: "Claro"}, {value: "dark", label: "Escuro"}]} /></label>
      <label>Tamanho<SegmentedControl label="Tamanho" value={perto ? "2" : "1"} onChange={(v) => setPerto(v === "2")} items={[{value: "2", label: "Grande (2×)"}, {value: "1", label: "Real"}]} /></label>
    </div>
    <div className="bench-par">
      <section><h2>Hoje</h2><div className="bench-janela"><div className="bench-escala"><iframe title="Hoje" src={url(0)} /></div></div></section>
      <section><h2>Proposta</h2><div className="bench-janela"><div className="bench-escala"><iframe title="Proposta" src={url(1)} /></div></div></section>
    </div>
  </div>;
}

const quadro = q.get("quadro") === "1";
const tema = q.get("tema") === "light" ? "light" : "dark";
const marca = q.get("marca") ?? "aurea";
if (quadro && marca !== "aurea") document.documentElement.dataset.brand = marca;
createRoot(document.getElementById("root")!).render(<StrictMode><AureaProvider theme={quadro ? tema : "dark"} spriteUrl={SPRITE}>{quadro ? <Quadro /> : <Bancada />}</AureaProvider></StrictMode>);
