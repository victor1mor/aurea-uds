// BANCO DO TOQUE — DOC-11 (16/11/2026; decisão do Victor de 06/10/2026: "onPress nos dois", como a referência e como o
// nativo). Cada peça que se toca, com `onPress`: o contador ao lado sobe a cada toque (clique, Enter ou Espaço). Na
// última linha, a peça com os DOIS (`onPress` e `onClick`): os dois contadores sobem, o `onPress` primeiro. O tema e a
// marca vêm do endereço (`?tema=dark&marca=ember`).
import {StrictMode, useState, type ReactNode} from "react";
import {createRoot} from "react-dom/client";
import {
  AureaProvider, BottomNav, Button, Card, CloseButton, Header, IconButton, NavList, Sidebar, Stepper, Toolbar, ToolbarButton,
} from "@aurea-uds/react";
import "@aurea-uds/core/css";

const q = new URLSearchParams(location.search);
const tema = q.get("tema") === "dark" ? "dark" : "light";
const marca = q.get("marca");
document.documentElement.dataset.theme = tema;
if (marca) document.documentElement.dataset.brand = marca;
const SPRITE = new URL("../../../packages/icons/dist/aurea-icons.svg", location.href).href;

function Linha({nome, peca}: {nome: string; peca: (onPress: () => void) => ReactNode}) {
  const [n, setN] = useState(0);
  return (
    <div data-linha={nome} style={{display: "grid", gridTemplateColumns: "12rem 1fr 6rem", gap: 16, alignItems: "center"}}>
      <code>{nome}</code>
      <div>{peca(() => setN((x) => x + 1))}</div>
      <output aria-live="polite" data-contador>{`onPress: ${n}`}</output>
    </div>
  );
}

function OsDois() {
  const [ordem, setOrdem] = useState<string[]>([]);
  return (
    <div data-linha="os dois" style={{display: "grid", gridTemplateColumns: "12rem 1fr 6rem", gap: 16, alignItems: "center"}}>
      <code>onPress + onClick</code>
      <div><Button onPress={() => setOrdem((o) => [...o, "onPress"])} onClick={() => setOrdem((o) => [...o, "onClick"])}>Both</Button></div>
      <output data-ordem>{ordem.slice(-2).join(" → ") || "—"}</output>
    </div>
  );
}

const ITEM = (f: () => void) => [{id: "a", label: "Home", icon: "house", onPress: f}, {id: "b", label: "Reports", icon: "chart-bar", href: "#b"}] as const;

function Banco() {
  return (
    <AureaProvider defaultTheme={tema} spriteUrl={SPRITE}>
      <main style={{padding: 24, display: "grid", gap: 16, background: "var(--background)", color: "var(--foreground)", minHeight: "100vh"}}>
        <h1>onPress on the web (DOC-11)</h1>
        <Linha nome="Button" peca={(f) => <Button onPress={f}>Save</Button>}/>
        <Linha nome="IconButton" peca={(f) => <IconButton icon="gear" label="Settings" onPress={f}/>}/>
        <Linha nome="CloseButton" peca={(f) => <CloseButton onPress={f}/>}/>
        <Linha nome="ToolbarButton" peca={(f) => <Toolbar label="Text"><ToolbarButton onPress={f}>Bold</ToolbarButton></Toolbar>}/>
        <Linha nome="Card (interactive)" peca={(f) => <Card variant="interactive" render={<button type="button"/>} onPress={f}><strong>March report</strong></Card>}/>
        <Linha nome="Sidebar item" peca={(f) => <Sidebar items={[...ITEM(f)]} label="Main" style={{blockSize: "auto"}}/>}/>
        <Linha nome="NavList item" peca={(f) => <NavList items={[...ITEM(f)]}/>}/>
        <Linha nome="Stepper item" peca={(f) => <Stepper items={[{label: "Account", state: "complete", onPress: f}, {label: "Profile", state: "current"}]}/>}/>
        <Linha nome="BottomNav item" peca={(f) => <BottomNav items={[...ITEM(f)]} current="b" label="Main"/>}/>
        <Linha nome="Header item" peca={(f) => <Header brand={<strong>Acme</strong>} items={[{id: "a", label: "Home", href: "#", onPress: f}]} current="b"/>}/>
        <OsDois/>
      </main>
    </AureaProvider>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><Banco/></StrictMode>);
