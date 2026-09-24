import {createElement as h} from "react";
import {Sidebar, Badge} from "../../../packages/react/dist/index.js";

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
const moldura = (props, rotulo = "Sidebar") => {
  const painel = props.collapsed ? "var(--sidebar-rail)" : "var(--sidebar-width)";
  const coluna = props.variant === "flush" ? painel : `calc(${painel} + var(--space-4) * 2)`;
  return h("div", {style: {display: "grid", gridTemplateColumns: `${coluna} minmax(0,1fr)`,
    height: "100vh", background: "var(--background)",
    // A moldura DIZ A VERDADE SOBRE SI: a lateral reserva `--shell-top` no topo, que é a altura
    // do `Topbar` mais as folgas — e aqui não há topo nenhum. Sem isto a prévia abria com ~90px
    // de vazio guardados para um componente que não está na moldura. Quem mente sobre o contexto
    // é a moldura, não a lateral: o componente continua com a geometria do shell intacta.
    "--topbar-height": "0px"}},
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
    h("main", null));
};
const demo = (props) => moldura(props);

const ITENS = [
  {id: "button", label: "Button", icon: "add", href: "../button.html",
    badge: h(Badge, {variant: "primary"}, "12")},
  {id: "navlist", label: "NavList", icon: "list", href: "../navlist.html"},
  {id: "sidebar", label: "Sidebar", icon: "side-panel--open", href: "../sidebar.html"},
];

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
    "It FLOATS by default — margin, card radius, a border all the way around. That is what this "
    + "design system looks like everywhere. `variant=\"flush\"` is the one exception it makes to "
    + "that rule, and it is opt-in: against the edges, full height, separated from the content by "
    + "a single rule. It was measured against four shipping apps — Cloudflare, Sophos, Claude's "
    + "own app and HeroUI's dashboard. Aurea's own pages stay floating; flush is for the "
    + "applications that want it.",
    "AppShell forwards it: `<AppShell sidebarVariant=\"flush\">`. Without that the variant would "
    + "be unreachable for anyone composing through the shell, which is the normal path.",
    "Below the lg breakpoint (1024px) the AppShell turns it into a drawer with the native "
    + "popover — Escape and click-outside stay native, and the shell normalises focus across "
    + "the three browser engines.",
    "No roving tabindex: site navigation has no APG pattern, and in a sidebar people expect "
    + "Tab to walk the items one by one.",
  ],
  examples: [
    {
      title: "Full · floating — the default",
      description: "Icons, an accessory on the right, and the item you are on.",
      code: `<Sidebar
  label="Components"
  current="button"
  items={[
    {id: "button", label: "Button", icon: "add", href: "../button.html", badge: <Badge variant="primary">12</Badge>},
    {id: "navlist", label: "NavList", icon: "list", href: "../navlist.html"},
    {id: "sidebar", label: "Sidebar", icon: "side-panel--open", href: "../sidebar.html"},
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
      {id: "button", label: "Button", icon: "add", href: "../button.html"},
      {id: "navigation", label: "Navigation", icon: "list", href: "../navlist.html", items: [
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
            {id: "button", label: "Button", icon: "add", href: "../button.html"},
            {id: "navigation", label: "Navigation", icon: "list", href: "../navlist.html", items: [
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
  ],
};
