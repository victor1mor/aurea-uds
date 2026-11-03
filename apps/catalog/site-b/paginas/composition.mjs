// COMPOSITION no desenho B (aprovado em 26/10/2026). O texto é o do `composition.md`; a página arruma como o desenho: o mapa
// dos quatro jeitos, o cartão que se monta ligando as partes (o `ToggleGroup` e o `Card` de verdade, com o código ao lado),
// o desenho do `AppShell` em que se escolhe uma área (o D-5, aprovado em 01/11/2026: cada área é o `Toggle area` COM FUNDO),
// a trilha desenhada pelos dados (o `Breadcrumb` de verdade), o sem e o com `render`, e as categorias para escolher. O
// comportamento é o `site-b/js/composition.js`.
import {docsB} from "./docs-b/comum.mjs";

// As áreas do `AppShell` — o nome, a classe da posição no desenho e a frase do painel ao lado.
const AREAS = [["brand", "brand", "Logotype and product name. Lives in the topbar, beside the navigation toggle."],
  ["topbar", "top", "What sits in the topbar next to the brand: the page title, sections, search."],
  ["topbarActions", "acts", "The far end of the topbar: the theme switch, the account, notifications."],
  ["navigation", "nav", "The sidebar content, usually a <nav>. The shell never invents one, so the landmark and its label are yours."],
  ["children", "kids", "Page content. Rendered inside the <main> the shell owns."],
  ["aside", "aside", "The right-hand column, such as a documentation page’s \"On this page\"."],
  ["sidebarFooter", "sfoot", "The fixed bottom of the sidebar: the person and the sign-out. Only the list in the middle scrolls."]];
const PARTES = [["media", "Card.Media"], ["header", "Card.Header"], ["title", "Card.Title"], ["desc", "Card.Description"],
  ["content", "Card.Content"], ["footer", "Card.Footer"]];
const CATEGORIAS = ["actions", "inputs", "navigation", "overlays", "disclosure", "feedback", "data-display", "identity", "media", "code",
  "communication", "layout", "system", "agents"];

export default function composition(site, doc) {
  const g = docsB(site, doc, {arquivos: ["Report.tsx", "App.tsx", "Breadcrumb.tsx", "Nav.tsx", "Reports.tsx", "SaveButton.tsx", "imports.ts"]});
  const {h, A} = g;

  const pecas = [
    g.mono("<Card.Header>"),
    g.amarela("render={<RouterLink />}"),
    g.numero("4", "ways to fit", "parts · slots · lists · render"),
    g.mono("items={[…]}"),
  ];

  // O MAPA: os quatro jeitos, cada um levando à seção dele.
  const jeitos = [["parts", "Card.Header", "Parts", "Pieces you arrange yourself, hanging from the component with a dot."],
    ["slots", "brand={…}", "Slots", "Named props that take your elements. The component places them."],
    ["lists-from-data", "items={[…]}", "Lists from data", "Pass data; Aurea keeps the structure and the keyboard right."],
    ["the-render-prop", "render={…}", "The render prop", "Aurea's look on an element you choose, such as your router's link."]];
  const mapa = [h("div", {key: "mapa", className: "docb-grade-4 composition-mapa"}, ...jeitos.map(([id, codigo, nome, frase]) =>
    h(A.Card, {key: id, variant: "interactive", lift: true, className: "composition-jeito", render: h("a", {href: `#${id}`})},
      h("code", null, codigo), h("b", null, nome), h("span", null, frase))))];

  // PARTS: as partes para ligar (o `ToggleGroup` de vários), o código que acompanha e o cartão de verdade ao lado.
  const pt = g.secao("parts");
  const codigoDoCartao = pt.blocos.find(b => b.tipo === "codigo");
  const montador = h("div", {key: "montador", className: "composition-montador"},
    h("div", {className: "composition-controles"},
      // Como o desenho (02/11/2026): cada parte é uma caixa de marcar em cápsula (o `Checkbox variant="pill"`, o item 4),
      // num cartão; o código vem num cartão próprio, embaixo, e o cartão de verdade fica ao lado dos dois.
      h("div", {className: "composition-partes-caixa"},
        h("p", {className: "docb-rotulo", id: "composition-partes"}, "Card parts"),
        h("div", {className: "composition-partes", role: "group", "aria-labelledby": "composition-partes"},
          ...PARTES.map(([v, nome], i) => h(A.Checkbox, {key: v, variant: "pill", size: "md", label: nome, value: v, defaultChecked: i > 0,
            "data-composition-parte": v})))),
      g.codigo(codigoDoCartao, "composition-codigo")),
    h("div", {className: "composition-palco", "aria-label": "Preview of the card", role: "group"},
      h(A.Card, {className: "composition-cartao"},
        // As partes são filhas diretas do cartão (o espaço entre elas é do `Card`); o script esconde as desligadas.
        h(A.Card.Media, {hidden: true}, h("div", {className: "composition-midia"}, "Card.Media")),
        h(A.Card.Header, null, h(A.Card.Title, null, "Weekly report"), h(A.Card.Description, null, "Sent every Monday at 9:00.")),
        h(A.Card.Content, null, "12 people receive it."),
        h(A.Card.Footer, null, h(A.Button, {variant: "primary", size: "md"}, "Edit"), h(A.Button, {size: "md"}, "Pause")),
        h("p", {className: "composition-vazio", hidden: true}, "An empty card. Turn a part on."))));

  // SLOTS: o desenho do `AppShell`, cada área um `Toggle area` com fundo (o D-5); a escolhida explica-se no painel ao lado.
  const sl = g.secao("slots");
  const primeiroSl = sl.blocos[0];
  const escolhida = AREAS[4];
  const casca = h("div", {key: "casca", className: "composition-casca"},
    h("div", {className: "composition-moldura", role: "group", "aria-label": "The slots of AppShell"},
      ...AREAS.map(([nome, lugar]) => h(A.Toggle, {key: nome, area: true, value: nome, defaultPressed: nome === escolhida[0],
        className: `composition-zona composition-zona-${lugar}`}, h("span", {className: "composition-zona-nome"}, nome)))),
    h("div", {className: "docb-caixa composition-info", "aria-live": "polite"},
      h("p", {className: "docb-rotulo"}, "Slot"), h("h3", {className: "composition-info-nome"}, escolhida[0]), h("p", {className: "composition-info-frase"}, escolhida[2]),
      // As frases de todas as áreas, para o script trocar a do painel (o `Toggle` não repassa atributos de dados).
      h("div", {hidden: true}, ...AREAS.map(([nome, , frase]) => h("span", {key: nome, "data-area": nome}, frase)))));

  // LISTS FROM DATA: a trilha que o código desenha, de verdade.
  const ld = g.secao("lists-from-data");
  const trilha = h("div", {key: "trilha", className: "docb-caixa composition-trilha"},
    h(A.Breadcrumb, {items: [{label: "Home", href: "#lists-from-data"}, {label: "Reports", href: "#lists-from-data"}, {label: "Weekly"}]}));

  // THE RENDER PROP: o sem e o com, lado a lado.
  const rp = g.secao("the-render-prop");
  const primeiroRp = rp.blocos[0];
  const comparar = h("div", {key: "comparar", className: "docb-grade-2"},
    h("div", {className: "docb-caixa composition-render"}, h("p", {className: "docb-rotulo"}, "Without render"),
      h("p", {className: "composition-saida"}, "<", h("span", null, "button"), " class=\"btn btn-primary\" onClick={go}>Reports</button>"),
      h(A.Badge, {tone: "danger", size: "lg", leading: h(A.Icon, {name: "x", size: "sm"})}, "A button that navigates")),
    h("div", {className: "docb-caixa composition-render"}, h("p", {className: "docb-rotulo"}, "With render={<RouterLink to=\"/reports\" />}"),
      h("p", {className: "composition-saida"}, "<", h("span", null, "a"), " class=\"btn btn-primary\" href=\"/reports\">Reports</a>"),
      h(A.Badge, {tone: "success", size: "lg", leading: h(A.Icon, {name: "check", size: "sm"})}, "A link, with Aurea's look")));

  // ENTRY POINTS: as categorias para escolher (o `ToggleGroup` de um só); o código mostra a linha de importar dela.
  const ep = g.secao("entry-points");
  const codigoEp = ep.blocos.find(b => b.tipo === "codigo");
  const pesados = g.achar(ep, "p", "Six heavier");
  const categorias = h("div", {key: "categorias", className: "composition-categorias"},
    h(A.ToggleGroup, {detached: true, size: "md", label: "Category", defaultValue: ["actions"]},
      ...CATEGORIAS.map(c => h(A.Toggle, {key: c, value: c}, c))));
  const modulos = h("div", {key: "modulos", className: "composition-pesados"}, ...["code-editor", "data-grid", "qrcode", "calendar", "chart", "graph"].map(m =>
    h(A.Code, {key: m}, m)));

  const partes = [
    g.doDesenho("four-ways-to-fit", "Four ways to fit", "The map", mapa),
    g.doMd("parts", "01 · Parts", g.blocos(pt.blocos, {legenda: pt.rotulo, troca: b => b === codigoDoCartao ? montador : undefined})),
    g.doMd("slots", "02 · Slots", g.blocos(sl.blocos, {legenda: sl.rotulo, troca: b => b === primeiroSl ? [g.p(b), casca] : undefined})),
    g.doMd("lists-from-data", "03 · Data", [...g.blocos(ld.blocos), trilha]),
    g.doMd("the-render-prop", "04 · render", g.blocos(rp.blocos, {troca: b => b === primeiroRp ? [g.p(b), comparar] : undefined})),
    g.doMd("your-own-components", "Wrap, don't fork"),
    g.doMd("entry-points", "Import by area", g.blocos(ep.blocos, {troca: b => b === codigoEp ? [categorias, g.codigo(b, "composition-importar")]
      : b === pesados ? [g.p(b), modulos] : undefined})),
    g.doMd("next-steps", "Keep going", [g.proximos(g.secao("next-steps"), [["paint-brush", "teal", "Change the look."],
      ["squares-four", "orange", "Browse every component."], ["layout", "pink", "Full screens built from these pieces."]])]),
  ];
  return g.pagina({pecas, partes});
}
