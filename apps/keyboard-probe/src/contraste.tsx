// BANCO DA LATERAL DE CONTRASTE — MNT-36 (0.50.0, ADR-0087). O `AppShell` de verdade, com a lateral escura
// (`sidebarContrast`) e o botão de recolher da emenda (`sidebarCollapsible`), que é peça do shell e fica FORA da lateral,
// com as cores da página. A marca, o tema e o arranjo (canto reto ou flutuante) se trocam na própria página, ou vêm do
// endereço (`?marca=ember&tema=light&lateral=flush`). O botão de recolher só aparece a partir de 1024 de largura, com mouse.
import {StrictMode, useState} from "react";
import {createRoot} from "react-dom/client";
import {AppShell, AureaProvider, Avatar, Button, Card, IconButton, SegmentedControl, Sidebar} from "@aurea-uds/react";
import "@aurea-uds/core/css";

const q = new URLSearchParams(location.search);
const SPRITE = new URL("../../../packages/icons/dist/aurea-icons.svg", location.href).href;
const MARCAS = ["aurea", "ember", "sun", "honey", "orange", "magenta", "violet", "indigo", "cobalt", "cyan", "turquoise", "emerald", "lime"];
const ITENS = [
  {id: "painel", label: "Dashboard", icon: "squares-four", href: "#painel"},
  {id: "pedidos", label: "Requests", icon: "tray", href: "#pedidos", badge: "3"},
  {id: "contratos", label: "Contracts", icon: "file-text", href: "#contratos"},
  "separator",
  {id: "ajustes", label: "Settings", icon: "gear", href: "#ajustes"},
] as const;

function Banco() {
  const [marca, setMarca] = useState(MARCAS.includes(q.get("marca") ?? "") ? q.get("marca")! : "aurea");
  const [tema, setTema] = useState<"light" | "dark">(q.get("tema") === "dark" ? "dark" : "light");
  const [lateral, setLateral] = useState<"flush" | "floating">(q.get("lateral") === "floating" ? "floating" : "flush");
  // A moldura: a lateral do alto até embaixo (o botão no começo da barra do conteúdo) ou a barra de cima inteira (o botão
  // na emenda da lateral com o conteúdo). Nas duas, o botão é do `AppShell` e fica fora da lateral.
  const [moldura, setMoldura] = useState<"sidebar" | "app">(q.get("moldura") === "app" ? "app" : "sidebar");
  if (marca === "aurea") delete document.documentElement.dataset.brand; else document.documentElement.dataset.brand = marca;
  return (
    <AureaProvider theme={tema} spriteUrl={SPRITE}>
      <AppShell key={moldura} layout={moldura}
        brand={moldura === "sidebar" ? <Sidebar.Brand logo="A" name="Acme" description="Workspace" /> : <strong>Acme</strong>}
        navItems={[...ITENS]} currentNavId="painel" sidebarContrast sidebarCollapsible
        sidebarVariant={lateral === "flush" ? "flush" : undefined}
        sidebarFooter={<Sidebar.User avatar={<Avatar fallback="KM" alt="" />} name="Kate Moore" description="Admin"
          action={<IconButton icon="sign-out" label="Log out" size="sm" />} />}
        topbar={<strong>Dashboard</strong>}>
        <Card>
          <h1 style={{margin: 0}}>Lateral escura — MNT-36</h1>
          <p>O botão de recolher fica fora da lateral, no alto: na "lateral até o topo", no começo da barra do conteúdo; na
            "barra de cima inteira", o botão redondo na emenda da lateral com o conteúdo. Ele é do <code>AppShell</code> e fica
            com as cores da página. Clique nele: a lateral recolhe e abre.</p>
          <div style={{display: "grid", gap: "var(--space-3)", justifyItems: "start"}}>
            <SegmentedControl label="Tema" value={tema} onChange={(v) => setTema(v as "light" | "dark")}
              items={[{value: "light", label: "Claro"}, {value: "dark", label: "Escuro"}]} />
            <SegmentedControl label="Arranjo" value={lateral} onChange={(v) => setLateral(v as "flush" | "floating")}
              items={[{value: "flush", label: "Canto reto"}, {value: "floating", label: "Flutuante"}]} />
            <SegmentedControl label="Moldura" value={moldura} onChange={(v) => setMoldura(v as "sidebar" | "app")}
              items={[{value: "sidebar", label: "Lateral até o topo"}, {value: "app", label: "Barra de cima inteira"}]} />
            <div style={{display: "flex", flexWrap: "wrap", gap: "var(--space-2)"}} role="group" aria-label="Marca">
              {MARCAS.map((m) => <Button key={m} size="sm" variant={m === marca ? "primary" : "secondary"} aria-pressed={m === marca}
                onClick={() => setMarca(m)}>{m === "aurea" ? "Aurea" : m[0].toUpperCase() + m.slice(1)}</Button>)}
            </div>
          </div>
        </Card>
      </AppShell>
    </AureaProvider>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><Banco /></StrictMode>);
