// STARTERS — o par preview + CÓDIGO de todo componente que ainda não tem arquivo de conteúdo
// próprio. Existe por causa da ADR-0001 (Fase 7): preview e código são NÚCLEO do modelo de
// página, obrigatórios em todo tipo de item. Antes desta lista, 28 páginas de componente não
// tinham preview nenhum ("Preview unavailable") e 16 tinham preview sem código — a aba Code
// simplesmente não existia, então não havia o que copiar.
//
// O arquivo começa como o `fallback` que morava DENTRO de scripts/build-catalog.mjs. Saiu de lá
// por duas razões: conteúdo de produto não mora na ferramenta que o gera (é a lição do achado
// A6), e a versão que morava lá tinha 9 entradas MORTAS — componentes que já tinham arquivo de
// conteúdo próprio e nunca caíam no fallback.
//
// Um componente com arquivo próprio (Button.mjs, Input.mjs…) NÃO entra aqui: o gate reprova a
// entrada duplicada, que é como as 9 mortas apareceram. Starter é o mínimo do modelo; conteúdo
// rico (`features` e `examples`) continua como dívida de conteúdo. `props` não entra mais nessa
// frase: o achado M8 fechou na Parte E e todas as fichas publicam a API.
//
// `note` foi a concessão declarada da página estática: componente cujo conteúdo vive num PORTAL
// (Dialog, Drawer, Tooltip, Popover, os dois menus, NotificationCenter) não existe no HTML pronto —
// renderToStaticMarkup não renderiza portal (medido em 30/07/2026: Dialog aberto = 0 bytes). Desde
// 21/10/2026 a parte viva acende toda caixa: o HTML pronto mostra o DISPARADOR, e o vivo abre a
// janela (ver "OS EXEMPLOS QUE ABREM", abaixo). A nota ficou só onde diz algo além disso.
import {createElement as h, Fragment, useState} from "react";
import * as A from "../../../packages/react/dist/index.js";
// As cores do código, para o exemplo do `CodeBlock` (lote V, 20/10/2026).
import {highlightCode} from "../../../packages/react/dist/code-highlight.js";
// Os módulos de motor opcional vêm por subpath — o catálogo consome a biblioteca como um
// consumidor consome, e é assim que se descobre se a fronteira da Fase 9 é usável. Os pesados (gráficos, editor,
// grade, mapa, QR) moram no `_starters-motores.mjs` desde 21/10/2026; aqui fica o calendário, que é leve.
import {Calendar} from "../../../packages/react/dist/calendar.js";
import {ComOrdem, ComValor} from "./_estado.mjs";
// O exemplo de cada valor de variação, com o código e a peça da mesma lista (bloco 1, o catálogo fiel — 23/10/2026).
import {cada, eixo} from "./_eixos.mjs";

// A fileira que quebra centraliza cada linha, como a `linha` do `_eixos.mjs` (bloco 1, 23/10/2026).
export const row = {display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "var(--space-3)"};
const stack = {display: "grid", gap: "var(--space-3)"};
export const wide = {width: "min(30rem,100%)"};
// O mesmo limite, para peça que tem a largura do conteúdo (21/10/2026): a caixa encolhe até ela e o painel a
// centraliza. Com `wide`, a lista curta ficava encostada à esquerda de uma caixa de 30rem (o Victor apontou).
const ate = {maxWidth: "min(30rem,100%)"};
// O de dentro dos exemplos de arranjo (bloco 1, o catálogo fiel — 23/10/2026): o mesmo grupo em cada valor, para só o
// arranjo mudar de uma linha para a outra.
const GRUPO_DE_TRES = {codigo: "\n  <Badge>one</Badge>\n  <Badge>two</Badge>\n  <Badge>three</Badge>\n",
  elemento: ["one", "two", "three"].map(n => h(A.Badge, {key: n}, n))};
const DOIS_CARTOES = {codigo: "\n  <Card>First</Card>\n  <Card>Second</Card>\n",
  elemento: ["First", "Second"].map(n => h(A.Card, {key: n}, n))};
const TRES_ESTILOS = {codigo: `
  <Toggle value="bold">Bold</Toggle>
  <Toggle value="italic">Italic</Toggle>
  <Toggle value="underline">Underline</Toggle>
`, elemento: [["bold", "Bold"], ["italic", "Italic"], ["underline", "Underline"]].map(([v, r]) => h(A.Toggle, {key: v, value: v}, r))};

// OS EXEMPLOS QUE ABREM (21/10/2026). Com a parte viva em toda caixa, o botão do exemplo abre a janela, como no código
// ao lado — antes, a caixa era HTML pronto e o botão era só a forma, com uma nota dizendo isso. No HTML pronto a janela
// fechada não desenha nada, então a caixa continua mostrando o botão. Cada um é o código da aba "Code", com o estado.
function AbreDialog() {
  const [open, setOpen] = useState(false);
  return h(Fragment, null,
    h(A.Button, {variant: "danger", onClick: () => setOpen(true)}, "Delete project"),
    h(A.Dialog, {open, onClose: () => setOpen(false), title: "Delete project", icon: "trash", iconTone: "danger",
      footer: h(Fragment, null,
        h(A.Button, {variant: "tertiary", onClick: () => setOpen(false)}, "Cancel"),
        h(A.Button, {variant: "danger", onClick: () => setOpen(false)}, "Delete"))},
      "This removes every component and token in it. It cannot be undone."));
}
function AbreConfirmDialog() {
  const [open, setOpen] = useState(false);
  return h(Fragment, null,
    h(A.Button, {variant: "danger", onClick: () => setOpen(true)}, "Delete article"),
    h(A.ConfirmDialog, {open, title: "Delete this article?",
      description: "It leaves the site immediately, and this cannot be undone.",
      confirmLabel: "Delete", destructive: true, icon: "trash",
      onConfirm: () => setOpen(false), onCancel: () => setOpen(false)}));
}
// UM BOTÃO POR VALOR (bloco 1, o catálogo fiel — 23/10/2026): a janela só se vê aberta, então o exemplo de cada valor de
// uma variação dela é uma fileira de botões, e cada um abre a janela com aquele valor. `props(valor, fecha)` dá as
// props da janela; `codigo(valor)`, a linha do código — os dois da mesma lista.
function CadaJanela({Comp, prop, valores, props}) {
  const [aberto, setAberto] = useState(null);
  const fecha = () => setAberto(null);
  return h("div", {style: row},
    ...valores.map(v => h(A.Button, {key: `b-${v}`, variant: "secondary", onClick: () => setAberto(v)}, `${prop}: ${v}`)),
    ...valores.map(v => h(Comp, {key: `j-${v}`, ...props(v, fecha), [prop]: v, open: aberto === v})));
}
// O AppShell é página inteira (dono do <main> e do h1): cada exemplo dele mora numa moldura própria, como o principal.
// Um exemplo junta vários valores de uma vez, e o código diz os mesmos que a moldura usa.
const cascaDeApp = (titulo, descricao, props) => ({
  title: titulo, description: descricao, embed: true, layoutProprio: true, tituloProprio: true,
  code: `<AppShell\n${Object.entries(props).map(([k, v]) => `  ${k}="${v}"`).join("\n")}\n  brand={<strong>Acme</strong>}\n`
    + `  navigation={<nav aria-label="Contents"><a href="/inbox" aria-current="page">Inbox</a></nav>}\n`
    + `  aside={<p>On this page</p>}\n>\n  <h1>Inbox</h1>\n</AppShell>`,
  render: () => h(A.AppShell, {...props, brand: h("strong", null, "Acme"),
    navigation: h("nav", {className: "doc-nav", "aria-label": "Contents"},
      h("a", {href: "#", className: "active", "aria-current": "page"}, "Inbox"), h("a", {href: "#"}, "Archive")),
    aside: h("p", null, "On this page"), asideLabel: "On this page"},
    h("h1", null, "Inbox"), h("p", null, "Twelve new messages since yesterday.")),
});
const janelas = ({titulo, descricao, Comp, prop, valores, props, codigo}) => ({
  title: titulo, description: descricao,
  code: valores.map(codigo).join("\n"),
  render: () => h(CadaJanela, {Comp, prop, valores, props}),
});
function GaleriaDeVarias() {
  const [escolhidas, setEscolhidas] = useState(["front"]);
  return h(A.Gallery, {label: "Photos to share", selectionMode: "multiple", selectedIds: escolhidas,
    onSelectionChange: setEscolhidas,
    items: ["Front", "Back", "In use", "Packaging"].map(t => ({id: t.toLowerCase().replace(" ", ""), src: FOTO, alt: t, caption: t}))});
}
// Os exemplos do AureaProvider mexem no provedor DO SITE (bloco 1, o catálogo fiel — 23/10/2026): um segundo provedor na
// página monta uma segunda região de avisos com o mesmo nome (o achado e do item 105, o 2-C da fila).
function DensidadeDoSite() {
  const {density, setDensity} = A.useAureaTheme();
  return h(A.SegmentedControl, {label: "Density", value: density ?? "comfortable", onChange: setDensity,
    items: [{value: "compact", label: "Compact"}, {value: "comfortable", label: "Comfortable"}, {value: "spacious", label: "Spacious"}]});
}
function MostraUmAviso() {
  const toast = A.useToast();
  return h(A.Button, {variant: "secondary", onClick: () => toast.add({title: "Saved", description: "A toast, where this site puts them."})},
    "Show a toast");
}
function AbreDrawer() {
  const [open, setOpen] = useState(false);
  return h(Fragment, null,
    h(A.Button, {onClick: () => setOpen(true)}, "Edit member"),
    h(A.Drawer, {open, onClose: () => setOpen(false), title: "Edit member", side: "right",
      footer: h(A.Button, {variant: "primary", onClick: () => setOpen(false)}, "Save")},
      h(A.Field, {label: "Name"}, h(A.Input, {defaultValue: "Analyst"}))));
}
function AbrePaleta() {
  const [open, setOpen] = useState(false);
  const fecha = () => setOpen(false);
  return h(Fragment, null,
    h(A.Button, {leadingIcon: "magnifying-glass", kbd: "⌘K", onClick: () => setOpen(true)}, "Search"),
    h(A.CommandPalette, {open, onClose: fecha, items: [
      {id: "button", label: "Button", icon: "squares-four", group: "Components", run: fecha},
      {id: "close", label: "CloseButton", icon: "squares-four", group: "Components", run: fecha},
      {id: "theme", label: "Toggle theme", icon: "moon", kbd: "⌘T", group: "Actions", run: fecha}]}));
}
function AbreCasca() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const fecha = () => setOpen(false);
  return h(Fragment, null,
    h(A.Button, {leadingIcon: "magnifying-glass", onClick: () => setOpen(true)}, "Open palette"),
    h(A.CommandPaletteShell, {open, query, onQueryChange: setQuery, onClose: fecha},
      h("div", {className: "menu"},
        h("button", {className: "menu-item", type: "button", onClick: fecha}, "Go to Button"),
        h("button", {className: "menu-item", type: "button", onClick: fecha}, "Toggle theme"))));
}
// Os três ganchos que mexem na PÁGINA (tema, densidade, aviso): o exemplo vivo mexe nesta página, como no app.
function UsaTema() {
  const {theme, toggleTheme} = A.useTheme();
  return h(A.IconButton, {icon: theme === "light" ? "moon" : "sun",
    label: theme === "light" ? "Switch to dark" : "Switch to light", onClick: toggleTheme});
}
function UsaDensidade() {
  const {density, setDensity} = A.useDensity();
  return h(A.SegmentedControl, {value: density ?? "comfortable", onChange: setDensity, items: [
    {value: "compact", label: "Compact"},
    {value: "comfortable", label: "Comfortable"},
    {value: "spacious", label: "Spacious"}]});
}
// Os dois ganchos que só LEEM do provedor: o exemplo mostra o que eles leem (eram `render: null`, caixa vazia).
function MostraFrase() {
  const s = A.useAureaStrings();
  return h("p", null, s.loading);
}
function MostraGlifo() {
  const url = A.useSpriteUrl();
  return h("svg", {className: "icon", "aria-hidden": true}, h("use", {href: `${url}#i-caret-down`}));
}
function UsaAviso() {
  const toast = A.useToast();
  return h(A.Button, {onClick: () => toast.add({title: "Saved", type: "success"})}, "Save");
}

// A "foto" das páginas de imagem e de galeria (e da abertura, `patterns/Section.mjs`): SVG em data URI, porque o catálogo é gerado e
// commitado e um preview que busca bytes na rede não sobrevive a uma máquina sem rede — nem ao
// `dist == build` da CI. 3:2 de propósito, para as caixas de 16/9 e 1/1 terem o que cortar.
export const FOTO = "data:image/svg+xml," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">'
  + '<rect width="300" height="200" fill="#3f3f46"/>'
  + '<circle cx="150" cy="100" r="54" fill="#eab308"/></svg>');

// GAR-15 (0.28.0): a "captura" de uma tela de app para a moldura de celular — em pé, 9 por 19,5,
// uma clara e uma escura (`srcDark`), com o desenho de cartões e linhas e nada mais.
const tela = (fundo, cartao, linha) => "data:image/svg+xml," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="390">'
  + `<rect width="180" height="390" fill="${fundo}"/>`
  + `<rect x="14" y="40" width="96" height="14" rx="7" fill="${linha}"/>`
  + `<rect x="14" y="70" width="152" height="70" rx="14" fill="${cartao}"/>`
  + `<rect x="14" y="152" width="152" height="150" rx="14" fill="${cartao}"/>`
  + `<rect x="14" y="316" width="152" height="24" rx="12" fill="#eab308"/></svg>`);
const TELA_CLARA = tela("#f5f5f5", "#ffffff", "#242424");
const TELA_ESCURA = tela("#1f1f1f", "#292929", "#ffffff");

// A capa do `MediaEmbed`: uma cena neutra, sem amarelo. Com a `FOTO` de cima a pastilha de tocar,
// que é amarela, se confundia com o círculo amarelo da foto — a prévia ensinava o caso ruim.
const CAPA = "data:image/svg+xml," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180">'
  + '<rect width="320" height="180" fill="#27272a"/>'
  + '<path d="M0 180 L90 90 L150 140 L220 60 L320 160 L320 180 Z" fill="#52525b"/>'
  + '<circle cx="262" cy="42" r="16" fill="#a1a1aa"/></svg>');

const MES_FIXO = new Date(2026, 7, 1);

export default {
  // 0.33.0: o terceiro com `action`, o botão do aviso da referência ("Upgrade"), antes do X.
  Alert: {
    code: `<Alert variant="info" title="Heads up">Contextual information.</Alert>
<Alert variant="danger" title="Upload failed">The file exceeds 10 MB.</Alert>
<Alert title="You have 2 credits left" action={<Button variant="tertiary">Upgrade</Button>}>
  Get a paid plan for more credits
</Alert>`,
    render: () => h("div", {style: {...stack, ...wide}},
      h(A.Alert, {variant: "info", title: "Heads up"}, "Contextual information."),
      h(A.Alert, {variant: "danger", title: "Upload failed"}, "The file exceeds 10 MB."),
      h(A.Alert, {title: "You have 2 credits left", action: h(A.Button, {variant: "tertiary"}, "Upgrade")},
        "Get a paid plan for more credits")),

    examples: [
      eixo({titulo: "Variants", descricao: "How serious it is. danger interrupts the screen reader (role=alert); the others wait for a pause (role=status).",
        Comp: A.Alert, nome: "Alert", prop: "variant", valores: ["info", "success", "warning", "danger", "accent"],
        estilo: {display: "grid", gap: "var(--space-3)", ...wide}, filho: (v) => `A ${v} alert.`}),
      eixo({titulo: "Every state", descricao: "What is happening, apart from how serious it is. Without children, the alert says the state in words of its own.",
        Comp: A.Alert, nome: "Alert", prop: "state", valores: ["stale", "partial", "degraded", "offline", "waiting_user", "waiting_approval", "waiting_dependency"], estilo: {display: "grid", gap: "var(--space-3)", ...wide}}),
    ],
  },
  AppShell: {
    // O único componente de PÁGINA: ele é dono do <main>, do <header> e do <aside> do documento.
    // Renderizado dentro de outra página vira main duplicado e complementary aninhado (axe,
    // medido em 30/07/2026). Por isso o preview dele mora num documento próprio — ver `embed`.
    // O AppShell monta os PRÓPRIOS landmarks e o próprio h1 (a marca no topo). Sem estas duas
    // chaves o gerador acrescentaria um segundo `<main>` e um segundo `h1`, e a varredura
    // reprova com "2 h1 na página" — medido em 18/08/2026.
    layoutProprio: true,
    tituloProprio: true,
    embed: true,
    description: "The frame around this very page is an AppShell: topbar with the brand, "
      + "sidebar with the navigation, and the content beside it. It owns the page landmarks, so "
      + "this preview runs in a document of its own.",
    code: `<AppShell
  brand={<strong>Acme</strong>}
  navigation={<nav aria-label="Contents"><a href="/inbox" aria-current="page">Inbox</a><a href="/archive">Archive</a></nav>}
  topbar={<Button variant="primary" size="sm">New</Button>}
>
  <h1>Inbox</h1>
</AppShell>`,
    render: () => h(A.AppShell, {
      brand: h("strong", null, "Acme"),
      // `.doc-nav` é a pele de navegação do PRÓPRIO catálogo, não do sistema: link de
      // navegação lateral ainda não é componente da Aurea (é o achado A8, Fase 8). Sem
      // classe nenhuma o link sai com a cor padrão e reprova contraste sobre a lateral —
      // medido. O código mostra o <nav> puro porque é isso que o consumidor tem hoje.
      navigation: h("nav", {className: "doc-nav", "aria-label": "Contents"},
        h("a", {href: "#", className: "active", "aria-current": "page"}, "Inbox"),
        h("a", {href: "#"}, "Archive")),
      topbar: h(A.Button, {variant: "primary", size: "sm"}, "New"),
    }, h("h1", null, "Inbox")),
    examples: [
      cascaDeApp("The documentation arrangement", "layout=\"docs\" is the arrangement of this site: one block in the middle "
        + "of the screen with the sidebar, the text and the table of contents. Here the sidebar, the content and the aside "
        + "have no box (plain).", {layout: "docs", sidebarVariant: "plain", contentVariant: "plain", asideVariant: "plain"}),
      cascaDeApp("A floating aside, and the scrollbar always on", "asideVariant=\"floating\" puts the right column in a card "
        + "of its own; sidebarScrollbar=\"visible\" keeps the sidebar's scrollbar showing, instead of only under the pointer.",
        {asideVariant: "floating", sidebarScrollbar: "visible"}),
      cascaDeApp("A flush aside", "asideVariant=\"flush\" glues the right column to the edge of the window, like the flush sidebar.",
        {asideVariant: "flush", sidebarVariant: "flush"}),
    ],
  },
  AureaProvider: {
    description: "Configuration for the whole app, once: where the icon sprite lives, the "
      + "text direction and the UI strings. It renders no box of its own.",
    code: `<AureaProvider spriteUrl="/assets/aurea-icons.svg" direction="ltr" strings={{close: "Fechar"}}>
  <App />
</AureaProvider>`,
    // Sem um SEGUNDO provedor (21/10/2026): a caixa já mora sob o do site, e cada provedor monta a sua região de avisos
    // — com a parte viva, a página ganhava duas com o mesmo nome (o `landmark-unique` do axe). O ícone que resolve é o
    // efeito do provedor; a aba "Code" ensina o provedor.
    render: () => h("div", {style: row},
      h(A.Icon, {name: "check"}), h("span", null, "Icons resolve through the provider.")),
    examples: [
      {
        title: "Theme",
        description: "defaultTheme seeds the theme and lets the user change it; theme controls it from your state. "
          + "\"system\" follows the computer and keeps following it. The switch below is this site's own provider, live.",
        code: `<AureaProvider defaultTheme="light">…</AureaProvider>
<AureaProvider defaultTheme="dark">…</AureaProvider>
<AureaProvider defaultTheme="system">…</AureaProvider>
<AureaProvider theme="light" onThemePreferenceChange={setTheme}>…</AureaProvider>
<AureaProvider theme="dark" onThemePreferenceChange={setTheme}>…</AureaProvider>
<AureaProvider theme="system" onThemePreferenceChange={setTheme}>…</AureaProvider>`,
        render: () => h(A.ThemeToggle, {mode: "light-dark-system"}),
      },
      {
        title: "Density",
        description: "The same two forms for the density: defaultDensity seeds it, density controls it. The control below "
          + "changes this site's density, live — every control on the page follows.",
        code: `<AureaProvider defaultDensity="compact">…</AureaProvider>
<AureaProvider defaultDensity="comfortable">…</AureaProvider>
<AureaProvider defaultDensity="spacious">…</AureaProvider>
<AureaProvider density="compact" onDensityChange={setDensity}>…</AureaProvider>
<AureaProvider density="comfortable" onDensityChange={setDensity}>…</AureaProvider>
<AureaProvider density="spacious" onDensityChange={setDensity}>…</AureaProvider>`,
        render: () => h(DensidadeDoSite),
      },
      {
        title: "Direction",
        description: "direction=\"rtl\" tells the engine that the inline axis runs right to left, so popups and arrow keys "
          + "mirror. The CSS mirrors on its own from the dir attribute — the box below is a dir=\"rtl\" page in miniature.",
        code: `<html dir="rtl">
  <AureaProvider direction="rtl">…</AureaProvider>
</html>`,
        render: () => h("div", {dir: "rtl", style: {...stack, ...wide}},
          h(A.InputGroup, null, h(A.InputGroupAddon, null, h(A.Icon, {name: "magnifying-glass"})),
            h(A.Input, {placeholder: "Search", "aria-label": "Search, right to left"})),
          h("div", {style: row}, h(A.Button, {variant: "primary"}, "Save"), h(A.Button, {variant: "secondary"}, "Cancel"))),
      },
      {
        title: "Where the toasts appear",
        description: "toastPlacement picks one of six places for the messages of useToast(). bottom, the middle of the "
          + "bottom edge, is the default — and the one this site uses: the button shows it.",
        code: ["top-start", "top", "top-end", "bottom-start", "bottom", "bottom-end"]
          .map(v => `<AureaProvider toastPlacement="${v}">…</AureaProvider>`).join("\n"),
        render: () => h(MostraUmAviso),
      },
    ],
  },
  // 0.33.0: com `tone` e `emphasis="soft"` — a cor da letra e o fundo clarinho do tom, como os da referência.
  Avatar: {
    code: `<Avatar fallback="AU" />
<Avatar fallback="VM" size="lg" />
<Avatar fallback="B" tone="info" emphasis="soft" />
<Avatar fallback={<Icon name="floppy-disk" />} tone="warning" emphasis="soft" />`,
    render: () => h("div", {style: row}, h(A.Avatar, {fallback: "AU"}), h(A.Avatar, {fallback: "VM", size: "lg"}),
      h(A.Avatar, {fallback: "B", tone: "info", emphasis: "soft"}),
      h(A.Avatar, {fallback: h(A.Icon, {name: "floppy-disk"}), tone: "warning", emphasis: "soft"})),
    examples: [
      eixo({titulo: "Tones", descricao: "The colour of the fallback, with soft emphasis: the tone tints the circle and the letters stay readable.",
        Comp: A.Avatar, nome: "Avatar", prop: "tone", valores: ["neutral", "brand", "info", "success", "warning", "danger"],
        base: {fallback: "AU", emphasis: "soft"}}),
      eixo({titulo: "Sizes", descricao: "Three sizes from the control scale.", Comp: A.Avatar, nome: "Avatar", prop: "size",
        valores: ["sm", "md", "lg"], base: {fallback: "AU"}}),
    ],
  },
  Banner: {
    code: `<Banner variant="success" title="Saved" icon="check" onDismiss={() => setShown(false)}>
  Your changes are live.
</Banner>`,
    render: () => h("div", {style: wide}, h(A.Banner, {variant: "success", title: "Saved",
      icon: "check", onDismiss: () => {}}, "Your changes are live.")),

    examples: [
      eixo({titulo: "Variants", descricao: "The same live-region rule as Alert: danger interrupts, the others wait. The cookie notice, consent, has a page of its own on the site.",
        Comp: A.Banner, nome: "Banner", prop: "variant", valores: ["info", "success", "warning", "danger"],
        estilo: {display: "grid", gap: "var(--space-3)", ...wide}, filho: (v) => `A ${v} banner.`}),
      eixo({titulo: "Every state", descricao: "The condition, apart from the severity. Without a variant, the state picks it; without children, it supplies the message.",
        Comp: A.Banner, nome: "Banner", prop: "state", valores: ["stale", "partial", "degraded", "offline", "waiting_user", "waiting_approval", "waiting_dependency"], estilo: {display: "grid", gap: "var(--space-3)", ...wide}}),
    ],
  },
  Breadcrumb: {
    code: `<Breadcrumb items={[
  {label: "Home", href: "/"},
  {label: "Patterns", href: "/patterns"},
  {label: "QR code"},
]} />`,
    render: () => h(A.Breadcrumb, {items: [{label: "Home", href: "#"},
      {label: "Patterns", href: "#"}, {label: "QR code"}]}),
  },
  // 0.33.0: as partes da referência — o cabeçalho com título e descrição colados, o conteúdo e o rodapé, 12 entre elas.
  Card: {
    code: `<Card>
  <Card.Header>
    <Card.Title>A floating surface</Card.Title>
    <Card.Description>Radius 22px, no line, no shadow stack.</Card.Description>
  </Card.Header>
  <Card.Content>
    <p>The parts are optional: a card can hold anything.</p>
  </Card.Content>
  <Card.Footer>
    <Button variant="primary">Save</Button>
    <Button>Cancel</Button>
  </Card.Footer>
</Card>`,
    render: () => h("div", {style: wide}, h(A.Card, null,
      h(A.Card.Header, null,
        h(A.Card.Title, null, "A floating surface"),
        h(A.Card.Description, null, "Radius 22px, no line, no shadow stack.")),
      h(A.Card.Content, null, h("p", {style: {margin: 0}}, "The parts are optional: a card can hold anything.")),
      h(A.Card.Footer, null, h(A.Button, {variant: "primary"}, "Save"), h(A.Button, null, "Cancel")))),
    examples: [
      cada({titulo: "Variants", descricao: "base is the floating surface; raised lifts it with a shadow; interactive answers the pointer; inset sinks into the page; outline is the one card with a line; selected and danger mark a state; contrast is the dark theme inside the card.",
        valores: ["base", "raised", "interactive", "inset", "outline", "selected", "danger", "contrast"],
        estilo: {display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(10rem, 1fr))", gap: "var(--space-3)", width: "100%"},
        codigo: (v) => v === "interactive" ? `<Card variant="interactive" render={<a href="#" />}>variant interactive</Card>`
          : `<Card variant="${v}">variant ${v}</Card>`,
        peca: (v) => h(A.Card, v === "interactive" ? {variant: v, render: h("a", {href: "#"})} : {variant: v}, `variant ${v}`)}),
    ],
  },
  // Image (L4). A foto é um SVG em data URI porque o catálogo é HTML gerado e COMMITADO: preview
  // que busca bytes na rede reprova sem rede, e um byte diferente move o gate de pixel.
  // A imagem QUEBRADA fica de fora daqui de propósito, e não por descuido: um `src` inexistente
  // vira 404, e o `catalog-sweep` cobra console limpo em todas as páginas. O estado quebrado se
  // prova onde dá para provar sem sujar o console — no teste de unidade e na pele.
  // Duas proporções na mesma linha porque é isso que o componente promete: as duas caixas ficam
  // reservadas com o tamanho certo ANTES de qualquer byte chegar.
  Image: {
    description: "An <img> that reserves its box before the bytes arrive — that is the "
      + "layout-shift fix — and falls back to a named box, keeping the alt text, when they never do.",
    code: `<Image src="/photo.jpg" alt="The product, from the front" ratio="16/9" />
<Image src="/photo.jpg" alt="The same photo, uncropped" ratio="1/1" fit="contain" />
<Image src="/home.png" srcDark="/home-dark.png" alt="The app's home screen" frame="phone" />`,
    // GAR-15 (0.28.0): a moldura de celular, genérica, com a captura de cada tema.
    render: () => h("div", {style: {display: "grid", gridTemplateColumns: "1fr 1fr 8rem",
      alignItems: "start", gap: "var(--space-3)", width: "min(36rem,100%)"}},
      h(A.Image, {src: FOTO, alt: "The product, from the front", ratio: "16/9"}),
      h(A.Image, {src: FOTO, alt: "The same photo, uncropped", ratio: "1/1", fit: "contain"}),
      h(A.Image, {src: TELA_CLARA, srcDark: TELA_ESCURA, alt: "The app's home screen", frame: "phone"})),
  },
  // Gallery (L2). O `zoom` fica LIGADO no exemplo e a nota diz por que o diálogo não aparece: é a
  // mesma concessão declarada dos outros componentes de portal. O selecionado entra para a prévia
  // mostrar a linguagem de "escolhido" que a casa já tem — a mesma da aba ativa.
  Gallery: {
    description: "A grid of pictures you can pick from. Enlarging opens the Dialog this library "
      + "already has — no second floating surface is born for it.",
    code: `<Gallery
  label="Product photos"
  items={photos}
  selected={chosen}
  onSelect={setChosen}
  zoom
/>`,
    // SEM caixa estreita à volta, e o motivo é medido: com `min(30rem)` a grade caía para 3
    // colunas, quebrava em duas linhas e a prévia passava 9px da caixa de demonstração — que a
    // ADR-0002 proíbe, e o `catalog-sweep` reprovou. Solta, a grade preenche a largura do painel
    // numa linha só, que é justamente o que `auto-fill` existe para fazer.
    // `width:100%` no invólucro: o painel da prévia é flex e centraliza, então o `div` solto
    // encolhia até a largura mínima e a grade caía para DUAS colunas em duas linhas — 10px além
    // da caixa depois da escala de letra da 0.8.8. Com a largura do painel, fica uma linha só.
    // E a largura de QUATRO colunas, e não a do painel inteiro (21/10/2026): a grade reparte o painel em colunas de
    // `--gallery-min`, e as que sobram ficavam vazias à direita — as quatro fotos encostadas à esquerda.
    render: () => h("div", {style: {width: "min(100%, calc(var(--gallery-min, 8rem) * 4 + var(--space-3) * 3))"}},
      h(A.Gallery, {label: "Product photos", selected: "back", zoom: true,
        items: ["Front", "Back", "In use", "Packaging"].map(t =>
          ({id: t.toLowerCase().replace(" ", ""), src: FOTO, alt: t, caption: t}))})),
    examples: [
      {
        title: "Choosing several",
        description: 'With selectionMode="multiple" every tile is a toggle: click to add or remove it, in the order chosen.',
        code: `<Gallery
  label="Photos to share"
  items={photos}
  selectionMode="multiple"
  selectedIds={chosen}
  onSelectionChange={setChosen}
/>`,
        render: () => h("div", {style: {width: "min(100%, calc(var(--gallery-min, 8rem) * 4 + var(--space-3) * 3))"}}, h(GaleriaDeVarias)),
      },
    ],
  },
  // SortableList (L3). A prévia é ESTÁTICA e reordenar exige estado, então o que ela mostra é a
  // anatomia: alça focável, rótulo, e a lista na ordem que o consumidor mandou. O código traz o
  // `onReorder` inteiro, porque é ele que o consumidor precisa copiar.
  SortableList: {
    description: "Reorder by dragging with mouse, touch or pen — and by keyboard, which is not an "
      + "extra here: without it the component would not ship. Space picks up, arrows move, Space "
      + "drops, Escape puts it back, and every step is announced.",
    code: `const [items, setItems] = useState([
  {id: "a", label: "Draft"},
  {id: "b", label: "In review"},
  {id: "c", label: "Published"},
]);

<SortableList
  label="Pipeline stages"
  items={items}
  onReorder={(from, to) => setItems(prev => {
    const next = [...prev];
    next.splice(to, 0, ...next.splice(from, 1));
    return next;
  })}
/>`,
    render: () => h("div", {style: {width: "min(24rem,100%)"}},
      h(ComOrdem, {componente: A.SortableList, label: "Pipeline stages", items: [
        {id: "a", label: "Draft"}, {id: "b", label: "In review"}, {id: "c", label: "Published"}]})),
  },
  // BlockEditor (N1). A PRÉVIA É A EXPLICAÇÃO DO COMPONENTE: o que aparece com pele da Aurea é a
  // moldura — trilho, alça, remover, e a caixa onde o bloco mora. O que está DENTRO dos blocos é
  // conteúdo do consumidor (um título, um campo, uma figura com legenda), e é por isso que o
  // exemplo mistura três coisas diferentes lá dentro sem o componente saber o que são. Nada de
  // negrito ou itálico aqui, e não é omissão: o motor de texto rico não é nosso (ADR-0025).
  BlockEditor: {
    description: "The frame around content blocks — order, handle, removal, and the slot where "
      + "your own editor goes. Aurea does not own the rich text: no bold, no bubble menu, no "
      + "paste handling. That engine stays with you, along with the sanitizing it requires.",
    code: `const [blocks, setBlocks] = useState([
  {id: "t", kind: "Heading", children: <h2>The joke tax</h2>},
  {id: "p", kind: "Text", children: <Textarea aria-label="Paragraph" defaultValue="…" />},
  {id: "i", kind: "Image", children: (
    <figure><Image src={photo} alt="The king" ratio="16/9" /><figcaption>The king</figcaption></figure>
  )},
]);

<BlockEditor
  label="Article"
  blocks={blocks}
  onReorder={(from, to) => setBlocks(prev => {
    const next = [...prev];
    next.splice(to, 0, ...next.splice(from, 1));
    return next;
  })}
  onRemove={i => setBlocks(prev => prev.filter((_, n) => n !== i))}
/>`,
    // A caixa de demo tem teto e a ADR-0002 proíbe prévia que exige rolagem. Foi medido duas
    // vezes: a primeira versão dava 502px numa caixa de 354, e com foto menor ainda dava 382. Ficam
    // os DOIS blocos que o próprio item N1 nomeia — texto e imagem com legenda —, que é o que a
    // prévia tem para dizer: uma moldura só, conteúdos diferentes dentro. O bloco de título saiu da
    // prévia e continua no `code` abaixo, onde não custa altura.
    render: () => h("div", {style: {width: "min(22rem,100%)"}},
      h(ComOrdem, {componente: A.BlockEditor, lista: "blocks", label: "Article", onRemove: () => {}, blocks: [
        {id: "p", kind: "Text", children: h(A.Textarea, {"aria-label": "Paragraph", rows: 2,
          defaultValue: "The king came up with a plan."})},
        {id: "i", kind: "Image", children: h("figure", {style: {margin: 0}},
          h(A.Image, {src: FOTO, alt: "The king", ratio: "3/1"}),
          h("figcaption", null, "The king"))}]})),
  },
  // Prose (L5). O exemplo é JSX à mão, e não Markdown, de propósito: o componente NÃO é o parser,
  // e mostrar um `react-markdown` aqui ensinaria o contrário. O que a prévia prova é que elementos
  // crus — título, parágrafo, citação, lista, código e tabela — chegam legíveis sem uma classe.
  Prose: {
    description: "The skin for long-form text. Bring your own Markdown renderer; Prose styles the "
      + "elements it produces, and every rule is scoped so it never leaks into the rest of the page.",
    code: `<Prose>
  <h2>The joke tax</h2>
  <p>The king thought long and hard, and finally came up with <a href="#">a plan</a>.</p>
  <blockquote>Everyone enjoys a good joke, so it is only fair that they pay.</blockquote>
  <ul><li>Puns: 5 coins</li><li>One-liners: 20 coins</li></ul>
</Prose>`,
    render: () => h(A.Prose, null,
      h("h2", null, "The joke tax"),
      h("p", null, "The king thought long and hard, and finally came up with ",
        h("a", {href: "#"}, "a plan"), " — he would tax the jokes in the kingdom."),
      h("blockquote", null, "Everyone enjoys a good joke, so it is only fair that they pay."),
      h("ul", null, h("li", null, "Puns: 5 coins"), h("li", null, "One-liners: 20 coins"))),
  },
  // ThemeToggle (25/09/2026): a prévia troca o tema do catálogo DE VERDADE — é a prova de que o
  // botão manda no `<html>`, e de que o ícone muda de cor junto (lua escura, sol amarelo).
  ThemeToggle: {
    description: "The light/dark switch, with colour in the glyph: a dark moon in the light theme, "
      + "the brand yellow sun in the dark one. It shows where it goes, and its name says so.",
    code: `<ThemeToggle />`,
    render: () => h(A.ThemeToggle, null),
    examples: [
      {
        title: "Three positions — light, dark and the system",
        description: "mode=\"light-dark-system\" is the switch at the top of this site: three choices in one capsule, "
          + "and \"System\" follows the computer. It is a radio group named \"Theme\": Tab enters on the chosen one, "
          + "the arrows move and choose.",
        code: `<ThemeToggle mode="light-dark-system" />`,
        render: () => h(A.ThemeToggle, {mode: "light-dark-system"}),
      },
      eixo({titulo: "Sizes", descricao: "The control sizes, from xs to xl; on a touch screen every size floors at 44.",
        Comp: A.ThemeToggle, nome: "ThemeToggle", prop: "size", valores: ["xs", "sm", "md", "lg", "xl"]}),
    ],
  },
  // Tipografia (B-02, 25/09/2026), no molde da referência: uma lista fechada de papéis. As
  // prévias mostram a lista INTEIRA de cada peça, porque o que se escolhe é o papel — ver todos lado
  // a lado é o que ensina que não existe "um tamanho entre o h3 e o h4".
  Text: {
    description: "Text in one of a closed list of roles — a heading level, body text or code — "
      + "never a loose size. It stays a span; for a real heading, paragraph or code use those pieces.",
    code: `<Text>Body text</Text>
<Text type="body-sm" color="muted">Supporting text</Text>
<Text type="h4">Looks like a heading, reads as text</Text>
<Text weight="semibold">Semibold</Text>
<Text weight="extrabold">Extrabold, for a cover title</Text>
<Text numeric>$ 41,118.00</Text>`,
    // GAR-16 (0.28.0): o 800 opcional e os algarismos da mesma largura.
    render: () => h(A.Stack, {gap: "tight"},
      h(A.Text, null, "Body text"),
      h(A.Text, {type: "body-sm", color: "muted"}, "Supporting text"),
      h(A.Text, {type: "h4"}, "Looks like a heading, reads as text"),
      h(A.Text, {weight: "semibold"}, "Semibold"),
      h(A.Text, {weight: "extrabold"}, "Extrabold, for a cover title"),
      h(A.Text, {numeric: true}, "$ 41,118.00")),

    examples: [
      eixo({titulo: "Roles", descricao: "The closed list of roles. A role is a size, a weight and a line height together — there is no size between h3 and h4.",
        Comp: A.Text, nome: "Text", prop: "type", valores: ["h1", "h2", "h3", "h4", "h5", "h6", "body", "body-sm", "body-xs", "code"],
        filho: (v) => `Role ${v}`, coluna: true}),
      eixo({titulo: "Weights", descricao: "The role keeps its size; weight only changes how heavy it reads. extrabold (800) is for a cover title.",
        Comp: A.Text, nome: "Text", prop: "weight", valores: ["normal", "medium", "semibold", "bold", "extrabold"], filho: (v) => `Weight ${v}`, coluna: true}),
      eixo({titulo: "Tones", descricao: "The text colour, with the same names as the native package. Every tone passes 4.5:1 on the page in both themes.",
        Comp: A.Text, nome: "Text", prop: "tone", valores: ["default", "muted", "subtle", "primary", "link", "info", "success", "warning", "danger"], filho: (v) => `Tone ${v}`, coluna: true}),
      eixo({titulo: "Alignment", descricao: "start and end follow the writing direction, so the same value mirrors in a right-to-left page.",
        Comp: A.Text, nome: "Text", prop: "align", valores: ["start", "center", "end", "justify"], filho: (v) => `Aligned to ${v}`, coluna: true}),
    ],
  },
  Heading: {
    // Do 2 ao 6, e não do 1: uma página tem UM h1, e aqui ele é o título da própria página do
    // catálogo (a varredura cobra). É também a lição da peça — o h1 é o título da tela, uma vez só.
    description: "A heading, h1 to h6. The level picks both the element and the size, as in the reference library — "
      + "keep levels in order, and use level 1 once per page, for its title.",
    code: `<Heading level={2}>This month</Heading>
<Heading level={3}>By team</Heading>
<Heading level={4}>Analyst</Heading>
<Heading level={5}>Notes</Heading>
<Heading level={6}>Footnote</Heading>`,
    render: () => h(A.Stack, {gap: "tight"},
      ...[["2", "This month"], ["3", "By team"], ["4", "Analyst"], ["5", "Notes"], ["6", "Footnote"]]
        .map(([n, t]) => h(A.Heading, {key: n, level: Number(n)}, t))),

    examples: [
      eixo({titulo: "Weights", descricao: "The role keeps its size; weight only changes how heavy it reads. extrabold (800) is for a cover title.",
        Comp: A.Heading, nome: "Heading", base: {level: 3}, prop: "weight", valores: ["normal", "medium", "semibold", "bold", "extrabold"], filho: (v) => `Heading, ${v}`, coluna: true}),
      eixo({titulo: "Tones", descricao: "The text colour, with the same names as the native package. Every tone passes 4.5:1 on the page in both themes.",
        Comp: A.Heading, nome: "Heading", base: {level: 3}, prop: "tone", valores: ["default", "muted", "subtle", "primary", "link", "info", "success", "warning", "danger"], filho: (v) => `Heading, ${v}`, coluna: true}),
      eixo({titulo: "Alignment", descricao: "start and end follow the writing direction, so the same value mirrors in a right-to-left page.",
        Comp: A.Heading, nome: "Heading", base: {level: 3}, prop: "align", valores: ["start", "center", "end", "justify"], filho: (v) => `Heading, ${v}`, coluna: true}),
    ],
  },
  Paragraph: {
    description: "A paragraph of body text at 16, 14 or 12px, with relaxed leading.",
    code: `<Paragraph>The weekly report is ready for review.</Paragraph>
<Paragraph size="sm">Generated by Writer at 09:40.</Paragraph>
<Paragraph size="xs" color="muted">Figures are rounded to the nearest unit.</Paragraph>`,
    render: () => h(A.Stack, {gap: "tight"},
      h(A.Paragraph, null, "The weekly report is ready for review."),
      h(A.Paragraph, {size: "sm"}, "Generated by Writer at 09:40."),
      h(A.Paragraph, {size: "xs", color: "muted"}, "Figures are rounded to the nearest unit.")),

    examples: [
      eixo({titulo: "Weights", descricao: "The role keeps its size; weight only changes how heavy it reads. extrabold (800) is for a cover title.",
        Comp: A.Paragraph, nome: "Paragraph", prop: "weight", valores: ["normal", "medium", "semibold", "bold", "extrabold"], filho: (v) => `A paragraph in ${v}.`, coluna: true}),
      eixo({titulo: "Tones", descricao: "The text colour, with the same names as the native package. Every tone passes 4.5:1 on the page in both themes.",
        Comp: A.Paragraph, nome: "Paragraph", prop: "tone", valores: ["default", "muted", "subtle", "primary", "link", "info", "success", "warning", "danger"], filho: (v) => `A paragraph in ${v}.`, coluna: true}),
      eixo({titulo: "Alignment", descricao: "start and end follow the writing direction, so the same value mirrors in a right-to-left page.",
        Comp: A.Paragraph, nome: "Paragraph", prop: "align", valores: ["start", "center", "end", "justify"], filho: (v) => `A paragraph aligned to ${v}: the weekly report is ready for review, with the figures rounded to the nearest unit and the notes at the end.`, coluna: true}),
    ],
  },
  Code: {
    description: "A short piece of code inside a sentence. For a block with copy and highlighting, CodeBlock.",
    code: `<Paragraph>Run <Code>pnpm build</Code> before you publish.</Paragraph>`,
    render: () => h(A.Paragraph, null, "Run ", h(A.Code, null, "pnpm build"), " before you publish."),

    examples: [
      eixo({titulo: "Weights", descricao: "The role keeps its size; weight only changes how heavy it reads. extrabold (800) is for a cover title.",
        Comp: A.Code, nome: "Code", prop: "weight", valores: ["normal", "medium", "semibold", "bold", "extrabold"], filho: (v) => `weight-${v}`, coluna: true}),
      eixo({titulo: "Tones", descricao: "The text colour, with the same names as the native package. Every tone passes 4.5:1 on the page in both themes.",
        Comp: A.Code, nome: "Code", prop: "tone", valores: ["default", "muted", "subtle", "primary", "link", "info", "success", "warning", "danger"], filho: (v) => `tone-${v}`, coluna: true}),
      eixo({titulo: "Alignment", descricao: "start and end follow the writing direction, so the same value mirrors in a right-to-left page.",
        Comp: A.Code, nome: "Code", prop: "align", valores: ["start", "center", "end", "justify"], filho: (v) => `align-${v}`, coluna: true}),
    ],
  },
  // O carrossel (L1) não tem motor, e esta página é a prova: o catálogo é HTML ESTÁTICO, sem uma
  // linha de JavaScript, e a faixa continua rolando com o dedo, com a roda e com as setas do
  // teclado — porque quem rola é o contêiner nativo. O que não funciona aqui são as setas e os
  // pontos, que precisam saber em qual slide se está. É exatamente a fronteira do componente.
  Carousel: {
    description: "Slides that snap, in a native scroll container — no carousel engine. How many "
      + "show at once is CSS (--carousel-slide), not a prop, because that is a layout decision.",
    code: `<Carousel label="Product photos" style={{"--carousel-slide": "50%"} as CSSProperties}>
  <Card>Front</Card>
  <Card>Back</Card>
  <Card>In use</Card>
  <Card>Packaging</Card>
</Carousel>`,
    render: () => h("div", {style: wide},
      h(A.Carousel, {label: "Product photos", style: {"--carousel-slide": "50%"}},
        ...["Front", "Back", "In use", "Packaging"].map((t, i) =>
          h(A.Card, {key: i}, h("div", {style: stack},
            h("strong", null, t), h("span", {className: "muted"}, `Photo ${i + 1}`)))))),
  },
  // Mês fixo (agosto de 2026) e não "hoje": preview de página estática que muda sozinha faz o
  // gate de pixel reprovar todo dia 1º, e o diff não diria nada a ninguém.
  // `today` TAMBÉM é fixo, e isso não foi previsão: congelar só o mês deixou `data-today` cair
  // numa célula diferente a cada dia, e o `dist == build` da CI reprovou o commit — na minha
  // máquina era 1º de agosto, no runner já era 2. Preview gerado não pode ler o relógio.
  Calendar: {
    install: 'import {Calendar} from "@aurea-uds/react/calendar";',
    description: "Pick a range, with the days before check-in closed. This is what a native date "
      + "input cannot do — for one plain date, prefer <Input type=\"date\" />.",
    code: `<Calendar
  mode="range"
  label="Stay"
  defaultMonth={new Date(2026, 7, 1)}
  selected={{from: new Date(2026, 7, 12), to: new Date(2026, 7, 18)}}
  disabled={{before: new Date(2026, 7, 6)}}
/>`,
    render: () => h(Calendar, {mode: "range", label: "Stay",
      defaultMonth: MES_FIXO, today: MES_FIXO,
      selected: {from: new Date(2026, 7, 12), to: new Date(2026, 7, 18)},
      disabled: {before: new Date(2026, 7, 6)}}),
  },
  CodeBlock: {
    description: "Code to read and copy. With lineNumbers, the number of each line; with highlight, the colors — pass "
      + "highlightCode from @aurea-uds/react/code-highlight (its grammars are optional peers). Without them, plain text.",
    code: `import {CodeBlock} from "@aurea-uds/react";
import {highlightCode} from "@aurea-uds/react/code-highlight";

<CodeBlock language="tsx" copyable lineNumbers highlight={highlightCode}>
  {code}
</CodeBlock>`,
    render: () => h("div", {style: wide}, h(A.CodeBlock, {language: "tsx", copyable: true, lineNumbers: true, highlight: highlightCode},
      `import {Button} from "@aurea-uds/react";

// Saves the draft, then goes back.
export function Actions() {
  return <Button variant="primary" size="sm">Save</Button>;
}`)),
  },
  Chip: {
    description: "Another name for Badge: the same component, the same props, the same look. "
      + "Use whichever name your team reads more easily; every example on the Badge page works with Chip.",
    code: `<Cluster>
  <Chip tone="success">Paid</Chip>
  <Chip tone="primary" emphasis="solid">New</Chip>
  <Chip tone="blue">Design</Chip>
</Cluster>`,
    render: () => h(A.Cluster, null, h(A.Chip, {tone: "success"}, "Paid"),
      h(A.Chip, {tone: "primary", emphasis: "solid"}, "New"), h(A.Chip, {tone: "blue"}, "Design")),
  },
  Cluster: {
    code: `<Cluster>
  <Badge>one</Badge>
  <Badge>two</Badge>
  <Badge>three</Badge>
</Cluster>`,
    render: () => h(A.Cluster, null, h(A.Badge, null, "one"), h(A.Badge, null, "two"),
      h(A.Badge, null, "three")),
    examples: [
      eixo({titulo: "Gap", descricao: "The space between the items, from the density scale: tight, normal or loose.",
        Comp: A.Cluster, nome: "Cluster", prop: "gap", valores: ["tight", "normal", "loose"], coluna: true, filho: () => GRUPO_DE_TRES}),
      eixo({titulo: "Justify", descricao: "Where the row sits along the line. between pushes the first and the last item to the ends.",
        Comp: A.Cluster, nome: "Cluster", prop: "justify", valores: ["start", "center", "end", "between"],
        estilo: {display: "grid", gap: "var(--space-3)", width: "100%"}, filho: () => GRUPO_DE_TRES}),
      eixo({titulo: "Align", descricao: "How items of different heights line up across the row. baseline lines up the text.",
        Comp: A.Cluster, nome: "Cluster", prop: "align", valores: ["start", "center", "end", "baseline"], coluna: true,
        filho: () => ({codigo: `
  <Button size="lg">Large</Button>
  <Badge>Small</Badge>
`, elemento: [h(A.Button, {key: 1, size: "lg"}, "Large"), h(A.Badge, {key: 2}, "Small")]})}),
    ],
  },
  CommandPalette: {
    description: "The palette with the engine wired up: commands are data, it filters as you "
      + "type, moves with the arrows and runs with Enter. Closing happens BEFORE the command "
      + "runs, so one that navigates does not leave the palette over the new screen. For a "
      + "palette whose chrome you compose yourself, the Shell is next door.",
    install: 'import {CommandPalette} from "@aurea-uds/react";',
    code: `<Button leadingIcon="magnifying-glass" kbd="⌘K" onClick={() => setOpen(true)}>Search</Button>

<CommandPalette open={open} onClose={() => setOpen(false)} items={[
  {id: "button", label: "Button", icon: "squares-four", group: "Components", run: () => go("/button")},
  {id: "close", label: "CloseButton", icon: "squares-four", group: "Components", run: () => go("/close-button")},
  {id: "theme", label: "Toggle theme", icon: "moon", kbd: "⌘T", group: "Actions", run: toggleTheme},
]} />
// Items with a group come together under its title; the line under the list teaches the keys.`,
    render: () => h(AbrePaleta),
  },
  CommandPaletteShell: {
    // O texto e o exemplo ficaram para trás quando a casca virou janela do motor, com `onClose` (lote R, 16/10/2026):
    // diziam "não modal" e abriam a paleta já aberta. Com a parte viva (21/10/2026), aberta de saída ela cobria a página
    // inteira e prendia o foco ao carregar. Agora é como a CommandPalette ao lado: o botão abre.
    description: "The window of the palette, with the search field on top: you compose the list, and you own open and "
      + "query. It is a modal dialog — Esc and a click outside call onClose. For the palette with the commands wired "
      + "up, use CommandPalette.",
    code: `<Button leadingIcon="magnifying-glass" onClick={() => setOpen(true)}>Open palette</Button>

<CommandPaletteShell open={open} query={query} onQueryChange={setQuery} onClose={() => setOpen(false)}>
  <div className="menu">
    <button className="menu-item" type="button">Go to Button</button>
    <button className="menu-item" type="button">Toggle theme</button>
  </div>
</CommandPaletteShell>`,
    render: () => h(AbreCasca),
  },
  ContextMenu: {
    code: `<ContextMenu label="Row actions" items={[
  {label: "Rename", leadingIcon: "pencil-simple"},
  "separator",
  {label: "Delete", leadingIcon: "trash"},
]}>
  <Card>Right-click me, or focus and press Shift+F10.</Card>
</ContextMenu>`,
    render: () => h("div", {style: wide}, h(A.ContextMenu, {label: "Row actions", items: [
      {label: "Rename", leadingIcon: "pencil-simple"}, "separator",
      {label: "Delete", leadingIcon: "trash"},
    ]}, h(A.Card, null, "Right-click me, or focus and press Shift+F10."))),
  },
  DataList: {
    code: `<DataList items={[
  {term: "Plan", value: "Pro"},
  {term: "Seats", value: "12"},
]} />`,
    render: () => h("div", {style: ate}, h(A.DataList, {items: [{term: "Plan", value: "Pro"},
      {term: "Seats", value: "12"}]})),
  },
  DataState: {
    description: "The same screen has four faces, and the one everyone gets wrong is the fourth: "
      + "when the data is merely OLD, the content stays and the notice goes above it. Hiding what "
      + "the reader already had, because it went stale, loses information they were using — the "
      + "same decision DataGrid took.",
    install: 'import {DataState} from "@aurea-uds/react";',
    code: `<DataState state={query.state} message={query.error} skeleton={<InvoiceSkeleton />}
  emptyTitle="No invoices" action={<Button variant="primary">New invoice</Button>}>
  {() => <InvoiceTable rows={query.data} />}
</DataState>`,
    render: () => h("div", {style: {...stack, ...wide}},
      // TRÊS faces e não as quatro: com a de erro junto, a prévia media 374px numa caixa de 354
      // e passava a rolar — a ADR-0002 diz que quem cede é o conteúdo. A face de erro é um Alert,
      // e o Alert já aparece na de `stale`; o que cada uma faz está na lede e no código.
      h(A.DataState, {state: "loading"}, h("p", null, "120 rows")),
      h(A.DataState, {state: "empty", emptyTitle: "No invoices"}, h("p", null, "120 rows")),
      // o quarto: o conteudo CONTINUA, com o aviso em cima
      h(A.DataState, {state: "stale"}, h("p", null, "120 rows"))),

    examples: [
      eixo({titulo: "Every state", descricao: "The three terminal faces (loading, error, empty) replace the content; every other state keeps the content and puts its notice above it.",
        Comp: A.DataState, nome: "DataState", prop: "state", valores: ["loading", "error", "empty", ...["stale", "partial", "degraded", "offline", "waiting_user", "waiting_approval", "waiting_dependency"]], coluna: true,
        estilo: {display: "grid", gap: "var(--space-4)", ...wide},
        filho: () => ({codigo: "<p>120 rows</p>", elemento: h("p", null, "120 rows")})}),
    ],
  },
  Dialog: {
    code: `<Button variant="danger" onClick={() => setOpen(true)}>Delete project</Button>

<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Delete project"
  icon="trash"
  iconTone="danger"
  footer={<><Button variant="tertiary" onClick={() => setOpen(false)}>Cancel</Button>
    <Button variant="danger" onClick={remove}>Delete</Button></>}
>
  This removes every component and token in it. It cannot be undone.
</Dialog>`,
    render: () => h(AbreDialog),
    examples: [
      janelas({titulo: "Placement", descricao: "auto, the default, sits at the bottom on a phone (where the thumb is) and in the "
        + "centre from 640 up. bottom, center and top fix it in one place on every screen.",
        Comp: A.Dialog, prop: "placement", valores: ["auto", "bottom", "center", "top"],
        props: (v, fecha) => ({onClose: fecha, title: `Placement ${v}`, children: `This dialog uses placement="${v}".`}),
        codigo: v => `<Dialog open={open} onClose={close} title="Placement ${v}" placement="${v}">…</Dialog>`}),
      janelas({titulo: "Sizes", descricao: "The width: xs 320, sm 384, md 448 (the default), lg 512, xl 1024 and full, the whole "
        + "screen.", Comp: A.Dialog, prop: "size", valores: ["xs", "sm", "md", "lg", "xl", "full"],
        props: (v, fecha) => ({onClose: fecha, title: `Size ${v}`, children: `This dialog uses size="${v}".`}),
        codigo: v => `<Dialog open={open} onClose={close} title="Size ${v}" size="${v}">…</Dialog>`}),
      janelas({titulo: "Icon tones", descricao: "The colour of the circle behind the icon: the state colours, or brand.",
        Comp: A.Dialog, prop: "iconTone", valores: ["neutral", "brand", "info", "success", "warning", "danger"],
        props: (v, fecha) => ({onClose: fecha, title: `Icon tone ${v}`, icon: "info", children: `This dialog uses iconTone="${v}".`}),
        codigo: v => `<Dialog open={open} onClose={close} title="Icon tone ${v}" icon="info" iconTone="${v}">…</Dialog>`}),
    ],
  },
  AccessGate: {
    description: "You decide who can do what; this decides how the answer LOOKS. Two ways, and "
      + "picking wrong is the common mistake: hide when the action would mean nothing to this "
      + "person, disable when they should know it exists and why it is closed. It is not "
      + "security — hiding a button stops nobody from calling the API.",
    install: 'import {AccessGate} from "@aurea-uds/react";',
    code: `<AccessGate allowed={can("publish")}>
  <Button variant="primary">Publish</Button>
</AccessGate>

<AccessGate allowed={can("publish")} mode="disable" reason="Only an editor can publish">
  <Button variant="primary">Publish</Button>
</AccessGate>`,
    render: () => h("div", {style: row},
      h(A.AccessGate, {allowed: true}, h(A.Button, {variant: "primary"}, "Publish")),
      // negado + desabilitar: o preview mostra o controle inerte. O balão do motivo vive num
      // portal e só aparece no hover, como em toda dica — a lede explica.
      h(A.AccessGate, {allowed: false, mode: "disable", reason: "Only an editor can publish"},
        h(A.Button, {variant: "primary"}, "Publish"))),
  },
  ConfirmDialog: {
    description: "The difference from Dialog is not how it looks — it is that a click outside cannot answer for the "
      + "user, and the focus opens on the safe button.",
    code: `<Button variant="danger" onClick={() => setOpen(true)}>Delete article</Button>

<ConfirmDialog
  open={open}
  title="Delete this article?"
  description="It leaves the site immediately, and this cannot be undone."
  confirmLabel="Delete"
  destructive
  icon="trash"
  onConfirm={() => { remove(); setOpen(false); }}
  onCancel={() => setOpen(false)}
/>`,
    render: () => h(AbreConfirmDialog),
    examples: [
      janelas({titulo: "Placement", descricao: "The same four places as Dialog: auto (bottom on a phone, centre from 640 up), "
        + "bottom, center and top.", Comp: A.ConfirmDialog, prop: "placement", valores: ["auto", "bottom", "center", "top"],
        props: (v, fecha) => ({title: `Placement ${v}`, description: `This confirmation opens at ${v}.`,
          confirmLabel: "Confirm", onConfirm: fecha, onCancel: fecha}),
        codigo: v => `<ConfirmDialog open={open} title="Placement ${v}" description="This confirmation opens at ${v}." placement="${v}" onConfirm={confirm} onCancel={close} />`}),
      janelas({titulo: "Icon tones", descricao: "The colour of the circle behind the icon. destructive picks danger on its own.",
        Comp: A.ConfirmDialog, prop: "iconTone", valores: ["neutral", "brand", "info", "success", "warning", "danger"],
        props: (v, fecha) => ({title: `Icon tone ${v}`, description: `The circle behind the icon is ${v}.`, icon: "info",
          confirmLabel: "Confirm", onConfirm: fecha, onCancel: fecha}),
        codigo: v => `<ConfirmDialog open={open} title="Icon tone ${v}" description="The circle behind the icon is ${v}." icon="info" iconTone="${v}" onConfirm={confirm} onCancel={close} />`}),
    ],
  },
  Drawer: {
    code: `<Button onClick={() => setOpen(true)}>Edit member</Button>

<Drawer open={open} onClose={() => setOpen(false)} title="Edit member" side="right"
  footer={<Button variant="primary">Save</Button>}>
  <Field label="Name"><Input defaultValue="Analyst" /></Field>
</Drawer>

// On a phone, the panel that rises from the bottom (swipe down to close):
<Drawer open={open} onClose={() => setOpen(false)} title="Filters" side="bottom">…</Drawer>`,
    render: () => h(AbreDrawer),
    examples: [
      janelas({titulo: "Sides", descricao: "Which edge the panel comes from. bottom is the sheet that rises on a phone, with a 32 corner.",
        Comp: A.Drawer, prop: "side", valores: ["right", "left", "top", "bottom"],
        props: (v, fecha) => ({onClose: fecha, title: `Side ${v}`, children: `This panel uses side="${v}".`}),
        codigo: v => `<Drawer open={open} onClose={close} title="Side ${v}" side="${v}">…</Drawer>`}),
    ],
  },
  DropdownMenu: {
    code: `<DropdownMenu
  label="Record actions"
  trigger={<Button variant="outline" trailingIcon="caret-down">Actions</Button>}
  items={[
    {label: "Duplicate", leadingIcon: "copy"},
    {label: "Rename", leadingIcon: "pencil-simple"},
    "separator",
    {label: "Delete", leadingIcon: "trash"},
  ]}
/>`,
    render: () => h(A.DropdownMenu, {label: "Record actions",
      trigger: h(A.Button, {variant: "outline", trailingIcon: "caret-down"}, "Actions"),
      items: [{label: "Duplicate", leadingIcon: "copy"}, {label: "Rename", leadingIcon: "pencil-simple"},
        "separator", {label: "Delete", leadingIcon: "trash"}]}),
    examples: [
      cada({titulo: "Sides", descricao: "Which side of the trigger it opens on. When there is no room on that side, it flips to the opposite one.", valores: ["top", "right", "bottom", "left"],
        codigo: v => `<DropdownMenu label="Side ${v}" side="${v}" trigger={<Button variant="outline">Side ${v}</Button>} items={[{label: "Duplicate"}, {label: "Rename"}]} />`,
        peca: v => h(A.DropdownMenu, {label: `Side ${v}`, side: v, trigger: h(A.Button, {variant: "outline"}, `Side ${v}`),
          items: [{label: "Duplicate"}, {label: "Rename"}]})}),
    ],
  },
  EmptyState: {
    code: `<EmptyState
  titleAs="h2"
  title="No results"
  description="Try a different filter."
  action={<Button variant="primary" leadingIcon="plus">New project</Button>}
/>`,
    render: () => h("div", {style: wide}, h(A.EmptyState, {titleAs: "h2", title: "No results",
      description: "Try a different filter.",
      action: h(A.Button, {variant: "primary", leadingIcon: "plus"}, "New project")})),

    examples: [
      eixo({titulo: "Every state", descricao: "With a state, the empty view says why it is empty. It stays neutral on purpose: an absence is not an alarm.",
        Comp: A.EmptyState, nome: "EmptyState", prop: "state", valores: ["stale", "partial", "degraded", "offline", "waiting_user", "waiting_approval", "waiting_dependency"], base: {titleAs: "h4", title: "Nothing to show"},
        estilo: {display: "grid", gap: "var(--space-4)", ...wide}}),
      eixo({titulo: "The title's tag", descricao: "The heading level belongs to the page, not to the component: h3 by default, the level that fits where it sits, or p when it is not a heading at all.",
        Comp: A.EmptyState, nome: "EmptyState", prop: "titleAs", valores: ["h3", "h4", "p"], base: {title: "No results", description: "Try a different filter."},
        estilo: {display: "grid", gap: "var(--space-4)", ...wide}}),
    ],
  },
  Form: {
    description: "Aurea shows the error; you decide what an error is. Pass what you already "
      + "validated — a schema, a server action, the API's answer — keyed by the field's name, "
      + "and it lands on the control itself: red on screen AND invalid to a screen reader. No "
      + "form library is a dependency here, because marrying one would force every project using "
      + "Aurea to adopt it.",
    install: 'import {Form, Field, Input, Button} from "@aurea-uds/react";',
    code: `<Form errors={errors} onSubmit={values => save(values)}>
  <Field label="E-mail" name="email"><Input name="email" type="email" /></Field>
  <Field label="Display name" name="nickname"><Input name="nickname" /></Field>
  <Button type="submit" variant="primary">Save</Button>
</Form>`,
    render: () => h("div", {style: wide},
      h(A.Form, {errors: {email: "An account with this e-mail already exists"}},
        h(A.Field, {label: "E-mail", name: "email"}, h(A.Input, {name: "email", type: "email", defaultValue: "team@acme.dev"})),
        h(A.Field, {label: "Display name", name: "nickname"}, h(A.Input, {name: "nickname", defaultValue: "Analyst"})),
        h(A.Button, {type: "submit", variant: "primary"}, "Save"))),
  },
  Grid: {
    code: `<Grid>
  <Card>One</Card>
  <Card>Two</Card>
  <Card>Three</Card>
</Grid>`,
    render: () => h("div", {style: {width: "100%"}}, h(A.Grid, null,
      h(A.Card, null, "One"), h(A.Card, null, "Two"), h(A.Card, null, "Three"))),
    examples: [
      eixo({titulo: "Gap", descricao: "The space between the cells, from the density scale: tight, normal or loose.",
        Comp: A.Grid, nome: "Grid", prop: "gap", valores: ["tight", "normal", "loose"], estilo: {display: "grid", gap: "var(--space-6)", width: "100%"},
        filho: () => ({codigo: `
  <Card>One</Card>
  <Card>Two</Card>
  <Card>Three</Card>
`, elemento: ["One", "Two", "Three"].map(n => h(A.Card, {key: n}, n))})}),
    ],
  },
  // GAR-02 a GAR-05 (06/10/2026): a página de site. A prévia mostra as três peças juntas, porque é
  // assim que elas trabalham: a faixa de ponta a ponta, o container de leitura, e a grade de 12.
  Container: {
    description: "The reading width of a website page: centred, capped at 1280 by default, with a "
      + "side gutter of 16 that grows to 32 from the md breakpoint. It goes inside a Section.",
    code: `<Container size="sm">
  <Card>Content, centred and capped</Card>
</Container>`,
    render: () => h("div", {style: {width: "100%"}}, h(A.Container, {size: "sm"},
      h(A.Card, null, "Content, centred and capped"))),
    examples: [
      eixo({titulo: "Sizes", descricao: "The cap, on the width scale: sm 640, md 768, lg 1024, xl 1280 (the default), 2xl 1536, docs (the text column of a documentation page) and full, no cap. In this box the larger ones fill the width.",
        Comp: A.Container, nome: "Container", prop: "size", valores: ["sm", "md", "lg", "xl", "2xl", "docs", "full"],
        estilo: {display: "grid", gap: "var(--space-3)", width: "100%"},
        filho: (v) => ({codigo: `<Card>size ${v}</Card>`, elemento: h(A.Card, null, `size ${v}`)})}),
    ],
  },
  Section: {
    description: "An edge-to-edge band of a website page, with its own surface and site spacing. "
      + "theme=\"dark\" makes a dark band inside a light page; nothing of the page's light theme leaks in.",
    code: `<Section theme="dark" aria-labelledby="t-app">
  <Container>
    <Grid columns={12}>
      <Grid.Item span={{base: "12", viewport: {md: "7"}}}>
        <Heading id="t-app" level={2}>A dark band</Heading>
      </Grid.Item>
      <Grid.Item span={{base: "12", viewport: {md: "5"}}}>
        <Button variant="primary-outline">Its own theme</Button>
      </Grid.Item>
    </Grid>
  </Container>
</Section>`,
    render: () => h("div", {style: {width: "100%"}}, h(A.Section, {theme: "dark", spacing: "sm"},
      h(A.Container, null, h(A.Grid, {columns: 12},
        h(A.Grid.Item, {span: {base: "12", viewport: {md: "7"}}}, h("strong", null, "A dark band")),
        h(A.Grid.Item, {span: {base: "12", viewport: {md: "5"}}}, h(A.Button, {variant: "primary-outline"}, "Its own theme")))))),
    examples: [
      eixo({titulo: "Surfaces", descricao: "The band's background: the page's (the default), a card surface, or the recessed inset one.",
        Comp: A.Section, nome: "Section", prop: "surface", valores: ["background", "card", "inset"], base: {spacing: "sm"},
        estilo: {display: "grid", width: "100%"},
        filho: (v) => ({codigo: `<Container>surface ${v}</Container>`, elemento: h(A.Container, null, `surface ${v}`)})}),
      eixo({titulo: "A theme for the band", descricao: "The band takes its own theme, whatever the page's: a dark band in a light page, or the other way round.",
        Comp: A.Section, nome: "Section", prop: "theme", valores: ["light", "dark"], base: {spacing: "sm"},
        estilo: {display: "grid", width: "100%"},
        filho: (v) => ({codigo: `<Container>theme ${v}</Container>`, elemento: h(A.Container, null, `theme ${v}`)})}),
      eixo({titulo: "Footer widths", descricao: "On the footer, how far the content grows, on the Container's scale. inline is the one-line footer.",
        Comp: A.Section, nome: "Section", prop: "maxWidth", valores: ["sm", "md", "lg", "xl", "2xl", "docs", "full"],
        base: {variant: "footer", layout: "inline", legal: "© 2026 Acme"}, estilo: {display: "grid", width: "100%"}}),
      eixo({titulo: "An opening further down", descricao: "On the hero, the title is the page's h1 by default; titleAs=\"h2\" when the band opens a section further down the page.",
        Comp: A.Section, nome: "Section", prop: "titleAs", valores: ["h2"],
        base: {variant: "hero", spacing: "sm", title: "Reports, ready by nine", description: "Every team gets its numbers before the first meeting."},
        estilo: {display: "grid", width: "100%"}}),
    ],
  },
  Icon: {
    description: "One <svg><use> pointing at the shared icon sprite. The sprite URL comes "
      + "from the AureaProvider, never from the call site.",
    code: `<Icon name="magnifying-glass" />
<Icon name="plus" size="lg" />
<Icon name="check" size="xl" />`,
    render: () => h("div", {style: row}, h(A.Icon, {name: "magnifying-glass"}),
      h(A.Icon, {name: "plus", size: "lg"}), h(A.Icon, {name: "check", size: "xl"})),
    examples: [
      eixo({titulo: "Weights", descricao: "regular is the line icon; bold is heavier for small sizes; fill is the solid shape the chosen item uses.",
        Comp: A.Icon, nome: "Icon", prop: "weight", valores: ["regular", "bold", "fill"], base: {name: "star"}}),
      eixo({titulo: "Sizes", descricao: "From the icon scale; the icon follows the text size when no size is given.",
        Comp: A.Icon, nome: "Icon", prop: "size", valores: ["sm", "md", "lg", "xl"], base: {name: "star"}}),
    ],
  },
  KPI: {
    code: `<KPI label="Revenue" value="$48.2k" trend="+12% vs last month" />`,
    render: () => h("div", {style: wide}, h(A.KPI, {label: "Revenue", value: "$48.2k",
      trend: "+12% vs last month"})),
    examples: [
      eixo({titulo: "Tones", descricao: "What the change means, apart from its direction: a cost going up is bad news, so the tone is set by you, not guessed.",
        Comp: A.KPI, nome: "KPI", prop: "tone", valores: ["neutral", "success", "danger"],
        base: {label: "Revenue", value: "$48.2k", trend: "+12% vs last month", direction: "up"},
        estilo: {display: "grid", gap: "var(--space-3)", ...wide}}),
    ],
  },
  Kbd: {
    code: `Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search.`,
    render: () => h("span", {style: row}, "Press", h(A.Kbd, null, "⌘"), h(A.Kbd, null, "K"), "to search."),
  },
  LogStream: {
    code: `<LogStream lines={[
  {time: "09:14:02", text: "build started"},
  {time: "09:14:07", level: "warn", text: "2 baselines missing for linux"},
  {time: "09:14:09", level: "error", text: "exit 1"},
]} />`,
    render: () => h("div", {style: wide}, h(A.LogStream, {lines: [
      {time: "09:14:02", text: "build started"},
      {time: "09:14:07", level: "warn", text: "2 baselines missing for linux"},
      {time: "09:14:09", level: "error", text: "exit 1"},
    ]})),
  },
  MediaPlayer: {
    description: "Headless over the native <video>/<audio>: the engine is the browser, the "
      + "skin and the state are Aurea. Every control is a real button or range input.",
    code: `<MediaPlayer
  kind="audio"
  src="/media/episode-14.mp3"
  title="Episode 14"
  subtitle="Measuring instead of counting"
/>`,
    // `--media-h`/`--media-ar` é a válvula que o Victor autorizou em 11/08/2026 (item I7), e aqui
    // ela conserta um defeito que existia desde a Fase 5: com o default (`min-height:360px` +
    // `aspect-ratio:16/9`) o player media **482px** num vão de 354 e a prévia ROLAVA, contra a
    // ADR-0002. `16rem` porque é onde o transporte e o título respiram sem sobrar tela vazia.
    render: () => h("div", {style: {width: "100%", "--media-h": "16rem", "--media-ar": "auto"}},
      h(A.MediaPlayer, {kind: "audio", title: "Episode 14", subtitle: "Measuring instead of counting"})),
  },
  // MediaEmbed (achado N-10). A prévia mostra a FACHADA, e é o estado que importa: é o que a
  // pessoa vê antes de pedir o vídeo, e nada do site de fora carrega nela. O catálogo é HTML
  // estático sem rede, então um <iframe> do YouTube aqui seria uma caixa vazia — a fachada não é.
  // `28rem` de largura: em 16/9 dá 252px de altura, e com o link embaixo cabe no vão de 354.
  MediaEmbed: {
    description: "A video page from another site — YouTube, Vimeo — inside the Aurea frame. With a "
      + "poster, nothing from that site loads until the play button is pressed.",
    code: `<MediaEmbed
  src="https://www.youtube.com/embed/VIDEO_ID"
  title="Official trailer"
  poster="/trailers/cover.jpg"
  href="https://www.youtube.com/watch?v=VIDEO_ID"
/>`,
    render: () => h("div", {style: {width: "min(28rem,100%)"}},
      h(A.MediaEmbed, {src: "https://www.youtube.com/embed/VIDEO_ID", title: "Official trailer",
        poster: CAPA, href: "https://www.youtube.com/watch?v=VIDEO_ID"})),
  },
  MediaPlayerShell: {
    description: "The frame of a player, without the player: the dark canvas, the clipping, the "
      + "stacking context that keeps overlay and controls above the picture, and the fixed "
      + "proportion that stops the page from jumping before the media has measured itself. It "
      + "brings no state and no buttons — you compose the chrome. Reach for it when the default "
      + "chrome would be WRONG, not when you dislike it: a live stream is the clean case, because "
      + "there is no duration to show and nothing to seek through, so MediaPlayer's seek bar would "
      + "be a control that lies. Everything else is MediaPlayer, which wires the engine up.",
    // Badge e não Status: a tela do player é escura nos DOIS temas (--media-canvas), e o core
    // tem override de Badge para dentro dela. O rótulo do Status não — medido com axe, o texto
    // "on air" reprovava contraste. Componente que entra numa superfície própria precisa da
    // regra dessa superfície.
    code: `<MediaPlayerShell role="group" aria-label="Camera 3">
  <div className="media-viewport">
    <div className="media-placeholder"><Icon name="video-camera" /><strong>Standing by</strong></div>
  </div>
  <div className="media-overlay-title">
    <div><strong>Camera 3</strong><span>Loading dock</span></div>
    <Badge variant="danger">on air</Badge>
  </div>
  <div className="media-controls">
    <div className="media-control-row">
      <div className="media-control-group">
        <button className="media-control" type="button" aria-label="Play"><Icon name="play" /></button>
        {/* sem barra de busca: ao vivo não tem para onde voltar */}
        <span className="media-time">LIVE</span>
      </div>
      <div className="media-control-group">
        <button className="media-control" type="button" aria-label="Mute"><Icon name="speaker-high" /></button>
        <button className="media-control" type="button" aria-label="Full screen"><Icon name="arrows-out" /></button>
      </div>
    </div>
  </div>
</MediaPlayerShell>`,
    // Mesma válvula do `MediaPlayer` acima, pelo mesmo motivo medido: 482px num vão de 354.
    // O preview monta as PEÇAS que a casca existe para hospedar (.media-viewport,
    // .media-overlay-title, .media-controls) — antes ele punha um <div> solto com "Live" e a
    // caixa saía preta e vazia, sem mostrar nada do que o componente faz.
    render: () => h("div", {style: {width: "100%", "--media-h": "16rem", "--media-ar": "auto"}},
      h(A.MediaPlayerShell, {role: "group", "aria-label": "Camera 3"},
        h("div", {className: "media-viewport"},
          h("div", {className: "media-placeholder"},
            h(A.Icon, {name: "video-camera"}), h("strong", null, "Standing by"))),
        h("div", {className: "media-overlay-title"},
          h("div", null, h("strong", null, "Camera 3"), h("span", null, "Loading dock")),
          h(A.Badge, {variant: "danger"}, "on air")),
        h("div", {className: "media-controls"},
          h("div", {className: "media-control-row"},
            h("div", {className: "media-control-group"},
              h("button", {className: "media-control", type: "button", "aria-label": "Play"},
                h(A.Icon, {name: "play"})),
              h("span", {className: "media-time"}, "LIVE")),
            h("div", {className: "media-control-group"},
              h("button", {className: "media-control", type: "button", "aria-label": "Mute"},
                h(A.Icon, {name: "speaker-high"})),
              h("button", {className: "media-control", type: "button", "aria-label": "Full screen"},
                h(A.Icon, {name: "arrows-out"}))))))),
  },
  MessageComposer: {
    code: `<MessageComposer
  icon="chat"
  placeholder="Message the team…"
  onSend={text => send(text)}
/>`,
    render: () => h("div", {style: wide}, h(A.MessageComposer,
      {placeholder: "Message the team…", onSend: () => {}})),
  },
  MessageList: {
    code: `<MessageList messages={[
  {id: "1", author: "Analyst", time: "09:12", body: "The sweep is green.", avatar: {fallback: "AN"}},
  {id: "2", author: "You", time: "09:14", body: "Shipping it.", status: {label: "sent", variant: "success"}},
]} />`,
    render: () => h("div", {style: wide}, h(A.MessageList, {messages: [
      {id: "1", author: "Analyst", time: "09:12", body: "The sweep is green.", avatar: {fallback: "AN"}},
      {id: "2", author: "You", time: "09:14", body: "Shipping it.",
        status: {label: "sent", variant: "success"}},
    ]})),
  },
  NotificationCenter: {
    code: `<NotificationCenter
  onMarkAllRead={markAll}
  items={[
    {id: "1", title: "Build passed", time: "2m", group: "Today"},
    {id: "2", title: "New member", time: "1h", group: "Today", read: true},
  ]}
/>`,
    render: () => h(A.NotificationCenter, {items: [
      {id: "1", title: "Build passed", time: "2m", group: "Today"},
      {id: "2", title: "New member", time: "1h", group: "Today", read: true},
    ]}),
    examples: [
      cada({titulo: "Sides", descricao: "Which side of the trigger it opens on. When there is no room on that side, it flips to the opposite one.", valores: ["top", "right", "bottom", "left"],
        codigo: v => `<NotificationCenter label="Notifications, side ${v}" side="${v}" items={items} />`,
        peca: v => h(A.NotificationCenter, {label: `Notifications, side ${v}`, side: v,
          items: [{id: "1", title: "Build passed", time: "2m", group: "Today"}]})}),
    ],
  },
  Popover: {
    code: `<Popover
  title="Filters"
  arrow
  trigger={<Button variant="outline">Filters</Button>}
>
  <Checkbox label="Only mine" />
  <Checkbox label="Archived" />
</Popover>`,
    render: () => h(A.Popover, {title: "Filters", arrow: true, trigger: h(A.Button, {variant: "outline"}, "Filters")},
      h(A.Checkbox, {label: "Only mine"}), h(A.Checkbox, {label: "Archived"})),
    examples: [
      cada({titulo: "Sides", descricao: "Which side of the trigger it opens on. When there is no room on that side, it flips to the opposite one.", valores: ["top", "right", "bottom", "left"],
        codigo: v => `<Popover title="Side ${v}" side="${v}" arrow trigger={<Button variant="outline">Side ${v}</Button>}>…</Popover>`,
        peca: v => h(A.Popover, {title: `Side ${v}`, side: v, arrow: true, trigger: h(A.Button, {variant: "outline"}, `Side ${v}`)},
          h("p", null, `This popover opens on the ${v}.`))}),
    ],
  },
  // Parte H — a camada operacional (09/08/2026). Os três primeiros da família.
  AgentStatus: {
    install: 'import {AgentStatus} from "@aurea-uds/react";',
    code: `<AgentStatus state="idle" />
<AgentStatus state="running" />
<AgentStatus state="paused" />
<AgentStatus state="error" />
<AgentStatus state="completed" />`,
    render: () => h("div", {className: "cluster"},
      h(A.AgentStatus, {key: "i", state: "idle"}),
      h(A.AgentStatus, {key: "r", state: "running"}),
      h(A.AgentStatus, {key: "p", state: "paused"}),
      h(A.AgentStatus, {key: "e", state: "error"}),
      h(A.AgentStatus, {key: "c", state: "completed"})),

    examples: [
      eixo({titulo: "Every state", descricao: "thinking is the one between running and the answer: the agent is working, and has nothing to show yet.",
        Comp: A.AgentStatus, nome: "AgentStatus", prop: "state", valores: ["idle", "running", "thinking", "paused", "error", "completed"]}),
    ],
  },
  AgentCard: {
    install: 'import {AgentCard} from "@aurea-uds/react";',
    code: `<AgentCard
  name="Curator"
  model="opus-5"
  state="running"
  description="Keeps the reference library tidy."
  capabilities={[{name: "search", icon: "magnifying-glass"}, {name: "summarise"}]}
/>`,
    render: () => h(A.AgentCard, {name: "Curator", model: "opus-5", state: "running",
      description: "Keeps the reference library tidy.",
      capabilities: [{name: "search", icon: "magnifying-glass"}, {name: "summarise"}]}),

    examples: [
      eixo({titulo: "Every state", descricao: "The state is a word on the card, not only a colour: idle, running, thinking, paused, error, completed.",
        Comp: A.AgentCard, nome: "AgentCard", prop: "state", valores: ["idle", "running", "thinking", "paused", "error", "completed"], base: {name: "Curator", model: "opus-5"},
        estilo: {display: "grid", gap: "var(--space-3)", ...wide}}),
    ],
  },
  AgentInspector: {
    install: 'import {AgentInspector} from "@aurea-uds/react";',
    code: `<AgentInspector
  title="Curator"
  sections={[{label: "Configuration", items: [{term: "Model", value: "opus-5"}]}]}
/>`,
    render: () => h(A.AgentInspector, {title: "Curator", sections: [
      {label: "Configuration", items: [{term: "Model", value: "opus-5"}, {term: "Temperature", value: "0.2"}]},
      {label: "Tools", items: [{term: "search", value: "read-only"}]}]}),
  },
  InvocationPanel: {
    install: 'import {InvocationPanel} from "@aurea-uds/react";',
    code: `<InvocationPanel
  title="Summarise the changelog"
  input="Summarise the last 20 entries."
  steps={[{id: "1", label: "read", detail: "20 entries", state: "done"}]}
  output="Three themes: performance, a11y, packaging."
/>`,
    render: () => h(A.InvocationPanel, {title: "Summarise the changelog",
      input: "Summarise the last 20 entries.",
      steps: [{id: "1", label: "read", detail: "20 entries", state: "done"},
              {id: "2", label: "cluster", state: "running", content: h("p", null, "Grouping by theme.")}],
      output: "Three themes: performance, a11y, packaging.", running: true}),
  },
  TaskQueue: {
    install: 'import {TaskQueue} from "@aurea-uds/react";',
    code: `<TaskQueue tasks={[
  {id: "1", title: "Index the archive", state: "running", progress: 0.4},
  {id: "2", title: "Rebuild the sitemap", state: "queued", priority: "high"},
]} />`,
    render: () => h(A.TaskQueue, {tasks: [
      {id: "1", title: "Index the archive", state: "running", progress: 0.4, description: "12 of 30 folders"},
      {id: "2", title: "Rebuild the sitemap", state: "queued", priority: "high"},
      {id: "3", title: "Purge the cache", state: "failed"}]}),
  },
  HumanApproval: {
    install: 'import {HumanApproval} from "@aurea-uds/react";',
    code: `<HumanApproval
  title="Delete 12 archived records"
  risk="high"
  details={[{term: "Table", value: "invoices"}, {term: "Rows", value: "12"}]}
  onApprove={() => {}}
  onDeny={() => {}}
/>`,
    render: () => h(A.HumanApproval, {title: "Delete 12 archived records", risk: "high",
      description: "Removes rows that were archived more than a year ago.",
      details: [{term: "Table", value: "invoices"}, {term: "Rows", value: "12"}],
      reasoning: "They no longer appear in any report.", deadline: "in 2 hours"}),

    examples: [
      eixo({titulo: "Risk", descricao: "How much the action can break. The word goes on the card; the colour only repeats it.",
        Comp: A.HumanApproval, nome: "HumanApproval", prop: "risk", valores: ["low", "medium", "high"],
        base: (v) => ({title: `Send the weekly report (${v} risk)`}), estilo: {display: "grid", gap: "var(--space-3)", ...wide}}),
      eixo({titulo: "Decided", descricao: "Once decided, the pair of buttons becomes the result instead of disappearing, so the trace of the choice stays.",
        Comp: A.HumanApproval, nome: "HumanApproval", prop: "decision", valores: ["approved", "denied"],
        base: (v) => ({title: `Send the weekly report (${v})`, risk: "low"}), estilo: {display: "grid", gap: "var(--space-3)", ...wide}}),
    ],
  },
  ToolPermission: {
    install: 'import {ToolPermission} from "@aurea-uds/react";',
    code: `<ToolPermission tools={[
  {id: "1", name: "read", scope: "/docs", permission: "always"},
  {id: "2", name: "write", scope: "/docs", permission: "ask"},
]} />`,
    render: () => h(A.ToolPermission, {tools: [
      {id: "1", name: "read", scope: "/docs", permission: "always"},
      {id: "2", name: "write", scope: "/docs", permission: "ask", description: "creates and edits files"},
      {id: "3", name: "shell", permission: "never"}]}),
  },
  EventStream: {
    install: 'import {EventStream} from "@aurea-uds/react";',
    code: `<EventStream events={[
  {id: "1", title: "Run started", time: "10:02", group: "Today"},
  {id: "2", title: "Tool denied", time: "10:04", severity: "danger"},
]} />`,
    render: () => h(A.EventStream, {events: [
      {id: "1", title: "Run started", time: "10:02", group: "Today", severity: "info"},
      {id: "2", title: "Index rebuilt", time: "10:03", severity: "success", detail: "1 204 documents"},
      {id: "3", title: "Tool denied", time: "10:04", severity: "danger", detail: "shell, out of scope"}]}),
  },
  TraceTimeline: {
    install: 'import {TraceTimeline} from "@aurea-uds/react";',
    code: `<TraceTimeline spans={[
  {id: "1", label: "invoke", start: 0, end: 900},
  {id: "2", label: "retrieve", start: 40, end: 380, depth: 1, kind: "tool"},
]} />`,
    render: () => h(A.TraceTimeline, {spans: [
      {id: "1", label: "invoke", start: 0, end: 900},
      {id: "2", label: "retrieve", start: 40, end: 380, depth: 1, kind: "tool"},
      {id: "3", label: "generate", start: 400, end: 880, depth: 1, kind: "model"},
      {id: "4", label: "guardrail", start: 880, end: 900, depth: 2, error: true}]}),
  },
  HealthMatrix: {
    install: 'import {HealthMatrix} from "@aurea-uds/react";',
    code: `<HealthMatrix entries={[
  {id: "1", name: "API", state: "operational"},
  {id: "2", name: "Workers", state: "degraded"},
]} />`,
    // `width:100%` como os outros starters de peça larga, e aqui ele conserta a prévia INTEIRA.
    // Medido em 11/08/2026: sem ele a matriz saía com **192px** num painel de 856 — a caixa
    // centraliza, o grid encolhe ao mínimo do `minmax(12rem,1fr)` e as quatro células empilham em
    // UMA coluna, 362px de altura num vão de 354. A prévia mentia sobre o componente (matriz é
    // matriz porque tem colunas) e ainda rolava. Varrido o catálogo: das três classes que o core
    // declara com `auto-fill` — `.grid`, `.icon-grid`, `.health-matrix` — esta era a única
    // colapsada, então o conserto é aqui e não numa regra.
    render: () => h("div", {style: {width: "100%"}}, h(A.HealthMatrix, {entries: [
      {id: "1", name: "API", state: "operational", detail: "p95 82 ms"},
      {id: "2", name: "Workers", state: "degraded", detail: "2 of 6 lagging"},
      {id: "3", name: "Search", state: "down"},
      {id: "4", name: "Billing", state: "maintenance"}]})),
  },
  InterAgentMessage: {
    install: 'import {InterAgentMessage} from "@aurea-uds/react";',
    code: `<InterAgentMessage messages={[
  {id: "1", from: "Curator", to: "Writer", kind: "handoff",
   body: "Draft ready for review.", time: "10:02"},
  {id: "2", from: "Orchestrator", kind: "broadcast",
   body: "Rate limit reached, pausing.", time: "10:04"},
]} />`,
    render: () => h(A.InterAgentMessage, {messages: [
      {id: "1", from: "Curator", to: "Writer", kind: "handoff", time: "10:02",
       body: "Draft ready for review.",
       reason: "Highest intent match for “long-form”.",
       details: [{term: "Confidence", value: "0.91"}]},
      // Sem o `request` (Writer → Analyst): com a escala de letra da 0.8.8 as quatro mensagens
      // passavam 6px da caixa. Ficam três tipos — passar a vez, aviso geral e erro —, e o
      // `request` desenha igual ao `handoff`, só muda a etiqueta.
      {id: "3", from: "Orchestrator", kind: "broadcast", time: "10:04",
       body: "Rate limit reached, pausing every worker."},
      {id: "4", from: "Analyst", to: "Writer", kind: "error", time: "10:06",
       body: "Query timed out after 30s."}]}),
  },
  AutomationCard: {
    install: 'import {AutomationCard} from "@aurea-uds/react";',
    code: `<AutomationCard
  name="Nightly reindex"
  trigger="Every day at 02:00 UTC"
  action="Run the indexer on changed documents"
  enabled
  onToggle={setEnabled}
  lastRun="yesterday, 02:00"
  lastResult="success"
/>
<AutomationCard
  name="Purge stale drafts"
  trigger="On draft older than 30 days"
  action="Move it to the archive"
  onToggle={setEnabled}
  lastRun="6 days ago"
  lastResult="failure"
/>`,
    render: () => h("div", {style: stack},
      h(ComValor, {componente: A.AutomationCard, valor: "enabled", aviso: "onToggle", name: "Nightly reindex", enabled: true,
        // sem `description`: com a escala de letra da 0.8.8 a linha dela empurrava o segundo
        // cartão 18px para fora da caixa, e o código ao lado nunca a mostrou.
        trigger: "Every day at 02:00 UTC", action: "Run the indexer on changed documents",
        lastRun: "yesterday, 02:00", lastResult: "success"}),
      h(ComValor, {componente: A.AutomationCard, valor: "enabled", aviso: "onToggle", name: "Purge stale drafts",
        trigger: "On draft older than 30 days", action: "Move it to the archive",
        lastRun: "6 days ago", lastResult: "failure"})),
  },
  ModelUsage: {
    install: 'import {ModelUsage} from "@aurea-uds/react";',
    code: `<ModelUsage metric="tokens" entries={[
  {id: "1", model: "opus", provider: "anthropic", tokens: 1_840_000},
  {id: "2", model: "haiku", provider: "anthropic", tokens: 620_000},
]} />`,
    render: () => h(A.ModelUsage, {entries: [
      {id: "1", model: "opus", provider: "anthropic", tokens: 1840000},
      {id: "2", model: "haiku", provider: "anthropic", tokens: 620000},
      {id: "3", model: "embed-3", provider: "local", tokens: 95000}]}),

    examples: [
      eixo({titulo: "Metrics", descricao: "Which measure the bars compare: tokens, cost or requests. The rows sort by the one in view.",
        Comp: A.ModelUsage, nome: "ModelUsage", prop: "metric", valores: ["tokens", "cost", "requests"],
        baseCodigo: (v) => `label="Model usage, ${v}" entries={entries}`, base: (v) => ({label: `Model usage, ${v}`, entries: [
          {id: "1", model: "opus", provider: "anthropic", tokens: 1840000, cost: 27.6, requests: 410},
          {id: "2", model: "haiku", provider: "anthropic", tokens: 620000, cost: 0.78, requests: 1290},
          {id: "3", model: "embed-3", provider: "local", tokens: 95000, cost: 0, requests: 3020}]}),
        estilo: {display: "grid", gap: "var(--space-4)", ...wide}}),
    ],
  },
  CostMeter: {
    install: 'import {CostMeter} from "@aurea-uds/react";',
    code: `<CostMeter spent={84.2} limit={100} softLimit={80} period="This month" />`,
    render: () => h(A.CostMeter, {spent: 84.2, limit: 100, softLimit: 80, period: "This month",
      segments: [{id: "i", label: "Input", amount: 31.4},
                 {id: "o", label: "Output", amount: 49.7},
                 {id: "c", label: "Cache read", amount: 3.1}]}),
  },
  MemoryLedger: {
    install: 'import {MemoryLedger} from "@aurea-uds/react";',
    code: `<MemoryLedger records={[
  {id: "1", content: "Prefers metric units", scope: "semantic",
   operation: "added", time: "10:02", source: "conversation"},
  {id: "2", content: "Old shipping address", scope: "episodic",
   operation: "forgotten", time: "10:41"},
]} />`,
    render: () => h(A.MemoryLedger, {records: [
      {id: "1", content: "Prefers metric units", scope: "semantic", operation: "added", time: "10:02",
       source: "Stated in conversation, turn 12.",
       details: [{term: "Confidence", value: "high"}, {term: "Session", value: "s-4471"}]},
      {id: "2", content: "Deploys on Fridays are blocked", scope: "procedural", operation: "recalled", time: "10:18",
       source: "Team runbook, section 4."},
      {id: "3", content: "Old shipping address", scope: "episodic", operation: "forgotten", time: "10:41"}]}),
  },
  Skeleton: {
    code: `<Skeleton style={{height: "0.875rem", width: "70%"}} />
<Skeleton style={{height: "0.875rem", width: "90%"}} />`,
    render: () => h("div", {style: {...stack, ...wide}},
      h(A.Skeleton, {style: {height: "0.875rem", width: "70%"}}),
      h(A.Skeleton, {style: {height: "0.875rem", width: "90%"}})),
    examples: [
      eixo({titulo: "Animation", descricao: "pulse breathes while loading; none stays still — and with reduced motion, pulse stays still too.",
        Comp: A.Skeleton, nome: "Skeleton", prop: "animation", valores: ["pulse", "none"],
        baseCodigo: 'style={{height: "0.875rem", width: "70%"}}', base: {style: {height: "0.875rem", width: "70%"}},
        estilo: {display: "grid", gap: "var(--space-3)", ...wide}}),
    ],
  },
  Stack: {
    code: `<Stack>
  <Card>First</Card>
  <Card>Second</Card>
</Stack>`,
    render: () => h("div", {style: wide}, h(A.Stack, null,
      h(A.Card, null, "First"), h(A.Card, null, "Second"))),
    examples: [
      eixo({titulo: "Gap", descricao: "The space between the items, from the density scale: tight, normal or loose.",
        Comp: A.Stack, nome: "Stack", prop: "gap", valores: ["tight", "normal", "loose"], estilo: {display: "grid", gap: "var(--space-6)", ...wide},
        filho: () => DOIS_CARTOES}),
      eixo({titulo: "Align", descricao: "Where each item sits across the column. stretch, the default, makes every item as wide as the stack.",
        Comp: A.Stack, nome: "Stack", prop: "align", valores: ["start", "center", "end", "stretch"], estilo: {display: "grid", gap: "var(--space-6)", ...wide},
        filho: () => ({codigo: `
  <Button>Save</Button>
  <Button variant="secondary">Cancel</Button>
`, elemento: [h(A.Button, {key: 1}, "Save"), h(A.Button, {key: 2, variant: "secondary"}, "Cancel")]})}),
    ],
  },
  Table: {
    code: `<Table caption="Team">
  <thead><tr><th>Name</th><th>Role</th></tr></thead>
  <tbody>
    <tr><td>Messenger</td><td>Owner</td></tr>
    <tr><td>Analyst</td><td>Editor</td></tr>
  </tbody>
</Table>`,
    // A largura do painel (21/10/2026): na caixa de 30rem a tabela de 720 rolava de lado, cortada na coluna "Role", com
    // 814 de painel sobrando — o Victor apontou.
    render: () => h("div", {style: {width: "100%"}}, h(A.Table, {caption: "Team"},
      h("thead", null, h("tr", null, h("th", null, "Name"), h("th", null, "Role"))),
      h("tbody", null,
        h("tr", null, h("td", null, "Messenger"), h("td", null, "Owner")),
        h("tr", null, h("td", null, "Analyst"), h("td", null, "Editor"))))),
  },
  TableOfContents: {
    description: "The “On this page” column of every page in this catalog. Presentational: "
      + "whoever knows the sections passes them in.",
    code: `<TableOfContents label="On this page" current="preview" items={[
  {id: "preview", label: "Preview"},
  {id: "installation", label: "Installation"},
  {id: "reference", label: "Reference"},
]} />`,
    // rótulo próprio: o padrão é "On this page", e a página já tem um índice com esse nome —
    // dois <nav> com o mesmo nome acessível é violação (axe landmark-unique), medido.
    // Numa caixa simples (21/10/2026): o índice se prende ao TOPO (`.toc`: `align-self:start`, `sticky`), que é o certo
    // ao lado do texto e saía grudado no alto da prévia. A caixa é que o painel centraliza.
    render: () => h("div", null, h(A.TableOfContents, {label: "Example sections", current: "preview", items: [
      {id: "preview", label: "Preview"}, {id: "installation", label: "Installation"},
      {id: "reference", label: "Reference"},
    ]})),
  },
  AvatarGroup: {
    code: `<AvatarGroup max={3} total={9} label="Reviewers">
  <Avatar fallback="AM" />
  <Avatar fallback="CT" />
  <Avatar fallback="RS" />
  <Avatar fallback="JP" />
</AvatarGroup>`,
    render: () => h(A.AvatarGroup, {max: 3, total: 9, label: "Reviewers"},
      h(A.Avatar, {key: 1, fallback: "AM"}), h(A.Avatar, {key: 2, fallback: "CT"}),
      h(A.Avatar, {key: 3, fallback: "RS"}), h(A.Avatar, {key: 4, fallback: "JP"})),
    examples: [
      eixo({titulo: "Sizes", descricao: "The size reaches every avatar in the group and the counter at the end.",
        Comp: A.AvatarGroup, nome: "AvatarGroup", prop: "size", valores: ["sm", "md", "lg"], base: {max: 3, total: 9, label: "Reviewers"}, coluna: true,
        filho: () => ({codigo: `
  <Avatar fallback="AM" />
  <Avatar fallback="CT" />
  <Avatar fallback="RS" />
`, elemento: ["AM", "CT", "RS"].map(f => h(A.Avatar, {key: f, fallback: f}))})}),
    ],
  },
  Stepper: {
    code: `<Stepper label="Publishing" items={[
  {label: "Configure", state: "done"},
  {label: "Permissions", state: "done"},
  {label: "Validation", state: "error"},
  {label: "Publish", optional: "Optional"},
]} />`,
    render: () => h("div", {style: wide}, h(A.Stepper, {label: "Publishing", items: [
      {label: "Configure", state: "done"},
      {label: "Permissions", state: "done"},
      {label: "Validation", state: "error"},
      {label: "Publish", optional: "Optional"},
    ]})),
  },
  Menubar: {
    code: `<Menubar label="Main" menus={[
  {label: "File", items: [{label: "New"}, {label: "Open"}, "separator", {label: "Quit"}]},
  {label: "Edit", items: [{label: "Undo"}, {label: "Redo"}]},
  {label: "View", items: [{label: "Zoom in"}, {label: "Zoom out"}]},
]} />`,
    render: () => h(A.Menubar, {
      label: "Main",
      menus: [
        {label: "File", items: [{label: "New"}, {label: "Open"}, "separator", {label: "Quit"}]},
        {label: "Edit", items: [{label: "Undo"}, {label: "Redo"}]},
        {label: "View", items: [{label: "Zoom in"}, {label: "Zoom out"}]},
      ],
    }),
  },

  AspectRatio: {
    code: `<AspectRatio ratio={16 / 9}>
  <img src="/cover.jpg" alt="" />
</AspectRatio>`,
    render: () => h("div", {style: {width: "min(360px, 100%)"}},
      h(A.AspectRatio, {ratio: 16 / 9, style: {background: "var(--surface-2)", borderRadius: "var(--radius-card)"}},
        h("div", {style: {display: "grid", placeItems: "center", color: "var(--muted-foreground)"}}, "16 : 9"))),
  },

  ContainerScope: {
    code: `<ContainerScope>
  <Toolbar orientation={{base: "vertical", container: {sm: "horizontal"}}}>
    <Button>Save</Button>
    <Button>Discard</Button>
  </Toolbar>
</ContainerScope>`,
    // Dois contêineres lado a lado, MESMA viewport: é o que a primitive existe para permitir, e
    // ver os dois juntos é o que explica a diferença para uma media query.
    render: () => h("div", {style: {display: "flex", flexWrap: "wrap", gap: "var(--space-4)", alignItems: "flex-start", justifyContent: "center"}},
      ...[220, 480].map((w) => h(A.ContainerScope, {key: w, style: {inlineSize: w, padding: "var(--space-3)",
        background: "var(--surface-2)", borderRadius: "var(--radius-lg)"}},
        h(A.Toolbar, {label: `Actions, ${w}`, orientation: {base: "vertical", container: {sm: "horizontal"}}},
          h(A.Button, null, "Save"), h(A.Button, null, "Discard"))))),
  },

  useValorResponsivo: {
    code: `const orientation = useValorResponsivo(
  {base: "vertical", container: {sm: "horizontal"}},
  "horizontal",
  anchorRef,
);`,
    // O hook resolve; quem mostra o resultado é o componente que o consome. O preview mostra o
    // efeito, que é o que se pode ver — o valor em si é um string.
    render: () => h("div", {style: {display: "flex", flexWrap: "wrap", gap: "var(--space-4)", alignItems: "flex-start", justifyContent: "center"}},
      ...[220, 480].map((w) => h(A.ContainerScope, {key: w, style: {inlineSize: w, padding: "var(--space-3)",
        background: "var(--surface-2)", borderRadius: "var(--radius-lg)"}},
        h(A.ToggleGroup, {label: `Align, ${w}`, orientation: {base: "vertical", container: {sm: "horizontal"}}},
          h(A.Toggle, {value: "e"}, "Left"), h(A.Toggle, {value: "c"}, "Center"))))),
  },

  // ── Os três hooks que o merge de 28/08/2026 trouxe da outra linhagem ────────────────────────
  useAureaTheme: {
    code: `const {theme, density, setTheme, setDensity, toggleTheme} = useAureaTheme();

// Lê direto do <html> e acompanha quem mudar o atributo por fora.
// Use este quando a APLICAÇÃO é dona do data-theme; use useTheme quando
// quem guarda a escolha é o AureaProvider.
<IconButton
  icon={theme === "light" ? "moon" : "sun"}
  label={theme === "light" ? "Switch to dark" : "Switch to light"}
  onClick={toggleTheme}
/>`,
    render: () => h(A.IconButton, {icon: "sun", label: "Switch to dark"}),
  },
  usePortalContainer: {
    code: `// Configurado UMA vez, no provider — não é prop de componente.
<AureaProvider portalContainer={ref.current}>…</AureaProvider>

// E lido por quem monta um popup próprio, para cair no mesmo lugar:
const container = usePortalContainer();`,
    render: () => h("p", {className: "muted"}, "Sem valor, todo popup monta no document.body."),
  },
  useReorder: {
    code: `const {itens, aoSoltar, propsDoItem} = useReorder(lista, setLista);

// Reordenar sem ponteiro: pegar (Space), mover (setas), soltar (Space),
// cancelar (Escape) — e cada passo é anunciado por live region.
<ul>{itens.map((it, i) => <li key={it.id} {...propsDoItem(i)}>{it.label}</li>)}</ul>`,
    render: () => h("p", {className: "muted"}, "O protocolo de reordenação que o SortableList e o BlockEditor compartilham."),
  },
  useTheme: {
    code: `const {theme, toggleTheme} = useTheme();

<IconButton
  icon={theme === "light" ? "moon" : "sun"}
  label={theme === "light" ? "Switch to dark" : "Switch to light"}
  onClick={toggleTheme}
/>`,
    // O rótulo diz a AÇÃO, não o estado: um botão rotulado "Dark" não diz se liga ou desliga,
    // e um leitor de tela anuncia exatamente o rótulo. É a mesma regra do `passwordShow`.
    note: "Reads and writes data-theme on the document root, so the whole page follows — this button switches the theme of this page.",
    render: () => h(UsaTema),
  },

  useDensity: {
    code: `const {density, setDensity} = useDensity();

<SegmentedControl
  value={density ?? "comfortable"}
  onChange={(v) => setDensity(v as AureaDensity)}
  items={[
    {value: "compact", label: "Compact"},
    {value: "comfortable", label: "Comfortable"},
    {value: "spacious", label: "Spacious"},
  ]}
/>`,
    note: "Density is the third axis of the system, next to theme and direction: it changes control height, row height and padding across every component at once.",
    render: () => h(UsaDensidade),
  },

  useToast: {
    code: `const toast = useToast();

<Button onClick={() => toast.add({title: "Saved", type: "success"})}>
  Save
</Button>

// with a line under the title and an action
toast.add({title: "Conversation deleted", actionProps: {children: "Undo", onClick: restore}});

// a promise: spins while it runs, then success or error
toast.promise(send(), {loading: "Sending…", success: "Sent", error: "Could not send"});

// where the stack lives (the default is the bottom middle)
<AureaProvider toastPlacement="top-end">…</AureaProvider>`,
    note: "The toast list is mounted by AureaProvider. The button shows a toast at the bottom of this page.",
    render: () => h(UsaAviso),
  },

  useAureaStrings: {
    code: `const s = useAureaStrings();

<p>{s.loading}</p>   // "Loading" — or your own dictionary`,
    note: "Reads the dictionary the provider is using. Nothing renders on its own: the preview prints one entry.",
    render: () => h(MostraFrase),
  },

  useSpriteUrl: {
    code: `const url = useSpriteUrl();

<svg><use href={\`\${url}#i-caret-down\`} /></svg>`,
    note: "Reads where the provider is loading glyphs from. Nothing renders on its own: the preview draws one glyph "
      + "with it. On this site the sprite is inside the page, so the address is empty.",
    render: () => h(MostraGlifo),
  },

  InputGroup: {
    code: `<InputGroup>
  <InputGroupAddon>https://</InputGroupAddon>
  <Input placeholder="acme.dev" />
</InputGroup>`,
    render: () => h("div", {style: {display: "grid", gap: "var(--space-3)", width: "min(360px, 100%)"}},
      h(A.InputGroup, null,
        h(A.InputGroupAddon, null, "https://"),
        h(A.Input, {placeholder: "acme.dev", "aria-label": "Domain"})),
      h(A.InputGroup, null,
        h(A.Input, {placeholder: "you", "aria-label": "Handle"}),
        h(A.InputGroupAddon, {side: "end", layout: "inline"}, "@acme.dev"))),
  },

  InputGroupAddon: {
    code: `<InputGroupAddon side="start" layout="inline"><Icon name="magnifying-glass" /></InputGroupAddon>
<InputGroupAddon side="end" layout="inline">.00</InputGroupAddon>`,
    render: () => h("div", {style: {width: "min(360px, 100%)"}},
      h(A.InputGroup, null,
        h(A.InputGroupAddon, null, h(A.Icon, {name: "magnifying-glass"})),
        h(A.Input, {placeholder: "Search", "aria-label": "Search"}),
        h(A.InputGroupAddon, {side: "end", layout: "inline"}, "\u2318K"))),
    examples: [
      {
        title: "On its own line",
        description: 'layout="block" puts the addon on its own line above the control instead of beside it.',
        code: `<InputGroup>
  <InputGroupAddon side="start" layout="block">Search the reports</InputGroupAddon>
  <Input placeholder="Search" aria-label="Search the reports" />
</InputGroup>`,
        render: () => h("div", {style: {width: "min(360px, 100%)"}}, h(A.InputGroup, null,
          h(A.InputGroupAddon, {side: "start", layout: "block"}, "Search the reports"),
          h(A.Input, {placeholder: "Search", "aria-label": "Search the reports"}))),
      },
    ],
  },

  Label: {
    code: `<Label htmlFor="workspace">Workspace</Label>
<Input id="workspace" defaultValue="acme" />`,
    render: () => h("div", {style: {display: "grid", gap: "var(--space-2)", width: "min(320px, 100%)"}},
      h(A.Label, {htmlFor: "starter-label-workspace"}, "Workspace"),
      h(A.Input, {id: "starter-label-workspace", defaultValue: "acme"})),
  },

  PasswordField: {
    code: `<Field label="Password">
  <PasswordField autoComplete="new-password" />
</Field>`,
    render: () => h("div", {style: {width: "min(320px, 100%)"}},
      h(A.Field, {label: "Password"}, h(A.PasswordField, {defaultValue: "correct-horse"}))),
    examples: [
      eixo({titulo: "Sizes", descricao: "The control sizes; the show/hide button keeps a 44 target on touch at every size.",
        Comp: A.PasswordField, nome: "PasswordField", prop: "size", valores: ["sm", "md", "lg"], base: {"aria-label": "Password"},
        estilo: {display: "grid", gap: "var(--space-3)", width: "min(320px, 100%)"}}),
    ],
  },

  Collapsible: {
    code: `<Collapsible trigger="Advanced options" defaultOpen>
  <p>Everything here is optional.</p>
</Collapsible>`,
    render: () => h("div", {style: {maxWidth: "min(420px, 100%)"}},
      h(A.Collapsible, {trigger: "Advanced options", defaultOpen: true},
        h("p", {className: "muted"}, "Everything here is optional."))),
  },


  ToggleGroup: {
    code: `<ToggleGroup label="Text style" multiple defaultValue={["bold"]}>
  <Toggle value="bold">Bold</Toggle>
  <Toggle value="italic">Italic</Toggle>
  <Toggle value="underline">Underline</Toggle>
</ToggleGroup>`,
    render: () => h("div", {style: row},
      h(A.ToggleGroup, {label: "Text style", multiple: true, defaultValue: ["bold"]},
        h(A.Toggle, {value: "bold"}, "Bold"),
        h(A.Toggle, {value: "italic"}, "Italic"),
        h(A.Toggle, {value: "underline"}, "Underline"))),
    examples: [
      eixo({titulo: "Orientation", descricao: "vertical stacks the toggles; the arrow keys follow the direction.",
        Comp: A.ToggleGroup, nome: "ToggleGroup", prop: "orientation", valores: ["horizontal", "vertical"],
        base: {label: "Text style", multiple: true, defaultValue: ["bold"]}, filho: () => TRES_ESTILOS}),
      eixo({titulo: "Sizes", descricao: "The size reaches every toggle in the group.", Comp: A.ToggleGroup, nome: "ToggleGroup",
        prop: "size", valores: ["sm", "md", "lg"], base: {label: "Text style", multiple: true, defaultValue: ["bold"]}, coluna: true,
        filho: () => TRES_ESTILOS}),
    ],
  },

  Spinner: {
    code: `<Spinner size="sm" />
<Spinner label="Loading results" />
<Spinner size="lg" />`,
    render: () => h("div", {style: row},
      h(A.Spinner, {size: "sm"}),
      h(A.Spinner, {label: "Loading results"}),
      h(A.Spinner, {size: "lg"})),
    examples: [
      eixo({titulo: "Sizes", descricao: "Four sizes; the label is what the screen reader says.", Comp: A.Spinner, nome: "Spinner",
        prop: "size", valores: ["sm", "md", "lg", "xl"], base: {label: "Loading"}}),
    ],
  },
  // O segundo campo é o item L6 do lado do número: moeda sem biblioteca de moeda. O motor formata
  // pelo `Intl` da plataforma e no BLUR, e guarda o número cru num input escondido — então o que o
  // formulário envia é 1234.5, nunca o texto formatado.
  NumberField: {
    description: "Minus, field and plus in one piece. With `format` it also does money, percent "
      + "and units — the platform's Intl formats it, so no currency library is needed for this.",
    code: `<NumberField defaultValue={1} min={0} max={99} label="Quantity" />

<NumberField
  label="Price"
  name="price"
  defaultValue={1234.5}
  format={{style: "currency", currency: "BRL"}}
  locale="pt-BR"
/>`,
    render: () => h("div", {style: stack},
      h(A.NumberField, {defaultValue: 1, min: 0, max: 99, label: "Quantity"}),
      h(A.NumberField, {label: "Price", name: "price", defaultValue: 1234.5,
        format: {style: "currency", currency: "BRL"}, locale: "pt-BR"})),
    examples: [
      eixo({titulo: "Drag to change", descricao: "scrubbable adds a handle you pull to change the value; scrubDirection says which way. The buttons and the keys keep working.",
        Comp: A.NumberField, nome: "NumberField", prop: "scrubDirection", valores: ["horizontal", "vertical"],
        base: {scrubbable: true, defaultValue: 50, min: 0, max: 100, label: "Opacity"}, coluna: true}),
    ],
  },
  // 0.33.0: o segundo com `groupSize`, o tracinho do 3 + 3 da referência.
  OTPField: {
    code: `<OTPField length={6} label="Verification code" />
<OTPField length={6} groupSize={3} label="Verification code, in two groups" />`,
    render: () => h("div", {style: stack}, h(A.OTPField, {length: 6, label: "Verification code"}),
      h(A.OTPField, {length: 6, groupSize: 3, label: "Verification code, in two groups"})),
    examples: [
      {
        title: "Variants",
        description: "primary is the field on the page; secondary is the one inside a card or a dialog, a step darker.",
        code: `<OTPField length={6} variant="primary" label="Code, primary" />
<OTPField length={6} variant="secondary" label="Code, secondary" />`,
        render: () => h("div", {style: stack}, h(A.OTPField, {length: 6, variant: "primary", label: "Code, primary"}),
          h(A.OTPField, {length: 6, variant: "secondary", label: "Code, secondary"})),
      },
    ],
  },
  // O disparador é um `Button variant="link"`, não um `<a>` cru: um link sem pele da Aurea
  // reprovou contraste AA no tema claro dentro do painel de demo — pego pelo axe da varredura.
  // É o mesmo achado da Fase 7 visto de novo: link solto não é componente do sistema.
  HoverCard: {
    code: `<HoverCard trigger={<Button variant="link" href="#curator">Curator</Button>}>
  <strong>Curator</strong>
  <p className="muted">Reviews and files what comes in.</p>
</HoverCard>`,
    render: () => h(A.HoverCard, {trigger: h(A.Button, {variant: "link", href: "#curator"}, "Curator")},
      h("strong", null, "Curator"), h("p", {className: "muted"}, "Reviews and files what comes in.")),
    examples: [
      cada({titulo: "Sides", descricao: "Which side of the trigger it opens on. When there is no room on that side, it flips to the opposite one.", valores: ["top", "right", "bottom", "left"],
        codigo: v => `<HoverCard side="${v}" trigger={<Button variant="link" href="#side-${v}">Side ${v}</Button>}>…</HoverCard>`,
        peca: v => h(A.HoverCard, {side: v, trigger: h(A.Button, {variant: "link", href: `#side-${v}`}, `Side ${v}`)},
          h("p", null, `This card opens on the ${v}.`))}),
    ],
  },
  Timeline: {
    code: `<Timeline items={[
  {title: "Created", description: "by Curator", time: "09:00"},
  {title: "Shipped", time: "14:20"},
]} />`,
    render: () => h("div", {style: ate}, h(A.Timeline, {items: [
      {title: "Created", description: "by Curator", time: "09:00"},
      {title: "Shipped", time: "14:20"},
    ]})),
  },
  Tooltip: {
    code: `<Tooltip content="Copy to clipboard" side="top">
  <IconButton icon="copy" label="Copy" />
</Tooltip>

// with the arrow; on plain text the trigger becomes focusable by itself
<Tooltip content="Monthly recurring revenue" arrow>
  <span>MRR</span>
</Tooltip>`,
    render: () => h("div", {style: row},
      h(A.Tooltip, {content: "Copy to clipboard", side: "top"}, h(A.IconButton, {icon: "copy", label: "Copy"})),
      h(A.Tooltip, {content: "Monthly recurring revenue", arrow: true}, h("span", null, "MRR"))),
    examples: [
      cada({titulo: "Sides", descricao: "Which side of the trigger it opens on. When there is no room on that side, it flips to the opposite one.", valores: ["top", "right", "bottom", "left"],
        codigo: v => `<Tooltip content="Opens on the ${v}" side="${v}"><Button variant="outline">Side ${v}</Button></Tooltip>`,
        peca: v => h(A.Tooltip, {content: `Opens on the ${v}`, side: v}, h(A.Button, {variant: "outline"}, `Side ${v}`))}),
    ],
  },
  Header: {
    description: "The top bar of an app or a website — header, navbar, top bar. With items it is the "
      + "website header: the links with the current page marked, the actions on the right, and below "
      + "768px a menu button that drops the links under the bar, with no script.",
    code: `<Header
  variant="flush"
  divider
  maxWidth="xl"
  brand={<strong>Acme</strong>}
  items={[
    {id: "home", label: "Home", href: "/"},
    {id: "pricing", label: "Pricing", href: "/pricing"},
    {id: "docs", label: "Docs", href: "/docs"},
  ]}
  current="pricing"
  actions={<Button variant="primary" size="sm">Sign up</Button>}
/>`,
    render: () => h("div", {style: {width: "100%", position: "relative"}}, h(A.Header, {variant: "flush", divider: true,
      maxWidth: "xl", brand: h("strong", null, "Acme"),
      items: [{id: "home", label: "Home", href: "#"}, {id: "pricing", label: "Pricing", href: "#"}, {id: "docs", label: "Docs", href: "#"}],
      current: "pricing", actions: h(A.Button, {variant: "primary", size: "sm"}, "Sign up")})),
    examples: [
      eixo({titulo: "Variants", descricao: "floating is a detached card; flush merges into the page and frames the window; pill is a capsule floating over the content.",
        Comp: A.Header, nome: "Header", prop: "variant", valores: ["floating", "flush", "pill"],
        baseCodigo: "brand={<strong>Acme</strong>}", base: {brand: h("strong", null, "Acme")},
        estilo: {display: "grid", gap: "var(--space-4)", width: "100%"}}),
      eixo({titulo: "Content widths", descricao: "How far the bar's content grows, on the Container's scale, so the bar lines up with the page below it.",
        Comp: A.Header, nome: "Header", prop: "maxWidth", valores: ["sm", "md", "lg", "xl", "2xl", "docs", "full"],
        baseCodigo: "variant=\"flush\" brand={<strong>Acme</strong>}", base: {variant: "flush", brand: h("strong", null, "Acme")},
        estilo: {display: "grid", gap: "var(--space-2)", width: "100%"}}),
      {
        title: "Links at the start",
        description: "itemsJustify=\"start\" puts the links right after the brand; end, the default, puts them just before the actions.",
        code: `<Header
  variant="flush"
  brand={<strong>Acme</strong>}
  items={[{id: "home", label: "Home", href: "/"}, {id: "docs", label: "Docs", href: "/docs"}]}
  current="home"
  itemsJustify="start"
  navLabel="Links at the start"
  menuId="header-start-menu"
/>`,
        render: () => h("div", {style: {width: "100%", position: "relative"}}, h(A.Header, {variant: "flush",
          brand: h("strong", null, "Acme"), items: [{id: "home", label: "Home", href: "#"}, {id: "docs", label: "Docs", href: "#"}],
          current: "home", itemsJustify: "start", navLabel: "Links at the start", menuId: "header-start-menu"})),
      },
    ],
  },
  Topbar: {
    description: "The old name of Header (renamed on 07/10/2026). Same component, still works the same; "
      + "use Header. Three skins: floating, flush and pill.",
    code: `<Topbar variant="floating" brand={<strong>Acme</strong>}>
  <Button variant="primary" size="sm">New</Button>
</Topbar>`,
    render: () => h("div", {style: {width: "100%"}}, h(A.Topbar,
      {variant: "floating", brand: h("strong", null, "Acme")},
      h(A.Button, {variant: "primary", size: "sm"}, "New"))),
  },
  TreeView: {
    code: `<TreeView
  label="Files"
  defaultExpandedIds={["src"]}
  onSelect={node => open(node.id)}
  items={[
    {id: "src", label: "src", children: [
      {id: "index", label: "index.tsx"},
      {id: "tokens", label: "tokens.css"},
    ]},
    {id: "readme", label: "README.md"},
  ]}
/>`,
    render: () => h("div", {style: ate}, h(A.TreeView, {label: "Files",
      defaultExpandedIds: ["src"], items: [
        {id: "src", label: "src", children: [{id: "index", label: "index.tsx"},
          {id: "tokens", label: "tokens.css"}]},
        {id: "readme", label: "README.md"},
      ]})),
  },
};
