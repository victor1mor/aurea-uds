import {createElement as h, Fragment} from "react";
import {Sidebar, Badge, Avatar, IconButton, Kbd, SearchField, useSidebar} from "../../../packages/react/dist/index.js";

// A CAIXA DE RECORTE SAIU (18/08/2026). Ela existia porque a `.sidebar` mede a altura em
// `calc(100vh - …)` e não cabia num painel de demo — e a saída de então foi CORTAR, com o
// comentário "a caixa mostra o topo". O Victor viu o corte e pediu a lateral inteira, no canto,
// que é como a referência mostra. A saída certa é a que a própria referência usa: MOLDURA com
// viewport própria (`embed: true`), onde `100vh` volta a significar o que diz.
// E com documento próprio o `role="presentation"` também saiu: ele existia só para o `<aside>`
// não virar um segundo landmark `complementary` dentro do `<main>` da página (axe, 30/07/2026).
// Na moldura não há página em volta, então o landmark volta a ser de verdade — que é mais honesto
// do que esconder o papel do componente para caber numa prévia.

// role="presentation" em TODA prévia: sem isso cada exemplo declara um segundo landmark
// `complementary` dentro do <main> da página (axe `landmark-complementary-is-top-level`).
// E cada <nav> leva um `label` PRÓPRIO: dois landmarks de navegação com o mesmo nome
// reprovam em `landmark-unique`, e o default de todos eles é "Sidebar".
// A MOLDURA REPRODUZ A COLUNA DO SHELL, e é isso que dá perspectiva de verdade. Sozinha num
// documento a lateral
// estica pela largura toda e deixa de parecer lateral — vira bloco. Aqui ela ganha a mesma coluna
// que o shell reserva, e ao lado fica o vão do conteúdo, vazio de propósito: é a proporção real.
// O painel aberto usa `--sidebar-width`; o recolhido usa `--sidebar-rail`.
// A COLUNA SOMA AS MARGENS QUANDO O PAINEL FLUTUA. Medido em 18/08/2026: com a coluna crua, a
// flutuante perde 32px para as próprias margens — o trilho caía de 88px para 56px e, a 56px, o
// raio de card (22px) fecha nas duas pontas e o painel vira CÁPSULA em vez de cartão. A referência
// mantém o trilho em 68px flutuando. Quem reserva a coluna é o shell; quem flutua dentro dela
// precisa de espaço para a margem, senão a variante come a própria largura.
// Com `placement="right"` (23/10/2026, o catálogo fiel) a coluna troca de lado: o vão do conteúdo vem primeiro e a
// lateral fica na direita, como na coluna "On this page" do `AppShell`. Sem ele, a moldura é a de sempre.
const moldura = (props, rotulo = "Sidebar") => {
  const painel = props.collapsed ? "var(--sidebar-rail)" : "var(--sidebar-width)";
  const coluna = props.variant === "flush" ? painel : `calc(${painel} + var(--space-4) * 2)`;
  const direita = props.placement === "right";
  return h("div", {style: {display: "grid",
    gridTemplateColumns: direita ? `minmax(0,1fr) ${coluna}` : `${coluna} minmax(0,1fr)`,
    // Sem fundo próprio (21/10/2026): pintava o cinza da página do app, e a moldura saía cinza no meio das caixas pretas
    // do site — o Victor apontou. O fundo é o da moldura, o da caixa de prévia, como em toda outra.
    height: "100vh",
    // A moldura DIZ A VERDADE SOBRE SI: a lateral reserva `--shell-top` no topo, que é a altura
    // do `Topbar` mais as folgas — e aqui não há topo nenhum. Sem isto a prévia abria com ~90px
    // de vazio guardados para um componente que não está na moldura. Quem mente sobre o contexto
    // é a moldura, não a lateral: o componente continua com a geometria do shell intacta.
    "--topbar-height": "0px"}},
    direita && h("main", null),
    h(Sidebar, props),
    // A MOLDURA É UM LAYOUT DE APLICATIVO EM MINIATURA, e isso não é enfeite: o embed é um
    // DOCUMENTO de verdade, que alguém pode abrir direto. Sem `<main>` e sem `h1` o axe reprova
    // com `landmark-one-main` e `page-has-heading-one`, e a varredura do catálogo reprova junto —
    // as duas com razão, porque um documento sem conteúdo principal e sem título não é página.
    // O `<main>` fica ao LADO da lateral, nunca em volta: `<aside>` dentro de `<main>` é a
    // violação `landmark-complementary-is-top-level`, que é justamente o que o antigo
    // `role="presentation"` existia para esconder. Aqui a estrutura é honesta em vez de escondida.
    // O `<main>` fica AO LADO da lateral, nunca em volta: `<aside>` dentro de `<main>` é a
    // violação `landmark-complementary-is-top-level`. O `h1` quem dá é o gerador — aqui ele
    // duplicaria, e duas vezes é pior que nenhuma.
    !direita && h("main", null));
};
const demo = (props) => moldura(props);

// O topo e o pé fixos (4-C, 23/10/2026): a marca do app em cima, a pessoa e o sair embaixo — a variação 11 das quinze
// laterais aprovadas pelo Victor. Os mesmos três itens: a lista do meio é a de sempre.
const marcaDoApp = h(Sidebar.Brand, {logo: "A", name: "Acme Plans", description: "Workspace"});
const pessoa = h(Sidebar.User, {avatar: h(Avatar, {fallback: "KM", alt: ""}), name: "Kate Moore", description: "Admin",
  action: h(IconButton, {icon: "sign-out", label: "Log out", size: "sm"})});
const busca = [
  h(Sidebar.Show, {key: "a", when: "expanded"}, h(SearchField, {placeholder: "Search", "aria-label": "Search"})),
  h(Sidebar.Show, {key: "r", when: "collapsed"}, h(IconButton, {icon: "magnifying-glass", label: "Search"})),
];

const ITENS = [
  {id: "button", label: "Button", icon: "plus", href: "../button.html",
    badge: h(Badge, {variant: "primary"}, "12")},
  {id: "navlist", label: "NavList", icon: "list-bullets", href: "../navlist.html"},
  {id: "sidebar", label: "Sidebar", icon: "sidebar-simple", href: "../sidebar.html"},
];

// Uma lista longa, para a barra de rolagem existir: com três itens a lateral não rola, e o `scrollbar` não teria o que
// mostrar. Os nomes são páginas de verdade do site.
const MUITOS = ["Accordion", "Alert", "Avatar", "Badge", "Banner", "Breadcrumb", "Button", "ButtonGroup", "Calendar",
  "Card", "Checkbox", "ColorArea", "ColorField", "Combobox", "DataGrid", "DatePicker", "Dialog", "Drawer", "Field",
  "Input", "Progress", "Radio", "Select", "Sidebar", "Slider", "Switch", "Tabs", "Textarea", "Toggle", "Tooltip"]
  .map((nome) => ({id: nome.toLowerCase(), label: nome, href: `../${nome.toLowerCase()}.html`}));

// O bloco 2 (0.44.0): as listas e o arranjo dos exemplos novos.
const INDICADORES = [["brand", "Brand"], ["segment", "Segment"], ["segment-dot", "Segment with a dot"],
  ["segment-line", "Segment with a line"], ["subtle", "Subtle"]];
const SECOES = [
  {id: "s-home", label: "Home", icon: "house", items: [
    {id: "overview", label: "Overview", icon: "squares-four", href: "#"},
    {id: "orders", label: "Orders", icon: "receipt", href: "#"},
    {id: "inbox", label: "Inbox", icon: "tray", href: "#", badge: h(Badge, null, "4")},
  ]},
  {id: "s-dash", label: "Dashboard", icon: "chart-bar", items: [
    {id: "d-overview", label: "Overview", icon: "squares-four", href: "#"},
    {id: "analytics", label: "Analytics", icon: "chart-line", href: "#"},
  ]},
];
const DOBRA = [
  {id: "file", label: "File", collapsible: true, action: h(IconButton, {icon: "plus", label: "Add to File", size: "xs"}), items: [
    {id: "store", label: "Store", icon: "storefront", href: "#", action: h(IconButton, {icon: "dots-three", label: "Store options", size: "xs"})},
    {id: "company", label: "Company", icon: "buildings", href: "#"},
  ]},
  {id: "archive", label: "Archive", collapsible: true, defaultOpen: false, items: [
    {id: "old", label: "Old projects", icon: "archive", href: "#"},
  ]},
];
const TIMES = [
  {id: "home", label: "Home", icon: "house", href: "#"},
  "separator",
  {id: "catalog", label: "Catalog", avatar: {fallback: "CA"}, href: "#", badge: h(Kbd, null, "⌘1")},
  {id: "warpspeed", label: "Warpspeed", avatar: {fallback: "WA"}, href: "#", badge: h(Kbd, null, "⌘2")},
];
// A lateral solta com o estado no provedor: a coluna dela acompanha o estado (aberta, a largura da lateral; fora da tela,
// zero), e o botão de recolher mora ao lado do título.
function Arranjo() {
  const estado = useSidebar();
  // Na tela estreita, a coluna deixa sempre o lugar do botão ao lado (64): a 320 ele passava da tela.
  const coluna = estado?.collapsed ? "0px" : "min(calc(var(--sidebar-width) + var(--space-4) * 2), calc(100% - var(--space-16)))";
  return h("div", {style: {display: "grid", gridTemplateColumns: `${coluna} minmax(0,1fr)`, height: "100vh"}},
    h(Sidebar, {label: "Components offcanvas", current: "button", items: ITENS, footer: h(Sidebar.Toggle, {variant: "item"})}),
    h("main", {style: {padding: "var(--space-4) var(--space-2)"}}, h(Sidebar.Toggle, null)));
}

export default {
  description:
    "Sidebar is the <aside> the AppShell composes, and the navigation inside it. Pass `items` "
    + "and it renders the list — icons, groups, one level of nesting, and the current item "
    + "marked with aria-current. Pass children instead and the markup is entirely yours.",
  install: 'import {Sidebar} from "@aurea-uds/react";',
  features: [
    "One item shape covers both: an item with `items` and no `href` is a group heading; with an "
    + "href it is a parent with a sublist.",
    "The current item is marked with aria-current=\"page\" — the same attribute the screen "
    + "reader announces and the skin paints, so they cannot drift apart.",
    "Collapsed turns it into an icon rail. The labels stay in the DOM as screen-reader-only "
    + "text. The panel narrows to --sidebar-rail; a floating shell track also preserves its two "
    + "outer margins.",
    "It FLOATS by default — margin, card radius, its own surface. That is what this "
    + "design system looks like everywhere. `variant=\"flush\"` is the one exception it makes to "
    + "that rule, and it is opt-in: against the edges, full height, separated from the content by "
    + "a single rule. It was measured against four shipping admin dashboards. "
    + "Aurea's own pages stay floating; flush is for the "
    + "applications that want it.",
    "AppShell forwards it: `<AppShell sidebarVariant=\"flush\">`. Without that the variant would "
    + "be unreachable for anyone composing through the shell, which is the normal path.",
    "A fixed top and bottom: `header` (the app brand, a search) and `footer` (the person and the sign-out, a short "
    + "list) stay put, and only the list in the middle scrolls. Four parts fill them — `Sidebar.Brand`, `Sidebar.User`, "
    + "`Sidebar.Nav` and `Sidebar.Show` — and each one knows when the sidebar is collapsed.",
    "Below the lg breakpoint (1024px) the AppShell turns it into a drawer with the native "
    + "popover — Escape and click-outside stay native, and the shell normalises focus across "
    + "the three browser engines.",
    "No roving tabindex: site navigation has no APG pattern, and in a sidebar people expect "
    + "Tab to walk the items one by one.",
    "Three ways to collapse (collapsible): the icon rail, the rail as a capsule, and off the screen. Outside the AppShell, "
    + "Sidebar.Provider keeps the state, Sidebar.Toggle collapses it from anywhere, useSidebar reads it, and Ctrl+B (Cmd+B "
    + "on a Mac) toggles it — except while you type in a field.",
    "Groups that fold (collapsible), an action beside a group or an item (action), a gap between sections (\"separator\"), "
    + "a photo in place of the icon (avatar), sections with a panel (panel) and five ways to draw the current item "
    + "(indicator).",
  ],
  examples: [
    {
      title: "Full · floating — the default",
      description: "Icons, an accessory on the right, and the item you are on.",
      code: `<Sidebar
  label="Components"
  current="button"
  items={[
    {id: "button", label: "Button", icon: "plus", href: "../button.html", badge: <Badge variant="primary">12</Badge>},
    {id: "navlist", label: "NavList", icon: "list-bullets", href: "../navlist.html"},
    {id: "sidebar", label: "Sidebar", icon: "sidebar-simple", href: "../sidebar.html"},
  ]}
/>`,
      embed: true,
      layoutProprio: true,
      render: () => demo({label: "Components", current: "button", items: ITENS}),
    },
    {
      title: "Groups and one level of nesting",
      description:
        "A group has a label and no link of its own. A parent that navigates keeps its link and "
        + "gains a sublist.",
      code: `<Sidebar
  label="Catalog"
  current="sidebar"
  items={[
    {id: "components", label: "Components", items: [
      {id: "button", label: "Button", icon: "plus", href: "../button.html"},
      {id: "navigation", label: "Navigation", icon: "list-bullets", href: "../navlist.html", items: [
        {id: "navlist", label: "NavList", href: "../navlist.html"},
        {id: "sidebar", label: "Sidebar", href: "../sidebar.html"},
      ]},
    ]},
    {id: "shells", label: "Shells", items: [
      {id: "appshell", label: "AppShell", href: "../appshell.html"},
    ]},
  ]}
/>`,
      embed: true,
      layoutProprio: true,
      render: () => demo({
        label: "Catalog", current: "sidebar",
        items: [
          {id: "components", label: "Components", items: [
            {id: "button", label: "Button", icon: "plus", href: "../button.html"},
            {id: "navigation", label: "Navigation", icon: "list-bullets", href: "../navlist.html", items: [
              {id: "navlist", label: "NavList", href: "../navlist.html"},
              {id: "sidebar", label: "Sidebar", href: "../sidebar.html"},
            ]},
          ]},
          {id: "shells", label: "Shells", items: [
            {id: "appshell", label: "AppShell", href: "../appshell.html"},
          ]},
        ],
      }),
    },
    {
      title: "Slim · floating — the icon rail",
      description:
        "Same list, same DOM. The labels become screen-reader-only, so the rail never turns into "
        + "a column of unnamed icons.",
      code: `<Sidebar collapsed label="Components" current="button" items={items} />`,
      embed: true,
      layoutProprio: true,
      render: () => moldura({label: "Components rail", current: "button", collapsed: true, items: ITENS},
        "Sidebar rail"),
    },
    {
      title: "Full · flush — the one exception",
      description: "The variant that gives up the floating box: it sits against the edges, takes "
        + "the full height and is separated from the content by a single rule instead of a gap. "
        + "The rows inside keep the same radius in both variants — what changes is the panel, "
        + "not the line.",
      code: `<Sidebar variant="flush" label="Components" current="button" items={items} />`,
      embed: true,
      layoutProprio: true,
      render: () => moldura({label: "Components flush", variant: "flush", current: "button",
        items: ITENS}, "Sidebar flush"),
    },
    {
      title: "Slim · flush — the rail against the edge",
      description: "The fourth combination: collapsed AND flush. The reference does the opposite "
        + "of this one — their narrow column floats as a card while the wide one sits flush, "
        + "measured on their own docs: 68px floating against 280px flush. Both pairings exist "
        + "because the two props are separate axes.",
      code: `<Sidebar collapsed variant="flush" label="Components" current="button" items={items} />`,
      embed: true,
      layoutProprio: true,
      render: () => moldura({label: "Components rail flush", variant: "flush", collapsed: true,
        current: "button", items: ITENS}, "Sidebar slim flush"),
    },
    {
      title: "A fixed top and bottom",
      description: "The brand at the top and the person at the bottom stay put; only the list scrolls. Sidebar.Brand "
        + "puts the logo in a square of the primary colour; Sidebar.User puts the person in a box, with the action "
        + "beside the name.",
      code: `<Sidebar
  variant="flush"
  label="Components"
  current="button"
  items={items}
  header={<Sidebar.Brand logo="A" name="Acme Plans" description="Workspace" />}
  footer={
    <Sidebar.User
      avatar={<Avatar fallback="KM" alt="" />}
      name="Kate Moore"
      description="Admin"
      action={<IconButton icon="sign-out" label="Log out" size="sm" />}
    />
  }
/>`,
      embed: true,
      layoutProprio: true,
      render: () => moldura({label: "Components with parts", variant: "flush", current: "button", items: ITENS,
        header: marcaDoApp, footer: pessoa}),
    },
    {
      title: "A fixed top and bottom, collapsed",
      description: "Collapsed, the brand keeps only its logo, the search turns into a button (Sidebar.Show), and the "
        + "person becomes the avatar with the action under it. The names stay for screen readers.",
      code: `<Sidebar collapsed variant="flush" label="Components" current="button" items={items}
  header={<>
    <Sidebar.Brand logo="A" name="Acme Plans" description="Workspace" />
    <Sidebar.Show when="expanded"><SearchField placeholder="Search" aria-label="Search" /></Sidebar.Show>
    <Sidebar.Show when="collapsed"><IconButton icon="magnifying-glass" label="Search" /></Sidebar.Show>
  </>}
  footer={<Sidebar.User avatar={<Avatar fallback="KM" alt="" />} name="Kate Moore" description="Admin"
    action={<IconButton icon="sign-out" label="Log out" size="sm" />} />}
/>`,
      embed: true,
      layoutProprio: true,
      render: () => moldura({label: "Components with parts rail", variant: "flush", collapsed: true, current: "button",
        items: ITENS, header: h(Fragment, null, marcaDoApp, ...busca), footer: pessoa}),
    },
    {
      title: "Bring your own navigation",
      description:
        "children still works and is not legacy: when the list comes from a router or a CMS, the "
        + "<nav> and its label are yours.",
      code: `<Sidebar>
  <nav aria-label="Project">
    <a href="../button.html" aria-current="page">Button</a>
    <a href="../sidebar.html">Sidebar</a>
  </nav>
</Sidebar>`,
      embed: true,
      layoutProprio: true,
      render: () => demo({children: h("nav", {className: "sidebar-nav", "aria-label": "Project"},
        h("a", {href: "../button.html", className: "sidebar-item", "aria-current": "page"},
          h("span", {className: "sidebar-label"}, "Button")),
        h("a", {href: "../sidebar.html", className: "sidebar-item"},
          h("span", {className: "sidebar-label"}, "Sidebar")))}),
    },
    {
      title: "Plain — no box",
      description: "No background, no line, no shadow: the items sit loose on the page, in the floating sidebar's "
        + "place and height. It is the \"On this page\" column of a documentation site.",
      code: `<Sidebar variant="plain" label="Components" current="button" items={items} />`,
      embed: true,
      layoutProprio: true,
      render: () => moldura({label: "Components", variant: "plain", current: "button", items: ITENS}),
    },
    {
      title: "On the right",
      description: "placement=\"right\" puts the sidebar on the other side of the screen, with the content before it. "
        + "It is the AppShell's aside column.",
      code: `<Sidebar placement="right" label="Components" current="button" items={items} />`,
      embed: true,
      layoutProprio: true,
      render: () => moldura({label: "Components", placement: "right", current: "button", items: ITENS}),
    },
    {
      title: "Scrollbar always on",
      description: "By default the scrollbar is light and hidden at rest, and comes back with the pointer, with focus "
        + "inside, and always on a touch screen. scrollbar=\"visible\" keeps it on screen all the time.",
      code: `<Sidebar scrollbar="visible" label="Components" current="button" items={items} />`,
      embed: true,
      layoutProprio: true,
      render: () => moldura({label: "Components", scrollbar: "visible", current: "button", items: MUITOS}),
    },
    // O BLOCO 2 (0.44.0) — o que faltava das quinze laterais aprovadas pelo Victor em 21/10/2026, cada coisa num exemplo vivo.
    {
      title: "The current item, five ways",
      description: "indicator sets how the item you are on is drawn. brand is the default. segment is the capsule of the "
        + "selected tab, with the text colour and no line; segment-dot and segment-line add a yellow dot or the yellow line; "
        + "subtle is the grey alone.",
      code: `<Sidebar indicator="brand" label="Brand" current="button" items={items} />
<Sidebar indicator="segment" label="Segment" current="button" items={items} />
<Sidebar indicator="segment-dot" label="Segment with a dot" current="button" items={items} />
<Sidebar indicator="segment-line" label="Segment with a line" current="button" items={items} />
<Sidebar indicator="subtle" label="Subtle" current="button" items={items} />`,
      embed: true,
      layoutProprio: true,
      render: () => h("div", {style: {display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(15rem, 1fr))", gap: "var(--space-4)",
        padding: "var(--space-4)", alignContent: "start", minHeight: "100vh"}},
        ...INDICADORES.map(([valor, rotulo]) => h(Sidebar, {key: valor, indicator: valor, label: rotulo, "aria-label": rotulo, current: "button", items: ITENS,
          style: {position: "static", height: "auto", margin: 0}})),
        h("main", null)),
    },
    {
      title: "Collapsed into a capsule",
      description: "collapsible=\"capsule\": the rail of icons keeps the control radius instead of the card radius. In the AppShell "
        + "it is sidebarCollapsible=\"capsule\".",
      code: `<Sidebar collapsed collapsible="capsule" label="Components" current="button" items={items} />`,
      embed: true,
      layoutProprio: true,
      render: () => moldura({label: "Components capsule", collapsed: true, collapsible: "capsule", current: "button", items: ITENS}),
    },
    {
      title: "Off the screen, with its own state",
      description: "Outside the AppShell, Sidebar.Provider keeps the state, and Sidebar.Toggle collapses it from anywhere: here "
        + "beside the title, and as a row at the bottom of the sidebar. collapsible=\"offcanvas\" takes the sidebar off the "
        + "screen. Ctrl+B (Cmd+B on a Mac) toggles it too, except while you type in a field.",
      code: `<Sidebar.Provider collapsible="offcanvas">
  <Sidebar label="Components" current="button" items={items}
    footer={<Sidebar.Toggle variant="item" />} />
  <main>
    <Sidebar.Toggle />
  </main>
</Sidebar.Provider>`,
      embed: true,
      layoutProprio: true,
      render: () => h(Sidebar.Provider, {collapsible: "offcanvas"}, h(Arranjo, null)),
    },
    {
      title: "Sections with a panel beside the rail",
      description: "panel=\"docked\": the first level of items becomes sections, shown as a rail of icons, and the list of the "
        + "chosen section sits in a panel beside it. Collapsed, only the rail stays.",
      code: `<Sidebar panel="docked" label="Sections" current="orders" items={[
  {id: "home", label: "Home", icon: "house", items: [
    {id: "overview", label: "Overview", icon: "squares-four", href: "/"},
    {id: "orders", label: "Orders", icon: "receipt", href: "/orders"},
  ]},
  {id: "dashboard", label: "Dashboard", icon: "chart-bar", items: [
    {id: "analytics", label: "Analytics", icon: "chart-line", href: "/analytics"},
  ]},
]} />`,
      embed: true,
      layoutProprio: true,
      render: () => h("div", {style: {display: "flex", height: "100vh", "--topbar-height": "0px"}},
        h(Sidebar, {panel: "docked", label: "Sections", current: "orders", items: SECOES}), h("main", null)),
    },
    {
      title: "Sections in a panel over the page",
      description: "panel=\"overlay\": the rail stays narrow, and the list of a section opens over the page, next to its icon. "
        + "Focus moves into the list, and Escape or a click outside closes it.",
      code: `<Sidebar panel="overlay" label="Sections" current="orders" items={sections} />`,
      embed: true,
      layoutProprio: true,
      render: () => h("div", {style: {display: "flex", height: "100vh"}},
        h(Sidebar, {panel: "overlay", label: "Sections", current: "orders", items: SECOES}), h("main", null)),
    },
    {
      title: "Groups that fold, with actions",
      description: "A group with collapsible folds its list: the name becomes a button with aria-expanded. action puts a small "
        + "button beside the group (\"+\") or beside an item (\"⋯\") — next to the link, never inside it.",
      code: `<Sidebar label="Files" current="store" items={[
  {id: "file", label: "File", collapsible: true,
    action: <IconButton icon="plus" label="Add to File" size="xs" />, items: [
    {id: "store", label: "Store", icon: "storefront", href: "/store",
      action: <IconButton icon="dots-three" label="Store options" size="xs" />},
    {id: "company", label: "Company", icon: "buildings", href: "/company"},
  ]},
  {id: "archive", label: "Archive", collapsible: true, defaultOpen: false, items: [
    {id: "old", label: "Old projects", icon: "archive", href: "/old"},
  ]},
]} />`,
      embed: true,
      layoutProprio: true,
      render: () => moldura({label: "Files", current: "store", items: DOBRA}),
    },
    {
      title: "Separators and avatars",
      description: "The string \"separator\" between items splits the list with a gap — no line. avatar puts a photo or a team "
        + "logo in place of the icon, and it stays on the rail when the sidebar collapses.",
      code: `<Sidebar label="Teams" current="catalog" items={[
  {id: "home", label: "Home", icon: "house", href: "/"},
  "separator",
  {id: "catalog", label: "Catalog", avatar: {fallback: "CA"}, href: "/catalog", badge: <Kbd>⌘1</Kbd>},
  {id: "warpspeed", label: "Warpspeed", avatar: {fallback: "WA"}, href: "/warpspeed", badge: <Kbd>⌘2</Kbd>},
]} />`,
      embed: true,
      layoutProprio: true,
      render: () => moldura({label: "Teams", current: "catalog", items: TIMES}),
    },
  ],
};
