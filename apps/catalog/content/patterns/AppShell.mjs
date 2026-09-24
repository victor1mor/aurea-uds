// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
//
// `embed: true` em toda entrada, pela mesma razão medida do starter: o AppShell é dono do
// <main>, do <header> e do <aside> DO DOCUMENTO. Renderizado dentro da página do catálogo dá
// main duplicado e complementary aninhado (axe, 30/07/2026). Então cada preview daqui vive num
// documento próprio e entra por <iframe>.
//
// `.doc-nav` é a pele de navegação do próprio catálogo, não do sistema — link de navegação
// lateral ainda não é componente da Aurea (achado A8). O `code` mostra o <nav> puro porque é o
// que o consumidor tem hoje; o `render` veste para não reprovar contraste sobre a lateral.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";

const nav = (...itens) => h("nav", {className: "doc-nav", "aria-label": "Sections"},
  ...itens.map(([rotulo, atual]) => h("a", {key: rotulo, href: "#",
    ...(atual ? {className: "active", "aria-current": "page"} : {})}, rotulo)));

export default [
  {
    variant: "Floating",
    name: "The frame of a whole application",
    description: "Brand and global actions on the topbar, the sections on the sidebar, the screen in the middle. It is the only component that owns page landmarks — one per document, never nested — and it emits the skip link for free, which is what closes WCAG 2.4.1 without the consumer writing anything.",
    uses: ["AppShell", "Button", "IconButton"],
    embed: true,
    // O AppShell é dono do <main>, do <header> e do <h1> DO DOCUMENTO, e o cabeçalho deste
    // arquivo já dizia isso — faltavam as duas bandeiras que fazem a moldura recuar. Sem
    // elas o embed saía com dois <main> e dois <h1>, e a varredura do catálogo pegou os dois
    // em 29/08/2026. O starter do AppShell já as declarava; estes três padrões, não.
    layoutProprio: true,
    tituloProprio: true,
    code: `<AppShell
  brand={<strong>Acme</strong>}
  navigation={<nav aria-label="Sections"><a href="/inbox" aria-current="page">Inbox</a><a href="/archive">Archive</a></nav>}
  topbar={<><IconButton icon="notification" label="Notifications" /><Button variant="primary" size="sm">New</Button></>}
>
  <h1>Inbox</h1>
  <p>Nothing needs your attention.</p>
</AppShell>`,
    render: () => h(A.AppShell, {
      brand: h("strong", null, "Acme"),
      navigation: nav(["Inbox", true], ["Archive"], ["Settings"]),
      topbar: h("div", {style: {display: "flex", gap: "var(--space-2)", alignItems: "center"}},
        h(A.IconButton, {icon: "notification", label: "Notifications"}),
        h(A.Button, {variant: "primary", size: "sm"}, "New")),
    }, h("h1", null, "Inbox"), h("p", {className: "muted"}, "Nothing needs your attention.")),
  },
  {
    variant: "Flush",
    name: "A topbar joined to the page",
    description: "`topbarVariant=\"flush\"` drops the floating surface and welds the bar to the top edge. Pick one of the two per application and hold it: floating on one screen and flush on the next reads as two products, not as two screens.",
    uses: ["AppShell", "SearchField"],
    embed: true,
    // O AppShell é dono do <main>, do <header> e do <h1> DO DOCUMENTO, e o cabeçalho deste
    // arquivo já dizia isso — faltavam as duas bandeiras que fazem a moldura recuar. Sem
    // elas o embed saía com dois <main> e dois <h1>, e a varredura do catálogo pegou os dois
    // em 29/08/2026. O starter do AppShell já as declarava; estes três padrões, não.
    layoutProprio: true,
    tituloProprio: true,
    code: `<AppShell
  topbarVariant="flush"
  brand={<strong>Acme</strong>}
  navigation={<nav aria-label="Sections">…</nav>}
  topbar={<SearchField aria-label="Search" placeholder="Search…" />}
>
  <h1>Reports</h1>
</AppShell>`,
    render: () => h(A.AppShell, {
      topbarVariant: "flush",
      brand: h("strong", null, "Acme"),
      navigation: nav(["Overview"], ["Reports", true], ["Exports"]),
      topbar: h("div", {style: {minWidth: "180px"}},
        h(A.SearchField, {"aria-label": "Search", placeholder: "Search…"})),
    }, h("h1", null, "Reports"), h("p", {className: "muted"}, "Six months of runs, by outcome.")),
  },
  {
    variant: "Collapsed",
    name: "The sidebar out of the way",
    description: "`sidebarCollapsed` is controlled by the consumer, like `open` on the palette: the shell never decides on its own that the navigation should disappear. The toggle in the brand slot is emitted by the shell and drives the same sidebar on small screens, where it opens as a popover instead of a column.",
    uses: ["AppShell", "Button"],
    embed: true,
    // O AppShell é dono do <main>, do <header> e do <h1> DO DOCUMENTO, e o cabeçalho deste
    // arquivo já dizia isso — faltavam as duas bandeiras que fazem a moldura recuar. Sem
    // elas o embed saía com dois <main> e dois <h1>, e a varredura do catálogo pegou os dois
    // em 29/08/2026. O starter do AppShell já as declarava; estes três padrões, não.
    layoutProprio: true,
    tituloProprio: true,
    code: `const [collapsed, setCollapsed] = useState(true);

<AppShell
  brand={<strong>Acme</strong>}
  navigation={<nav aria-label="Sections">…</nav>}
  sidebarCollapsed={collapsed}
  topbar={<Button size="sm" variant="ghost" onClick={() => setCollapsed(c => !c)}>Toggle</Button>}
>
  <h1>Editor</h1>
</AppShell>`,
    render: () => h(A.AppShell, {
      brand: h("strong", null, "Acme"),
      sidebarCollapsed: true,
      navigation: nav(["Editor", true], ["Preview"], ["Publish"]),
      topbar: h(A.Button, {size: "sm", variant: "ghost"}, "Toggle"),
    }, h("h1", null, "Editor"), h("p", {className: "muted"},
      "The full width goes to the work; the sections are one click away.")),
  },
];
