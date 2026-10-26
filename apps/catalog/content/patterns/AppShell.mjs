// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total em duas das referências. O alvo é nenhum componente em zero.
//
// `embed: true` em toda entrada, pela mesma razão medida do starter: o AppShell é dono do
// <main>, do <header> e do <aside> DO DOCUMENTO. Renderizado dentro da página do catálogo dá
// main duplicado e complementary aninhado (axe, 30/07/2026). Então cada preview daqui vive num
// documento próprio e entra por <iframe>.
//
// `.doc-nav` é a pele de navegação do próprio catálogo, não do sistema — link de navegação
// lateral ainda não é componente da Aurea (achado A8). O `code` mostra o <nav> puro porque é o
// que o consumidor tem hoje; o `render` veste para não reprovar contraste sobre a lateral.
import {createElement as h, useState} from "react";
import * as A from "../../../../packages/react/dist/index.js";

// As listas dos padrões do bloco 2 (0.44.0): os itens de uma lateral e as seções da trilha com o painel.
const ITENS = [
  {id: "home", label: "Home", icon: "house", href: "#"},
  {id: "tasks", label: "Tasks", icon: "check-square", href: "#"},
  {id: "docs", label: "Docs", icon: "file-text", href: "#"},
  {id: "schedule", label: "Schedule", icon: "calendar", href: "#"},
];
const SECOES = [
  {id: "s-home", label: "Home", icon: "house", items: [
    {id: "overview", label: "Overview", icon: "squares-four", href: "#"},
    {id: "orders", label: "Orders", icon: "receipt", href: "#"},
    {id: "inbox", label: "Inbox", icon: "tray", href: "#", badge: h(A.Badge, null, "4")},
  ]},
  {id: "s-dash", label: "Dashboard", icon: "chart-bar", items: [
    {id: "d-overview", label: "Overview", icon: "squares-four", href: "#"},
    {id: "analytics", label: "Analytics", icon: "chart-line", href: "#"},
  ]},
];
// O item atual da lateral nos cinco jeitos (o `sidebarIndicator`, a D4 da bancada do bloco 2): a mesma lateral, e uma chave
// no conteúdo que troca o jeito, ao vivo.
const JEITOS = [
  {value: "brand", label: "Brand"}, {value: "segment", label: "Segment"}, {value: "segment-dot", label: "Dot"},
  {value: "segment-line", label: "Line"}, {value: "subtle", label: "Subtle"},
];
function CincoJeitos() {
  const [jeito, setJeito] = useState("segment");
  return h(A.AppShell, {layout: "sidebar", sidebarIndicator: jeito,
    brand: h(A.Sidebar.Brand, {variant: "plain", logo: h(A.Icon, {name: "cube"}), name: "Acme"}),
    navItems: ITENS, currentNavId: "tasks",
  }, h("h1", null, "Tasks"), h(A.RadioGroup, {label: "The current item", orientation: "horizontal", value: jeito, onValueChange: setJeito},
    ...JEITOS.map((j) => h(A.Radio, {key: j.value, value: j.value, label: j.label}))));
}
// O título da página com o botão de recolher ao lado (`AppShell.SidebarToggle`), como nas quinze.
const titulo = (texto) => h("div", {style: {display: "flex", alignItems: "center", gap: "var(--space-3)"}},
  h(A.AppShell.SidebarToggle, null), h("h1", {style: {margin: 0}}, texto));

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
  topbar={<><IconButton icon="bell" label="Notifications" /><Button variant="primary" size="sm">New</Button></>}
>
  <h1>Inbox</h1>
  <p>Nothing needs your attention.</p>
</AppShell>`,
    render: () => h(A.AppShell, {
      brand: h("strong", null, "Acme"),
      navigation: nav(["Inbox", true], ["Archive"], ["Settings"]),
      topbar: h("div", {style: {display: "flex", gap: "var(--space-2)", alignItems: "center"}},
        h(A.IconButton, {icon: "bell", label: "Notifications"}),
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
  // A LATERAL ATÉ O TOPO (MNT-34, 0.42.0): a marca no topo da lateral, a pessoa no pé, e o botão de recolher ao lado do
  // título — o desenho das quinze laterais aprovadas pelo Victor.
  {
    variant: "Sidebar to the top",
    name: "The sidebar from top to bottom",
    description: "`layout=\"sidebar\"` drops the bar that spans the window: the sidebar runs from the top to the bottom, the brand lives at its top and the person at its bottom, and only the list scrolls. The collapse button sits beside the page title (`AppShell.SidebarToggle`).",
    uses: ["AppShell", "Sidebar", "Avatar", "IconButton"],
    embed: true,
    layoutProprio: true,
    tituloProprio: true,
    code: `<AppShell
  layout="sidebar"
  sidebarVariant="flush"
  sidebarCollapsible
  brand={<Sidebar.Brand logo="A" name="Acme" description="Workspace" />}
  sidebarFooter={<Sidebar.User avatar={<Avatar fallback="KM" alt="" />} name="Kate Moore" description="Admin"
    action={<IconButton icon="sign-out" label="Log out" size="sm" />} />}
  navItems={items}
  currentNavId="reports"
>
  <div style={{display: "flex", alignItems: "center", gap: "var(--space-3)"}}>
    <AppShell.SidebarToggle />
    <h1>Reports</h1>
  </div>
</AppShell>`,
    render: () => h(A.AppShell, {
      layout: "sidebar", sidebarVariant: "flush", sidebarCollapsible: true,
      brand: h(A.Sidebar.Brand, {logo: "A", name: "Acme", description: "Workspace"}),
      sidebarFooter: h(A.Sidebar.User, {avatar: h(A.Avatar, {fallback: "KM", alt: ""}), name: "Kate Moore", description: "Admin",
        action: h(A.IconButton, {icon: "sign-out", label: "Log out", size: "sm"})}),
      navItems: [{id: "overview", label: "Overview", icon: "house", href: "#"}, {id: "reports", label: "Reports", icon: "file-text", href: "#"},
        {id: "exports", label: "Exports", icon: "export", href: "#"}],
      currentNavId: "reports",
    }, h("div", {style: {display: "flex", alignItems: "center", gap: "var(--space-3)"}}, h(A.AppShell.SidebarToggle, null), h("h1", {style: {margin: 0}}, "Reports")),
      h("p", {className: "muted"}, "Six months of runs, by outcome.")),
  },
  {
    variant: "Sidebar to the top, with a bar",
    name: "A bar over the content alone",
    description: "Pass `topbar` and the bar comes back over the content column only, with the collapse button first in it. The sidebar keeps running from top to bottom.",
    uses: ["AppShell", "Sidebar", "SearchField"],
    embed: true,
    layoutProprio: true,
    tituloProprio: true,
    code: `<AppShell
  layout="sidebar"
  sidebarVariant="flush"
  sidebarCollapsible
  brand={<Sidebar.Brand logo="A" name="Acme" description="Workspace" />}
  topbar={<><strong>Reports</strong><SearchField aria-label="Search" placeholder="Search…" /></>}
  navItems={items}
  currentNavId="reports"
>
  <h1>Reports</h1>
</AppShell>`,
    render: () => h(A.AppShell, {
      layout: "sidebar", sidebarVariant: "flush", sidebarCollapsible: true,
      brand: h(A.Sidebar.Brand, {logo: "A", name: "Acme", description: "Workspace"}),
      topbar: h("div", {style: {display: "flex", alignItems: "center", gap: "var(--space-3)", flex: 1}}, h("strong", null, "Reports"),
        h("div", {style: {minWidth: "180px", marginInlineStart: "auto"}}, h(A.SearchField, {"aria-label": "Search", placeholder: "Search…"}))),
      navItems: [{id: "overview", label: "Overview", icon: "house", href: "#"}, {id: "reports", label: "Reports", icon: "file-text", href: "#"},
        {id: "exports", label: "Exports", icon: "export", href: "#"}],
      currentNavId: "reports",
    }, h("h1", null, "Reports"), h("p", {className: "muted"}, "Six months of runs, by outcome.")),
  },
  // O BLOCO 2 (0.44.0): as quinze laterais aprovadas pelo Victor em 21/10/2026, cada arranjo novo numa página — os jeitos de
  // recolher (cápsula e fora da tela), o botão dentro da lateral e a trilha das seções com o painel.
  {
    variant: "Capsule",
    name: "The sidebar that becomes a capsule",
    description: "`sidebarCollapsible=\"capsule\"`: collapsed, the floating sidebar keeps its rail of icons with the control radius — a capsule — instead of the card radius. The button at the seam collapses and expands it, and so does Ctrl+B (Cmd+B on a Mac).",
    uses: ["AppShell", "Sidebar"],
    embed: true,
    layoutProprio: true,
    tituloProprio: true,
    code: `<AppShell
  layout="sidebar"
  sidebarCollapsible="capsule"
  defaultSidebarCollapsed
  brand={<Sidebar.Brand variant="plain" logo={<Icon name="cube" />} name="Acme" />}
  navItems={items}
  currentNavId="tasks"
>
  <div style={{display: "flex", alignItems: "center", gap: "var(--space-3)"}}>
    <AppShell.SidebarToggle />
    <h1>Tasks</h1>
  </div>
</AppShell>`,
    render: () => h(A.AppShell, {
      layout: "sidebar", sidebarCollapsible: "capsule", defaultSidebarCollapsed: true,
      brand: h(A.Sidebar.Brand, {variant: "plain", logo: h(A.Icon, {name: "cube"}), name: "Acme"}),
      navItems: ITENS, currentNavId: "tasks",
    }, titulo("Tasks"), h("p", {className: "muted"}, "Three tasks are due this week.")),
  },
  {
    variant: "Off-canvas",
    name: "The sidebar that leaves the screen",
    description: "`sidebarCollapsible=\"offcanvas\"`: collapsed, the sidebar leaves the screen and the content takes the whole width. The button beside the title brings it back. It is the reference's off-canvas mode.",
    uses: ["AppShell", "Sidebar"],
    embed: true,
    layoutProprio: true,
    tituloProprio: true,
    code: `<AppShell
  layout="sidebar"
  sidebarVariant="flush"
  sidebarCollapsible="offcanvas"
  brand={<Sidebar.Brand variant="plain" logo={<Icon name="cube" />} name="Acme" />}
  navItems={items}
  currentNavId="docs"
>
  <div style={{display: "flex", alignItems: "center", gap: "var(--space-3)"}}>
    <AppShell.SidebarToggle />
    <h1>Docs</h1>
  </div>
</AppShell>`,
    render: () => h(A.AppShell, {
      layout: "sidebar", sidebarVariant: "flush", sidebarCollapsible: "offcanvas",
      brand: h(A.Sidebar.Brand, {variant: "plain", logo: h(A.Icon, {name: "cube"}), name: "Acme"}),
      navItems: ITENS, currentNavId: "docs",
    }, titulo("Docs"), h("p", {className: "muted"}, "Press the button beside the title to hide and bring back the sidebar.")),
  },
  {
    variant: "Button inside",
    name: "The collapse button inside the sidebar",
    description: "`sidebarToggle=\"none\"` keeps the shell from placing its own button, and the app puts `Sidebar.Toggle` where it wants — here, as the `action` of the brand at the top of the sidebar. Collapsed, the button moves under the logo.",
    uses: ["AppShell", "Sidebar"],
    embed: true,
    layoutProprio: true,
    tituloProprio: true,
    code: `<AppShell
  layout="sidebar"
  sidebarVariant="flush"
  sidebarCollapsible="icon"
  sidebarToggle="none"
  brand={<Sidebar.Brand variant="plain" logo={<Icon name="cube" />} name="Acme" action={<Sidebar.Toggle />} />}
  navItems={items}
  currentNavId="schedule"
>
  <h1>Schedule</h1>
</AppShell>`,
    render: () => h(A.AppShell, {
      layout: "sidebar", sidebarVariant: "flush", sidebarCollapsible: "icon", sidebarToggle: "none",
      brand: h(A.Sidebar.Brand, {variant: "plain", logo: h(A.Icon, {name: "cube"}), name: "Acme", action: h(A.Sidebar.Toggle, null)}),
      navItems: ITENS, currentNavId: "schedule",
    }, h("h1", null, "Schedule"), h("p", {className: "muted"}, "The button lives in the sidebar, next to the brand.")),
  },
  {
    variant: "Sections, docked",
    name: "Sections with the list beside them",
    description: "`sidebarPanel=\"docked\"`: the first level of `navItems` becomes sections — a rail of icons — and the list of the chosen section sits in a panel beside it. Collapsing hides the panel and keeps the rail.",
    uses: ["AppShell", "Sidebar", "Badge"],
    embed: true,
    layoutProprio: true,
    tituloProprio: true,
    code: `<AppShell
  layout="sidebar"
  sidebarCollapsible
  sidebarPanel="docked"
  brand={<Sidebar.Brand variant="plain" logo={<Icon name="cube" />} name="Acme" />}
  navItems={[
    {id: "home", label: "Home", icon: "house", items: [
      {id: "overview", label: "Overview", icon: "squares-four", href: "/"},
      {id: "orders", label: "Orders", icon: "receipt", href: "/orders"},
    ]},
    {id: "dashboard", label: "Dashboard", icon: "chart-bar", items: [
      {id: "analytics", label: "Analytics", icon: "chart-line", href: "/analytics"},
    ]},
  ]}
  currentNavId="orders"
>
  <h1>Orders</h1>
</AppShell>`,
    render: () => h(A.AppShell, {
      layout: "sidebar", sidebarCollapsible: true, sidebarPanel: "docked",
      brand: h(A.Sidebar.Brand, {variant: "plain", logo: h(A.Icon, {name: "cube"}), name: "Acme"}),
      navItems: SECOES, currentNavId: "orders",
    }, titulo("Orders"), h("p", {className: "muted"}, "Pick a section on the rail: its list opens beside it.")),
  },
  {
    variant: "Sections, overlay",
    name: "Sections with the list over the page",
    description: "`sidebarPanel=\"overlay\"`: the rail of sections stays narrow, and the list of a section opens over the page, next to its icon. Focus moves into the list, and Escape or a click outside closes it.",
    uses: ["AppShell", "Sidebar", "Badge"],
    embed: true,
    layoutProprio: true,
    tituloProprio: true,
    code: `<AppShell
  layout="sidebar"
  sidebarPanel="overlay"
  brand={<Sidebar.Brand variant="plain" logo={<Icon name="cube" />} name="Acme" />}
  navItems={sections}
  currentNavId="orders"
>
  <h1>Orders</h1>
</AppShell>`,
    render: () => h(A.AppShell, {
      layout: "sidebar", sidebarPanel: "overlay",
      brand: h(A.Sidebar.Brand, {variant: "plain", logo: h(A.Icon, {name: "cube"}), name: "Acme"}),
      navItems: SECOES, currentNavId: "orders",
    }, h("h1", null, "Orders"), h("p", {className: "muted"}, "Press an icon on the rail: its list opens over the page.")),
  },
  {
    variant: "Current item",
    name: "The current item of the sidebar, five ways",
    description: "`sidebarIndicator` sets how the item you are on is drawn: `brand` (the default), `segment` (the capsule of the selected tab, with no line), `segment-dot`, `segment-line` and `subtle`. Switch them here, on the real shell.",
    uses: ["AppShell", "Sidebar", "RadioGroup"],
    embed: true,
    layoutProprio: true,
    tituloProprio: true,
    code: `const ways = [
  {label: "Brand", sidebarIndicator: "brand"},
  {label: "Segment", sidebarIndicator: "segment"},
  {label: "Dot", sidebarIndicator: "segment-dot"},
  {label: "Line", sidebarIndicator: "segment-line"},
  {label: "Subtle", sidebarIndicator: "subtle"},
] as const;

function Shell() {
  const [way, setWay] = useState<(typeof ways)[number]>(ways[1]);
  return (
    <AppShell
      layout="sidebar"
      sidebarIndicator={way.sidebarIndicator}
      brand={<Sidebar.Brand variant="plain" logo={<Icon name="cube" />} name="Acme" />}
      navItems={items}
      currentNavId="tasks"
    >
      <h1>Tasks</h1>
      <RadioGroup label="The current item" orientation="horizontal" value={way.sidebarIndicator}
        onValueChange={(v) => setWay(ways.find((w) => w.sidebarIndicator === v)!)}>
        {ways.map((w) => <Radio key={w.sidebarIndicator} value={w.sidebarIndicator} label={w.label} />)}
      </RadioGroup>
    </AppShell>
  );
}

<Shell />`,
    render: () => h(CincoJeitos),
  },
];
