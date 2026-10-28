// BANCO DOS ESTILOS — o passo B das cores (ADR-0084, 27/10/2026): as peças de verdade em todos os estilos que o Victor
// aprovou em 26/10/2026 — o botão ligado em três, o segmento aceso em seis, a linha do tempo em cinco e o item atual da
// barra de baixo em treze. O tema vem de `?tema=dark`; a marca, de `?marca=lory` (ela não muda: os estilos não a alcançam).
// A barra de baixo tem os botões de forma (`indicator`) e de lugar (`variant`) no topo — e `?ind=` e `?var=` no endereço.
//
// Como os outros bancos, este não afirma nada: monta. Quem afirma é `tests/visual/paleta-passo-b.spec.ts`; cada peça
// medida leva `data-prova`.
import {StrictMode, useState} from "react";
import {createRoot} from "react-dom/client";
import {
  AureaProvider, Badge, BottomNav, SegmentedControl, Timeline, Toggle, ToggleGroup, Toolbar, ToolbarButton,
  type BottomNavCurrentStyle, type BottomNavIndicator, type SegmentedControlSelectedStyle, type TimelineVariant,
  type TogglePressedStyle,
} from "@aurea-uds/react";
import "@aurea-uds/core/css";

const q = new URLSearchParams(location.search);
const tema = q.get("tema") === "dark" ? "dark" : "light";
const marca = q.get("marca");
if (marca) document.documentElement.setAttribute("data-brand", marca);
const SPRITE = new URL("../../../packages/icons/dist/aurea-icons.svg", location.href).href;


const LIGADO: TogglePressedStyle[] = ["brand", "neutral", "contrast"];
const SEGMENTO: SegmentedControlSelectedStyle[] = ["current", "neutral", "contrast", "brand", "ring", "dot"];
const LINHA: TimelineVariant[] = ["default", "ring", "latest", "time", "contrast"];
const ATUAL: BottomNavCurrentStyle[] = ["current", "neutral", "contrast", "brand", "ring", "plain", "brand-white", "white-ring",
  "brand-gradient", "bar-ink", "bar-ring", "bar-plain", "bar-light"];
const FORMAS: BottomNavIndicator[] = ["none", "subtle", "pill", "circle", "circle-raised", "circle-outline", "circle-bold", "capsule", "expand"];
const ITENS = [
  {id: "home", label: "Home", icon: "house" as const},
  // O contador é o `<Badge size="xs">` (o contrato do componente, como no site), vermelho como no nativo (o Victor,
  // 28/10/2026: "Vermelho, igual"); o ponto vazio é o "tem novidade".
  {id: "alerts", label: "Alerts", icon: "bell" as const, badge: <Badge size="xs" variant="danger" emphasis="solid">3</Badge>},
  {id: "saved", label: "Saved", icon: "heart" as const, badge: ""},
  {id: "me", label: "Profile", icon: "user" as const},
];
const PERIODOS = [{value: "day", label: "Day"}, {value: "week", label: "Week"}, {value: "month", label: "Month"}];
const EVENTOS = [
  {title: "Created", time: "09:02", description: "Drafted by Writer."},
  {title: "Reviewed", time: "10:41", description: "Two comments resolved."},
  {title: "Published", time: "11:15"},
];

function Rotulo({children}: {children: string}) {
  return <code style={{fontSize: "var(--text-xs)", color: "var(--muted-foreground)", minInlineSize: "8rem"}}>{children}</code>;
}

function Barra({estilo, forma, lugar}: {estilo: BottomNavCurrentStyle; forma: BottomNavIndicator; lugar: "floating" | "edge"}) {
  const [atual, setAtual] = useState("alerts");
  return <div data-prova={`bn-${estilo}`} style={{display: "grid", gap: "var(--space-1)", inlineSize: "min(24rem, 100%)"}}>
    <Rotulo>{estilo}</Rotulo>
    <BottomNav label={`Menu ${estilo}`} current={atual} currentStyle={estilo} indicator={forma} variant={lugar}
      items={ITENS.map((it) => ({...it, onClick: () => setAtual(it.id)}))} />
  </div>;
}

function Bancada() {
  const [forma, setForma] = useState<BottomNavIndicator>((q.get("ind") as BottomNavIndicator) ?? "capsule");
  const [lugar, setLugar] = useState<"floating" | "edge">(q.get("var") === "edge" ? "edge" : "floating");
  const [periodo, setPeriodo] = useState("week");
  // `?so=barra` (só na bancada): só a barra de baixo, para comparar as alturas lado a lado.
  const so = q.get("so");
  return <main style={{display: "grid", gap: "var(--space-8)", padding: "var(--space-6)"}}>
    {so !== "barra" && <>
    <section style={{display: "grid", gap: "var(--space-3)"}}>
      <h2>The pressed button — pressedStyle</h2>
      {LIGADO.map((v) => <div key={v} data-prova={`ligado-${v}`} style={{display: "flex", flexWrap: "wrap", gap: "var(--space-3)", alignItems: "center"}}>
        <Rotulo>{v}</Rotulo>
        <Toggle defaultPressed pressedStyle={v}>Bold</Toggle>
        <Toggle pressedStyle={v}>Italic</Toggle>
        <ToggleGroup label={`Align ${v}`} defaultValue={["left"]} pressedStyle={v}>
          <Toggle value="left" icon="text-align-left" label="Align left" />
          <Toggle value="center" icon="text-align-center" label="Center" />
        </ToggleGroup>
        <Toolbar label={`Format ${v}`} pressedStyle={v}><ToolbarButton pressed>Bold</ToolbarButton><ToolbarButton>Italic</ToolbarButton></Toolbar>
      </div>)}
    </section>
    <section style={{display: "grid", gap: "var(--space-3)"}}>
      <h2>The selected segment — selectedStyle</h2>
      {SEGMENTO.map((v) => <div key={v} data-prova={`seg-${v}`} style={{display: "flex", gap: "var(--space-3)", alignItems: "center"}}>
        <Rotulo>{v}</Rotulo>
        <SegmentedControl label={`Period ${v}`} items={PERIODOS} value={periodo} onChange={setPeriodo} selectedStyle={v} />
      </div>)}
    </section>
    <section style={{display: "grid", gap: "var(--space-3)"}}>
      <h2>The timeline — variant</h2>
      <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(16rem, 1fr))", gap: "var(--space-6)"}}>
        {LINHA.map((v) => <div key={v} data-prova={`linha-${v}`} style={{display: "grid", gap: "var(--space-2)", alignContent: "start"}}>
          <Rotulo>{v}</Rotulo><Timeline variant={v} items={EVENTOS} />
        </div>)}
      </div>
    </section>
    </>}
    <section style={{display: "grid", gap: "var(--space-3)"}}>
      <h2>The current item of the bottom bar — currentStyle</h2>
      <div style={{display: "flex", flexWrap: "wrap", gap: "var(--space-3)", alignItems: "center"}}>
        <SegmentedControl label="Shape" size="sm" items={FORMAS.map((f) => ({value: f, label: f}))} value={forma}
          onChange={(v) => setForma(v as BottomNavIndicator)} />
        <SegmentedControl label="Place" size="sm" items={[{value: "floating", label: "floating"}, {value: "edge", label: "edge"}]}
          value={lugar} onChange={(v) => setLugar(v as "floating" | "edge")} />
      </div>
      <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(24rem, 1fr))", gap: "var(--space-4)"}}>
        {ATUAL.map((v) => <Barra key={`${v}-${forma}-${lugar}`} estilo={v} forma={forma} lugar={lugar} />)}
      </div>
    </section>
  </main>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AureaProvider spriteUrl={SPRITE} theme={tema}><Bancada /></AureaProvider>
  </StrictMode>,
);
