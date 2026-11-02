// A PÁGINA INICIAL DO SITE B — as partes VIVAS (02/11/2026; o desenho aprovado em 26/10/2026 e as peças da bancada de
// 01/11/2026: D-7.1 a D-7.7).
//
// UM arquivo para os dois lados, como a `vitrine-componentes.mjs`: o gerador (`site-b/paginas/inicio.mjs`) desenha cada
// parte pronta na página (sem JavaScript ela já está lá), e o `home.js` (`inicio.tsx`) a troca pela viva, por portal, sob
// o provedor ÚNICO do site. `.mjs` com `createElement`, porque o gerador roda no Node sem compilar JSX.
//
// Só peças da Aurea. O que é do site é o arranjo: as classes `inicio-*` (em `site-b/css/inicio.css`). Nenhuma peça muda
// aqui: o que o desenho pedia além do que a Aurea tem está no relatório da sessão.
import {createElement as h, Fragment, useState} from "react";
import {
  Accordion, Alert, Avatar, AvatarGroup, Badge, BottomNav, Breadcrumb, Button, Card, Checkbox, CloseButton, ColorSwatch,
  Field, Icon, IconButton, Input, KPI, Link, ListBox, OTPField, Pagination, Radio, RadioGroup, SegmentedControl, Select,
  Slider, Switch, Table, Textarea, Toggle, ToggleGroup, Toolbar, ToolbarGroup, ToolbarButton, Tooltip, useAureaTheme,
} from "../../../packages/react/dist/index.js";

const nada = () => {};
// O ladrilho redondo com o ícone na cor de categoria — o mesmo da Introduction (`intro-tile`, do gerador).
const ladrilho = (icone, cor, extra = "") => h("span", {className: `intro-tile ${extra}`.trim(), "data-cor": cor}, h(Icon, {name: icone}));

// O PREÇO é um só nas duas peças que o mostram (o controle que flutua e o da família 02), como no desenho: "Same value as
// the floating slider above". A chave de avisos também (a do palco e o aviso ao lado dela).
const PRECO = {min: 0, max: 1000, step: 10, format: {style: "currency", currency: "USD"}, locale: "en-US"};

// ── O PALCO: as sete peças que flutuam em volta do texto ─────────────────────────────────────────────────────────────
const MESES = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const RECEITA = [5.1, 6.4, 7.9, 6.8, 9.6, 12.4];
const BARRAS = MESES.map((m, i) => ({label: m, value: `$${RECEITA[i].toFixed(1)}k`, amount: RECEITA[i]}));
const NAVEGACAO = [["home", "Home", "house"], ["reports", "Reports", "chart-line"], ["settings", "Settings", "gear"], ["profile", "Profile", "user"]];
const CLUBE = [["A", "info"], ["B", "success"], ["C", "brand"], ["D", "warning"], ["E", "danger"], ["F", "info"], ["G", "neutral"]];

// Cada peça numa "boia" (a flutuação devagar da Introduction) dentro de um lugar com profundidade (`data-fundo`: o quanto
// ela segue o ponteiro — o `catalog.js` move quem está no `[data-palco]`). O lugar e a boia ficam na página; o que o
// `home.js` troca pela peça viva é só o miolo (`data-inicio-peca`), para o `catalog.js` continuar segurando o lugar.
export const PECAS = [["perfil", "0.8"], ["kpi", "1.3"], ["chave", "1.6"], ["aviso", "2"], ["barra", "1"], ["preco", "1.4"], ["clube", "0.6"]];

export function PecaDoPalco({nome, preco = 250, setPreco = nada, avisos = true, setAvisos = nada}) {
  const [aba, setAba] = useState("home");
  switch (nome) {
    case "perfil": return h(Card, {className: "inicio-flutua"},
      h("div", {className: "inicio-linha"},
        h(Avatar, {fallback: "C", tone: "brand", emphasis: "soft"}),
        h("div", {className: "inicio-quem"},
          h("p", {className: "inicio-forte"}, "Curator", h(Icon, {name: "seal-check", weight: "fill", className: "inicio-selo"}),
            h("span", {className: "sr-only"}, ", verified")),
          h("p", {className: "inicio-nota"}, "@curator")),
        h(IconButton, {icon: "pencil-simple", label: "Edit profile", variant: "tertiary", size: "sm"})),
      h("p", {className: "inicio-bio"}, "Collecting the best of UI for web & mobile."));
    case "kpi": return h(KPI, {variant: "brand", label: "Revenue", value: "$48.2k", trend: "+12%", direction: "up",
      bars: BARRAS, defaultBar: 5, className: "inicio-kpi"});
    case "chave": return h(Card, {className: "inicio-flutua inicio-capsula"},
      ladrilho("bell", "blue", "intro-tile-sm"),
      h(Switch, {label: "Allow notifications", indicatorPlacement: "end", checked: avisos,
        onChange: (e) => setAvisos(e.target.checked), className: "inicio-chave"}));
    case "aviso": return h(Card, {className: "inicio-flutua inicio-capsula inicio-aviso", role: "status"},
      ladrilho("check", "green", "intro-tile-sm"), avisos ? "Notifications on" : "Notifications off");
    case "barra": return h(BottomNav, {label: "Example bottom navigation", indicator: "circle-bold", current: aba,
      className: "inicio-barra", items: NAVEGACAO.map(([id, label, icon]) => ({id, label, icon, onClick: () => setAba(id)}))});
    case "preco": return h(Card, {className: "inicio-flutua inicio-preco"},
      h(Slider, {label: "Price", showValue: true, value: preco, onValueChange: setPreco, ...PRECO}));
    case "clube": return h(Card, {className: "inicio-flutua inicio-capsula"},
      h(AvatarGroup, {max: 4, label: "Design Club members"},
        ...CLUBE.map(([l, t]) => h(Avatar, {key: l, fallback: l, tone: t, emphasis: "soft"}))),
      h("div", null, h("p", {className: "inicio-forte"}, "Design Club"), h("p", {className: "inicio-nota"}, "148 members")));
    default: return null;
  }
}

// As sete, cada uma no seu lugar (o desenho parado do gerador).
export function PecasDoPalco() {
  return h(Fragment, null, ...PECAS.map(([nome, fundo]) => h("div", {key: nome, className: `intro-peca inicio-peca inicio-peca-${nome}`, "data-fundo": fundo},
    h("div", {className: "intro-boia"}, h("div", {className: "inicio-peca-miolo", "data-inicio-peca": nome}, h(PecaDoPalco, {nome}))))));
}

// ── AS CINCO FAMÍLIAS: o acordeão de lado (D-7.1), cheio e vivo ──────────────────────────────────────────────────────
// As demonstrações são as da bancada aprovada (01/11/2026, "Pode"): todos os exemplos do desenho, com as peças reais.
const demo = (rot, ...corpo) => h("div", {className: "inicio-dm"}, h("p", {className: "inicio-dm-rot"}, rot), ...corpo);
const largo = (rot, ...corpo) => h("div", {className: "inicio-dm inicio-dm-largo"}, h("p", {className: "inicio-dm-rot"}, rot), ...corpo);
const fila = (...filhos) => h("div", {className: "inicio-fila"}, ...filhos);
const filaEntre = (...filhos) => h("div", {className: "inicio-fila inicio-fila-entre"}, ...filhos);

function Acoes() {
  const [gostei, setGostei] = useState(false);
  return h(Fragment, null,
    largo("Button", fila(...["primary", "secondary", "tertiary", "danger", "danger-soft", "ghost"].map((v) => h(Button, {key: v, variant: v}, "Click me")))),
    demo("IconButton", fila(
      h(Toggle, {icon: "heart", label: "Like", pressed: gostei, onPressedChange: setGostei}),
      h(IconButton, {icon: "export", label: "Share", variant: "secondary"}),
      h(IconButton, {icon: "plus", label: "Add", variant: "primary"}),
      h(IconButton, {icon: "trash", label: "Delete", variant: "ghost"})),
      h("p", {className: "inicio-nota"}, "The round button is for icons only.")),
    demo("CloseButton · Link",
      filaEntre(h("span", {className: "inicio-forte"}, "Dismiss this"), h(CloseButton, {label: "Dismiss"})),
      h("p", {className: "inicio-forte"}, h(Link, {href: "./link.html"}, "Read the docs →"))),
    largo("Card · Button",
      filaEntre(h("div", null, h("p", {className: "inicio-forte"}, "Create an account"),
        h("p", {className: "inicio-nota"}, "Start your free 7-day trial. No credit card required.")),
      fila(h(Button, {variant: "primary"}, "Get Started"), h(Button, {variant: "tertiary", leadingIcon: "key"}, "Continue with a passkey")))));
}

const ESTADOS = [["california", "California"], ["ceara", "Ceará"], ["ontario", "Ontario"], ["texas", "Texas"]].map(([value, label]) => ({value, label}));
function Campos({preco, setPreco, avisos, setAvisos}) {
  return h(Fragment, null,
    demo("Input", h(Field, {label: "Your email", required: true, description: "We won't share your email"},
      h(Input, {type: "email", placeholder: "john@email.com", autoComplete: "off"}))),
    demo("Select", h(Field, {label: "State", required: true}, h(Select, {placeholder: "Select one", items: ESTADOS}))),
    demo("Checkbox · Switch · Radio",
      fila(h(Checkbox, {label: "Checkbox", defaultChecked: true}),
        h(Switch, {label: "Switch", checked: avisos, onChange: (e) => setAvisos(e.target.checked)})),
      h(RadioGroup, {label: "Radio example", labelHidden: true, orientation: "horizontal", defaultValue: "one"},
        h(Radio, {value: "one", label: "Option one"}), h(Radio, {value: "two", label: "Option two"}))),
    demo("Slider", h(Slider, {label: "Price", showValue: true, value: preco, onValueChange: setPreco, ...PRECO}),
      h("p", {className: "inicio-nota"}, "Same value as the floating slider above.")),
    largo("OTPField", filaEntre(
      h("div", null, h("p", {className: "inicio-forte"}, "Verify account"), h("p", {className: "inicio-nota"}, "We've sent a code to a****@email.com")),
      h(OTPField, {label: "Verification code", length: 6, groupSize: 3, defaultValue: "28732"}))));
}

const PERIODOS = ["1D", "7D", "1M", "1Y", "All"].map((label) => ({value: label.toLowerCase(), label}));
function Navegacao() {
  const [p, setP] = useState("1d");
  const [c, setC] = useState("chats");
  const [pg, setPg] = useState(1);
  return h(Fragment, null,
    demo("SegmentedControl", h(SegmentedControl, {label: "Period", fullWidth: true, value: p, onChange: setP, items: PERIODOS})),
    demo("SegmentedControl, with icons", h(SegmentedControl, {label: "Inbox", fullWidth: true, value: c, onChange: setC,
      items: [{value: "chats", label: "Chats", icon: "chat-circle"}, {value: "emails", label: "Emails", icon: "envelope"}]})),
    largo("Breadcrumb", h(Breadcrumb, {items: [{label: "Docs", href: "./getting-started.html"}, {label: "Components", href: "./components.html"}, {label: "Button"}]})),
    largo("Pagination", h(Pagination, {page: pg, total: 4, onPageChange: setPg})));
}

function Janelas() {
  const [dialogo, setDialogo] = useState("");
  return h(Fragment, null,
    demo("ListBox", h(Card, {padding: "none"}, h(ListBox, {label: "File actions", selectionMode: "none", items: [
      {title: "Actions", items: [
        {id: "new", label: "New file", description: "Create a new file", icon: "plus-square", kbd: "⌘N"},
        {id: "edit", label: "Edit file", description: "Make changes", icon: "pencil-simple", kbd: "⌘E"}]},
      {title: "Danger zone", items: [
        {id: "delete", label: "Delete file", description: "Move to trash", icon: "trash", kbd: "⌘⇧D", danger: true}]}]}))),
    demo("Dialog", h(Card, null,
      h(Card.Header, null, h(Avatar, {tone: "danger", emphasis: "soft", fallback: h(Icon, {name: "floppy-disk"})}),
        h(Card.Title, null, "Unsaved changes"),
        h(Card.Description, {role: "status"}, dialogo === "saved" ? "Saved. Nothing was lost."
          : dialogo === "discarded" ? "Discarded. Back to the last save." : "Do you want to save or discard changes?")),
      h(Card.Footer, null, h(Button, {variant: "tertiary", grow: true, onClick: () => setDialogo("discarded")}, "Discard"),
        h(Button, {variant: "primary", grow: true, onClick: () => setDialogo("saved")}, "Save changes")))),
    largo("Tooltip", fila(h(Tooltip, {content: "Copied to clipboard"}, h(Button, {variant: "tertiary"}, "Hover or focus me")))));
}

const PESSOAS = [["Alice", "info"], ["Ben", "success"], ["Cleo", "brand"], ["Dan", "warning"], ["Eve", "danger"], ["Finn", "info"], ["Gus", "neutral"]];
const grupo = (titulo, membros, icone, tom) => h(Card, {className: "inicio-grupo"}, fila(
  h(Avatar, {tone: tom, emphasis: "soft", fallback: h(Icon, {name: icone})}),
  h("div", null, h("p", {className: "inicio-forte"}, titulo), h("p", {className: "inicio-nota"}, membros))));
function Dados() {
  const [segue, setSegue] = useState(false);
  return h(Fragment, null,
    demo("Card · Avatar", h(Card, null,
      filaEntre(fila(h(Avatar, {fallback: "C", tone: "brand", emphasis: "soft"}),
        h("div", null, h("p", {className: "inicio-forte"}, "Curator"), h("p", {className: "inicio-nota"}, "@curator"))),
      h(Toggle, {size: "sm", pressed: segue, onPressedChange: setSegue}, segue ? "Following" : "Follow")),
      h("p", {className: "inicio-nota inicio-bio"}, "Collecting the best of UI for web & mobile. Picks every Friday."),
      h("div", {className: "inicio-fila inicio-nota"}, h("span", null, h("strong", null, "12"), " Following"),
        h("span", null, h("strong", null, "3.4K"), " Followers")))),
    demo("Alert", h(Alert, {title: "You have 2 credits left", action: h(Button, {variant: "tertiary"}, "Upgrade")},
      "Get a paid plan for more credits")),
    largo("AvatarGroup · Card",
      h(AvatarGroup, {max: 5, label: "Team"}, ...PESSOAS.map(([n, t]) => h(Avatar, {key: n, fallback: n[0], alt: n, tone: t, emphasis: "soft"}))),
      h("div", {className: "inicio-grupos"}, grupo("Design Club", "148 members · By John", "palette", "info"),
        grupo("AI Builders", "362 members · By Martha", "robot", "success"))));
}

export const FAMILIAS = [
  ["01", "Actions", "cursor-click", "orange", "Button · IconButton · CloseButton · Link", Acoes],
  ["02", "Fields", "textbox", "blue", "Input · Select · Checkbox · Switch · Radio · Slider · OTPField", Campos],
  ["03", "Navigation", "list", "teal", "SegmentedControl · Breadcrumb · Pagination", Navegacao],
  ["04", "Overlays", "copy", "pink", "ListBox · Dialog · Tooltip", Janelas],
  ["05", "Data & cards", "chart-bar", "green", "Card · Avatar · Alert · AvatarGroup", Dados],
];

export function Familias(estado) {
  const props = {preco: 250, setPreco: nada, avisos: true, setAvisos: nada, ...estado};
  return h(Accordion, {orientation: "horizontal", defaultValue: ["fields"], className: "inicio-familias",
    items: FAMILIAS.map(([n, nome, icone, cor, lista, Corpo]) => ({
      id: nome.toLowerCase().replace(/[^a-z]+/g, "-").replace(/-$/, ""),
      title: h(Fragment, null, h("span", {className: "inicio-fam-n"}, n), ladrilho(icone, cor, "inicio-fam-tile"),
        h("span", {className: "inicio-fam-nome"}, nome), h("span", {className: "inicio-fam-lista"}, lista)),
      content: h("div", {className: "inicio-fam-corpo"}, h(Corpo, props)),
    }))});
}

// ── O BARALHO (D-7.2): o embaralhar é EFEITO DO SITE; cada carta é o `Card` com as peças reais ───────────────────────
function Entrar() {
  return h("div", {className: "inicio-pilha"},
    h(Alert, {variant: "danger", title: "Wrong credentials"}, "Check both fields."),
    h(Field, {label: "Email"}, h(Input, {type: "email", placeholder: "you@company.com", autoComplete: "off"})),
    h(Field, {label: "Password"}, h(Input, {type: "password", placeholder: "Your password", autoComplete: "off"})),
    h(Checkbox, {label: "Keep me signed in", defaultChecked: true}),
    h(Button, {variant: "primary", fullWidth: true}, "Sign in"));
}
function Numeros() {
  return h("div", {className: "inicio-kpis"},
    h(KPI, {label: "Revenue", value: "$48.2k", trend: "+12%", direction: "up", tone: "success"}),
    h(KPI, {label: "Active seats", value: "312", trend: "+18", direction: "up", tone: "success"}),
    h(KPI, {label: "Churn", value: "1.8%", trend: "−0.3%", direction: "down", tone: "success"}),
    h(KPI, {label: "Tickets", value: "27", trend: "+4", direction: "up", tone: "danger"}));
}
// A LISTA DE MEMBROS (D-7.6 e D-7.7): a `Table variant="rows"` e, quando se marca alguém, a `Toolbar tone="brand"` no
// lugar do cabeçalho, com "Clear" e "Remove" que funcionam.
const MEMBROS = [["Messenger", "info", "online", "success"], ["Analyst", "success", "busy", "warning"],
  ["Curator", "danger", "online", "success"], ["Writer", "warning", "away", "neutral"]];
function Membros() {
  const [sel, setSel] = useState({});
  const [fora, setFora] = useState({});
  const [pg, setPg] = useState(1);
  const vivos = MEMBROS.filter(([n]) => !fora[n]);
  const n = vivos.filter(([nome]) => sel[nome]).length;
  return h("div", {className: "inicio-pilha inicio-membros"},
    n > 0
      ? h(Toolbar, {tone: "brand", label: "Selection"},
        h("span", {role: "status"}, `${n} member${n > 1 ? "s" : ""} selected`),
        h(ToolbarGroup, null, h(ToolbarButton, {onClick: () => setSel({})}, "Clear"),
          h(ToolbarButton, {onClick: () => { setFora({...fora, ...sel}); setSel({}); }}, "Remove")))
      : h("div", {className: "inicio-fila inicio-fila-entre inicio-membros-topo"}, h("span", {className: "inicio-nota"}, "Workspace members"),
        h(Button, {variant: "primary", size: "sm"}, "Invite")),
    h(Table, {variant: "rows", caption: "Workspace members"},
      h("thead", null, h("tr", null, h("th", {scope: "col"}, h("span", {className: "sr-only"}, "Select")),
        h("th", {scope: "col"}, "Member"), h("th", {scope: "col"}, "State"), h("th", {scope: "col", className: "inicio-col-acoes"}, "Actions"))),
      h("tbody", null, ...vivos.map(([nome, tom, estado, tomEstado]) => h("tr", {key: nome, "data-selected": sel[nome] ? "" : undefined},
        h("td", null, h(Checkbox, {label: `Select ${nome}`, labelHidden: true, checked: !!sel[nome],
          onChange: (e) => setSel({...sel, [nome]: e.target.checked})})),
        h("td", null, h("span", {className: "inicio-quem-linha"}, h(Avatar, {size: "sm", fallback: nome[0], tone: tom, emphasis: "soft"}), h("strong", null, nome))),
        h("td", null, h(Badge, {tone: tomEstado, dot: true}, estado)),
        h("td", {className: "inicio-col-acoes"}, h(Button, {variant: "ghost", size: "sm", onClick: () => setFora({...fora, [nome]: true})}, "Remove")))))),
    vivos.length === 0 ? h("p", {className: "inicio-nota"}, "Everyone was removed. ",
      h(Button, {variant: "ghost", size: "sm", onClick: () => setFora({})}, "Bring them back")) : null,
    h("div", {className: "inicio-fila inicio-fila-meio"}, h(Pagination, {page: pg, total: 4, onPageChange: setPg})));
}
function Ajustes() {
  return h("div", {className: "inicio-pilha"},
    h(Field, {label: "Workspace name"}, h(Input, {defaultValue: "Internal tooling"})),
    h(Field, {label: "Region"}, h(Select, {defaultValue: "eu", items: [{value: "eu", label: "Europe"}, {value: "us", label: "United States"}, {value: "br", label: "Brazil"}]})),
    h(Field, {label: "Description"}, h(Textarea, {rows: 2, defaultValue: "Internal tooling."})),
    h(Switch, {label: "Email notifications", description: "Weekly digest", defaultChecked: true, indicatorPlacement: "end"}),
    h("div", {className: "inicio-fila inicio-fila-fim"}, h(Button, {variant: "tertiary"}, "Discard"), h(Button, {variant: "primary"}, "Save changes")));
}
const CARTAS = [["Sign-in panel", Entrar], ["Stats row", Numeros], ["Members table", Membros], ["Settings form", Ajustes]];

export function Baralho({total = 15}) {
  const [topo, setTopo] = useState(0);
  return h("div", {className: "inicio-baralho"},
    h("div", {className: "inicio-baralho-texto"},
      h("p", {className: "intro-olho"}, "Blocks"),
      h("h2", {className: "inicio-h2", id: "inicio-blocos-h"}, "Whole screens.", h("br"), "Shuffle the deck."),
      h("div", {className: "inicio-baralho-lista"}, h(SegmentedControl, {label: "Blocks", orientation: "vertical", size: "2xl", selectedStyle: "neutral",
        value: String(topo), onChange: (v) => setTopo(Number(v)),
        items: CARTAS.map(([nome], i) => ({value: String(i), label: h("span", {className: "inicio-baralho-item"},
          h("span", {className: "inicio-baralho-n"}, `0${i + 1}`), nome)}))})),
      h("div", {className: "inicio-fila"},
        h(Button, {variant: "primary", leadingIcon: "shuffle", onClick: () => setTopo((topo + 1) % CARTAS.length)}, "Next block"),
        h(Link, {href: "./blocks.html"}, `See all ${total} blocks →`))),
    h("div", {className: "inicio-cartas"}, ...CARTAS.map(([nome, Corpo], i) => {
      const pos = (i - topo + CARTAS.length) % CARTAS.length;
      return h(Card, {key: nome, className: "inicio-carta", "data-pos": pos, "aria-hidden": pos !== 0 ? "true" : undefined, inert: pos !== 0 ? true : undefined},
        h("div", {className: "inicio-carta-cabeca"}, h("h3", {className: "inicio-carta-t"}, nome),
          h("span", {className: "inicio-carta-n"}, `0${i + 1} / 0${CARTAS.length}`)),
        pos === 0 ? h(Corpo) : h("div", {className: "inicio-fantasma"}, h("span"), h("span"), h("span")));
    })));
}

// ── "TRY IT HERE" (D-7.4 e D-7.5): o tema em dois ladrilhos (o `Toggle area`) e a marca em cápsulas (o `ToggleGroup`
// com o ligado cinza e o `ColorSwatch`). Trocam o tema e a marca DE VERDADE, na página toda: o tema pelo provedor do
// site, a marca pelo evento `aurea-brand` (a cola do `catalog.js` aplica e grava).
// A cor de cada bolinha é a da PRÓPRIA marca, tirada dos tokens pelo gerador (`marcas`), e não da marca ligada na página:
// dentro de outra marca, a regra da página vencia a da bolinha (o defeito que o Victor achou na bancada, 01/11/2026).
export function Teste({marcas = [], temaInicial = "dark", marcaInicial = ""}) {
  const {theme, setTheme} = useAureaTheme();
  const tema = theme === "light" || theme === "dark" ? theme : temaInicial;
  const [marca, setMarca] = useState(() => (typeof document !== "undefined" ? document.documentElement.dataset.brand : "") || marcaInicial);
  const escolheMarca = (id) => {
    setMarca(id);
    if (typeof document !== "undefined") document.dispatchEvent(new CustomEvent("aurea-brand", {detail: {brand: id}}));
  };
  const ladrilhoDeTema = (valor, nome, icone) => h(Toggle, {key: valor, area: true, pressed: tema === valor,
    onPressedChange: (on) => { if (on) setTheme(valor); }, className: "inicio-tema"},
    h("span", {className: "inicio-tema-miolo"}, h(Icon, {name: icone, size: "xl"}), nome));
  return h(Card, {className: "inicio-teste"},
    h("p", {className: "inicio-dm-rot inicio-teste-rot"}, "Try it here"),
    h("div", {className: "inicio-temas", role: "group", "aria-label": "Color theme"},
      ladrilhoDeTema("light", "Light", "sun"), ladrilhoDeTema("dark", "Dark", "moon")),
    h(ToggleGroup, {label: "Brand", detached: true, pressedStyle: "neutral", className: "inicio-marcas",
      value: [marca || "aurea"], onValueChange: (v) => { if (v[0] != null) escolheMarca(v[0] === "aurea" ? "" : v[0]); }},
      ...marcas.map((m) => h(Toggle, {key: m.id || "aurea", value: m.id || "aurea", size: "lg", className: "inicio-marca"},
        // A bolinha é desenho: o nome da marca já está escrito no botão.
        h("span", {className: "inicio-cor", "aria-hidden": "true", style: {"--inicio-tinta": m[tema].ink}},
          h(ColorSwatch, {color: m[tema].color, size: "sm", label: m.label}),
          h(Icon, {name: "check", size: "sm", className: "inicio-visto"})),
        m.label))));
}
