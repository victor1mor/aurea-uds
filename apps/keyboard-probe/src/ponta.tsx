// BANCO DA PONTA DA BARRA DE CIMA — MNT-37. O `AppShell` de verdade com o `topbarActions`: a chave de tema (e o que mais o
// app quiser) no FIM da barra, longe do botão de recolher e do título. A moldura, o arranjo, o conteúdo da barra e a
// direção se trocam na própria página, ou vêm do endereço (`?moldura=app&lateral=floating&barra=ponta&dir=rtl`). A chave
// de tema troca o tema de verdade. O botão de recolher só aparece a partir de 1024 de largura, com mouse.
import {StrictMode, useState} from "react";
import {createRoot} from "react-dom/client";
import {AppShell, AureaProvider, Avatar, Card, IconButton, SegmentedControl, Sidebar, ThemeToggle} from "@aurea-uds/react";
import "@aurea-uds/core/css";

const q = new URLSearchParams(location.search);
const SPRITE = new URL("../../../packages/icons/dist/aurea-icons.svg", location.href).href;
const ITENS = [
  {id: "painel", label: "Dashboard", icon: "squares-four", href: "#painel"},
  {id: "dispositivos", label: "Devices", icon: "desktop-tower", href: "#dispositivos", badge: "3"},
  {id: "mapa", label: "Network map", icon: "graph", href: "#mapa"},
  "separator",
  {id: "ajustes", label: "Settings", icon: "gear", href: "#ajustes"},
] as const;

function Banco() {
  const [moldura, setMoldura] = useState<"sidebar" | "app">(q.get("moldura") === "app" ? "app" : "sidebar");
  const [lateral, setLateral] = useState<"flush" | "floating">(q.get("lateral") === "floating" ? "floating" : "flush");
  // O que a barra leva: o título e a ponta (o caso do app), só a ponta, ou a ponta com mais de uma ação.
  const [barra, setBarra] = useState<"titulo" | "ponta" | "varias">(q.get("barra") === "ponta" ? "ponta" : q.get("barra") === "varias" ? "varias" : "titulo");
  const [dir, setDir] = useState<"ltr" | "rtl">(q.get("dir") === "rtl" ? "rtl" : "ltr");
  document.documentElement.dir = dir;
  const ponta = barra === "varias"
    ? <><IconButton icon="bell" label="Notifications" /><ThemeToggle /><Avatar fallback="KM" alt="Kate Moore" size="sm" /></>
    : <ThemeToggle />;
  return (
    <AureaProvider defaultTheme={q.get("tema") === "dark" ? "dark" : "light"} direction={dir} spriteUrl={SPRITE}>
      <AppShell key={moldura + dir} layout={moldura}
        brand={moldura === "sidebar" ? <Sidebar.Brand logo="R" name="Rede" description="Network" /> : <strong>Rede</strong>}
        navItems={[...ITENS]} currentNavId="dispositivos" sidebarCollapsible
        sidebarVariant={lateral === "flush" ? "flush" : undefined}
        sidebarFooter={<Sidebar.User avatar={<Avatar fallback="KM" alt="" />} name="Kate Moore" description="Admin"
          action={<IconButton icon="sign-out" label="Log out" size="sm" />} />}
        topbar={barra === "ponta" ? undefined : <strong>Devices</strong>}
        topbarActions={ponta}>
        <Card>
          <h1 style={{margin: 0}}>A ponta da barra de cima — MNT-37</h1>
          <p>A chave de tema vai no <code>topbarActions</code> do <code>AppShell</code> e fica no FIM da barra, longe do botão
            de recolher e do título. Clique nela: o tema troca de verdade. Abaixo de 1024 de largura, a lateral vira gaveta, e
            a ponta continua no fim da barra.</p>
          <div style={{display: "grid", gap: "var(--space-3)", justifyItems: "start"}}>
            <SegmentedControl label="Moldura" value={moldura} onChange={(v) => setMoldura(v as "sidebar" | "app")}
              items={[{value: "sidebar", label: "Lateral até o topo"}, {value: "app", label: "Barra de cima inteira"}]} />
            <SegmentedControl label="Arranjo" value={lateral} onChange={(v) => setLateral(v as "flush" | "floating")}
              items={[{value: "flush", label: "Canto reto"}, {value: "floating", label: "Flutuante"}]} />
            <SegmentedControl label="Barra" value={barra} onChange={(v) => setBarra(v as "titulo" | "ponta" | "varias")}
              items={[{value: "titulo", label: "Título + tema"}, {value: "ponta", label: "Só o tema"}, {value: "varias", label: "Várias na ponta"}]} />
            <SegmentedControl label="Direção" value={dir} onChange={(v) => setDir(v as "ltr" | "rtl")}
              items={[{value: "ltr", label: "Esquerda → direita"}, {value: "rtl", label: "Direita → esquerda"}]} />
          </div>
        </Card>
      </AppShell>
    </AureaProvider>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><Banco /></StrictMode>);
