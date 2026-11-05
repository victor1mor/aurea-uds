// BANCO DO MOVIMENTO — S-04 e S-05 (05/11/2026). As peças que eram estáticas, para o Victor ver ANDANDO: o escolhido do
// `SegmentedControl` e do `Tabs` que desliza, os menus e a paleta que entram, e o arrasto do `SortableList` e do
// `BlockEditor` que segue o ponteiro. O tema, a marca e "reduzir movimento" vêm do endereço
// (`?tema=dark&marca=ember&reduzir=1`).
import {useState} from "react";

export const q = new URLSearchParams(location.search);
export const SPRITE = new URL("../../../packages/icons/dist/aurea-icons.svg", location.href).href;

// "Reduzir movimento" sem mexer no sistema: a página responde à pergunta do CSS e do código como se a pessoa tivesse
// pedido. Só no banco.
if (q.get("reduzir") === "1") {
  const original = window.matchMedia.bind(window);
  window.matchMedia = (m: string) => m.includes("prefers-reduced-motion")
    ? ({matches: true, media: m, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false} as unknown as MediaQueryList)
    : original(m);
  const st = document.createElement("style");
  st.textContent = "*,*:before,*:after{animation-duration:.01ms!important;transition-duration:.01ms!important}";
  document.head.append(st);
}
document.documentElement.dataset.theme = q.get("tema") === "dark" ? "dark" : "light";
if (q.get("marca")) document.documentElement.dataset.brand = q.get("marca")!;

const titulo = {fontSize: 22, fontWeight: 700, margin: "28px 0 12px"} as const;
const mexe = <T,>(lista: T[], de: number, para: number) => { const n = lista.slice(); const [x] = n.splice(de, 1); n.splice(para, 0, x); return n; };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Banco({A}: {A: any}) {
  const [seg, setSeg] = useState("semana");
  const [seg2, setSeg2] = useState("lista");
  const [aba, setAba] = useState("resumo");
  const [aba2, setAba2] = useState("geral");
  const [paleta, setPaleta] = useState(false);
  const [itens, setItens] = useState([
    {id: "a", label: "Backlog"}, {id: "b", label: "To do"}, {id: "c", label: "In progress"},
    {id: "d", label: "Review"}, {id: "e", label: "Done"},
  ]);
  const [blocos, setBlocos] = useState([
    {id: "x", kind: "Heading", children: <strong style={{fontSize: 20}}>Release notes</strong>},
    {id: "y", kind: "Paragraph", children: <p style={{margin: 0}}>The selected segment now slides between options.</p>},
    {id: "z", kind: "Quote", children: <em>Motion that explains what changed.</em>},
  ]);
  return (
    <A.AureaProvider defaultTheme={q.get("tema") === "dark" ? "dark" : "light"} spriteUrl={SPRITE}>
      <main style={{padding: "8px 24px 200px", fontSize: 18, minHeight: "100vh", background: "var(--background)", color: "var(--foreground)"}}>
        <h2 style={titulo}>1 · SegmentedControl</h2>
        <A.SegmentedControl label="Period" size="lg" value={seg} onChange={setSeg} items={[
          {value: "dia", label: "Day"}, {value: "semana", label: "Week"}, {value: "mes", label: "Month"}, {value: "ano", label: "Year"}]} />
        <div style={{height: 16}} />
        <A.SegmentedControl label="View" size="lg" selectedStyle="brand" value={seg2} onChange={setSeg2} items={[
          {value: "lista", label: "List", icon: "list"}, {value: "grade", label: "Grid view", icon: "squares-four"}, {value: "mapa", label: "Map", icon: "map-trifold"}]} />

        <h2 style={titulo}>2 · Tabs</h2>
        <A.Tabs label="Sections" value={aba} onChange={setAba} panel="plain" tabs={[
          {id: "resumo", label: "Overview", content: <p style={{margin: 0}}>Overview panel</p>},
          {id: "uso", label: "Usage", content: <p style={{margin: 0}}>Usage panel</p>},
          {id: "acessos", label: "Accessibility", content: <p style={{margin: 0}}>Accessibility panel</p>}]} />
        <div style={{height: 16}} />
        <A.Tabs label="Settings" variant="secondary" value={aba2} onChange={setAba2} panel="plain" tabs={[
          {id: "geral", label: "General", content: <p style={{margin: 0}}>General</p>},
          {id: "conta", label: "Account", content: <p style={{margin: 0}}>Account</p>},
          {id: "avisos", label: "Notifications", content: <p style={{margin: 0}}>Notifications</p>}]} />

        <h2 style={titulo}>3 · Menus, Select, Combobox, CommandPalette</h2>
        <div style={{display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center"}}>
          <A.DropdownMenu label="Actions" trigger={<A.Button variant="secondary">Menu</A.Button>} items={[
            {label: "Rename", onClick() {}}, {label: "Duplicate", onClick() {}}, "separator", {label: "Delete", onClick() {}}]} />
          <div style={{width: 200}}>
            <A.Select aria-label="Status" placeholder="Status" items={[
              {value: "open", label: "Open"}, {value: "closed", label: "Closed"}, {value: "draft", label: "Draft"}]} />
          </div>
          <div style={{width: 220}}>
            <A.Combobox aria-label="Fruit" placeholder="Fruit" items={[
              {value: "apple", label: "Apple"}, {value: "banana", label: "Banana"}, {value: "cherry", label: "Cherry"}]} />
          </div>
          <A.Button variant="secondary" onClick={() => setPaleta(true)}>Command palette</A.Button>
        </div>
        <A.ContextMenu label="Context menu" items={[{label: "Copy", onClick() {}}, {label: "Paste", onClick() {}}]}>
          <div style={{marginTop: 12, padding: 20, borderRadius: 22, background: "var(--muted)", textAlign: "center"}}>Right-click here (ContextMenu)</div>
        </A.ContextMenu>
        <A.CommandPalette open={paleta} onClose={() => setPaleta(false)} items={[
          {id: "1", label: "Open settings", run() { setPaleta(false); }},
          {id: "2", label: "New file", run() { setPaleta(false); }},
          {id: "3", label: "Toggle theme", run() { setPaleta(false); }}]} />

        <h2 style={titulo}>4 · SortableList (drag the dots)</h2>
        <A.SortableList label="Stages" items={itens} onReorder={(de: number, para: number) => setItens((l) => mexe(l, de, para))} />

        <h2 style={titulo}>5 · BlockEditor (drag the dots)</h2>
        <A.BlockEditor label="Article" blocks={blocos} onReorder={(de: number, para: number) => setBlocos((l) => mexe(l, de, para))} />
      </main>
    </A.AureaProvider>
  );
}
