// BANCO DA PALETA — o passo A das cores (ADR-0083, 27/10/2026): as peças de verdade que a paleta da 1.0 toca, família por
// família, como a bancada da proposta do Victor (ações, seleção, navegação, campos, links, avisos e dados). O tema vem de
// `?tema=dark`; a marca, de `?marca=lory` (ela tem de sair IGUAL à 0.44.0).
// Só para a bancada humana: `?foco=grafite` mostra o foco dos campos no grafite (a alternativa à decisão "c"), e
// `?contraste=simulado` liga as regras do "aumentar contraste" sem mexer no sistema. Os testes usam a preferência de
// verdade (o Playwright emula `prefers-contrast: more`).
//
// Como os outros bancos, este não afirma nada: monta. Quem afirma é `tests/visual/paleta-passo-a.spec.ts` e
// `tests/visual/lory-congelada.spec.ts`; cada peça medida leva `data-prova`.
import {StrictMode, useEffect, type ReactNode} from "react";
import {createRoot} from "react-dom/client";
import {
  Alert, AureaProvider, Badge, BottomNav, Breadcrumb, Button, Card, Checkbox, Input, Link, Pagination, RadioGroup,
  SearchField, SegmentedControl, Select, Slider, Switch, Tabs, Text, Textarea, Timeline, Toggle, ToggleGroup, Toolbar,
  ToolbarButton,
} from "@aurea-uds/react";
import "@aurea-uds/core/css";

const q = new URLSearchParams(location.search);
const tema = q.get("tema") === "dark" ? "dark" : "light";
const marca = q.get("marca");
if (marca) document.documentElement.setAttribute("data-brand", marca);
const SPRITE = new URL("../../../packages/icons/dist/aurea-icons.svg", location.href).href;

/** Só na bancada: copia as regras de dentro de `@media (prefers-contrast:more)` para uma folha sem condição. */
function SimularContraste() {
  useEffect(() => {
    const regras: string[] = [];
    const varrer = (lista: CSSRuleList) => {
      for (const r of Array.from(lista)) {
        if (r instanceof CSSMediaRule && /prefers-contrast:\s*more/.test(r.conditionText)) {
          for (const dentro of Array.from(r.cssRules)) regras.push(dentro.cssText);
        } else if ("cssRules" in r && (r as CSSGroupingRule).cssRules) varrer((r as CSSGroupingRule).cssRules);
      }
    };
    for (const folha of Array.from(document.styleSheets)) { try { varrer(folha.cssRules); } catch { /* folha de outro endereço */ } }
    const el = document.createElement("style");
    el.dataset.bancada = "contraste";
    el.textContent = `@layer aurea { ${regras.join("\n")} }`;
    document.head.append(el);
    return () => el.remove();
  }, []);
  return null;
}

const Familia = ({titulo, children}: {titulo: string; children: ReactNode}) => (
  <section className="bench-familia"><h2>{titulo}</h2><div className="bench-pecas">{children}</div></section>
);

const ITENS_NAV = [
  {id: "home", label: "Home", icon: "house" as const},
  {id: "search", label: "Search", icon: "magnifying-glass" as const},
  {id: "inbox", label: "Inbox", icon: "tray" as const},
  {id: "profile", label: "Profile", icon: "user" as const},
];

function Campos({onde}: {onde: string}) {
  return <div className="bench-campos" data-prova={`campos-${onde}`}>
    <Input placeholder="name@company.com" aria-label={`E-mail (${onde})`} data-prova={`input-${onde}`} />
    <Select placeholder="Choose one" aria-label={`Plan (${onde})`} items={[{value: "a", label: "Starter"}, {value: "b", label: "Pro"}]} />
    <SearchField placeholder="Search" aria-label={`Search (${onde})`} />
    <Textarea placeholder="Notes" aria-label={`Notes (${onde})`} rows={2} />
  </div>;
}

function Bancada() {
  return <main className="bench-paleta">
    <style>{`
      body { margin:0; background:var(--background); color:var(--foreground); font-family:var(--font-ui); }
      .bench-paleta { display:grid; gap:var(--space-6); padding:var(--space-6); max-width:72rem; margin:0 auto; }
      .bench-familia h2 { margin:0 0 var(--space-3); font-size:var(--text-sm); color:var(--muted-foreground); text-transform:uppercase; letter-spacing:var(--tracking-wide); }
      .bench-pecas { display:flex; flex-wrap:wrap; align-items:center; gap:var(--space-4); }
      .bench-campos { display:grid; grid-template-columns:repeat(auto-fit, minmax(12rem, 1fr)); gap:var(--space-3); flex:1 1 100%; }
      .bench-graficos { display:flex; gap:var(--space-2); }
      .bench-graficos span { inline-size:var(--space-10); block-size:var(--space-10); border-radius:var(--radius-sm); }
      .bench-barra { position:relative; inline-size:22rem; }
      .bench-barra .bottom-nav { position:static; }
      ${q.get("foco") === "grafite" ? `
      [data-theme="light"] :is(.input,.textarea,.select):focus-visible, [data-theme="light"] :is(.input-group,.combobox-multi):focus-within { outline-color:var(--focus-strong) !important; }` : ""}
    `}</style>
    {q.get("contraste") === "simulado" && <SimularContraste />}

    <Familia titulo="Ações">
      <Button tone="brand" data-prova="botao-primario">Primary</Button>
      <Button appearance="soft" tone="brand">Soft</Button>
      <Button appearance="outline" tone="brand">Outline</Button>
      <Button appearance="ghost" tone="brand">Ghost</Button>
      <Button variant="link-primary">Link button</Button>
      <Toggle defaultPressed data-prova="toggle-ligado">Bold</Toggle>
      <Toggle data-prova="toggle-desligado">Italic</Toggle>
      <ToggleGroup defaultValue={["left"]} label="Align">
        <Toggle value="left">Left</Toggle><Toggle value="center">Center</Toggle><Toggle value="right">Right</Toggle>
      </ToggleGroup>
      <Toolbar label="Format">
        <ToolbarButton pressed data-prova="toolbar-ligado">Bold</ToolbarButton><ToolbarButton>Italic</ToolbarButton>
      </Toolbar>
    </Familia>

    <Familia titulo="Seleção">
      <Switch defaultChecked label="Wi-Fi" data-prova="switch" />
      <Checkbox defaultChecked label="Remember me" data-prova="checkbox" />
      <RadioGroup label="Plan" defaultValue="pro" orientation="horizontal">
        <RadioGroup.Item value="free" label="Free" /><RadioGroup.Item value="pro" label="Pro" />
      </RadioGroup>
      <Slider label="Volume" defaultValue={40} data-prova="slider" />
    </Familia>

    <Familia titulo="Navegação">
      <SegmentedControl label="Period" value="month" items={[{value: "day", label: "Day"}, {value: "month", label: "Month"}, {value: "year", label: "Year"}]} />
      <Tabs label="Sections" value="a" tabs={[{value: "a", label: "Overview"}, {value: "b", label: "Activity"}]} />
      <Breadcrumb items={[{label: "Home", href: "#home"}, {label: "Docs", href: "#docs"}, {label: "Colors"}]} />
      <Pagination page={2} total={5} />
      <span className="eyebrow" data-prova="eyebrow">New in 1.0</span>
      <div className="bench-barra"><BottomNav items={ITENS_NAV} current="home" indicator="circle-outline" /></div>
      <div className="bench-barra"><BottomNav items={ITENS_NAV} current="search" indicator="capsule" /></div>
    </Familia>

    <Familia titulo="Campos — na página">
      <Campos onde="pagina" />
    </Familia>
    <Card data-prova="cartao">
      <Familia titulo="Campos — dentro do cartão">
        <Campos onde="cartao" />
      </Familia>
    </Card>

    <Familia titulo="Links">
      <p data-prova="prosa">Read the <a href="#guide" data-prova="link-prosa">getting started guide</a> before you install the packages.</p>
      <p data-link="underline">The variation: <a href="#var" data-prova="link-variacao">an underlined link</a> in running text.</p>
      <Link href="#component" data-prova="link-componente">The Link component</Link>
      <Text tone="link" data-prova="texto-link">Text in the link tone</Text>
      <nav aria-label="Footer"><a href="#nav" data-prova="link-nav">A link inside a nav</a></nav>
    </Familia>

    <Familia titulo="Avisos e dados">
      <Badge variant="primary" emphasis="outline" data-prova="selo-contorno">Outline</Badge>
      <Badge variant="primary" emphasis="solid">Solid</Badge>
      <Badge variant="primary">Soft</Badge>
      <Alert variant="accent" title="Heads up">The accent alert follows the link colour.</Alert>
      <Timeline items={[{title: "Order placed", time: "09:15"}, {title: "Payment approved", time: "09:16", description: "Visa •••• 4242"}, {title: "Shipped", time: "11:40"}]} />
      <ul className="health-matrix" aria-label="Health"><li className="health-cell warn" data-prova="saude-atencao"><span className="health-name">Queue</span></li></ul>
      <div className="bench-graficos" aria-label="Chart colours">
        {[1, 2, 3, 4, 5].map((n) => <span key={n} style={{background: `var(--chart-${n})`}} />)}
      </div>
    </Familia>
  </main>;
}

createRoot(document.getElementById("root")!).render(<StrictMode><AureaProvider theme={tema} spriteUrl={SPRITE}><Bancada /></AureaProvider></StrictMode>);
