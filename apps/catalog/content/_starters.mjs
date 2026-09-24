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
// `note` é a única concessão declarada: componente cujo conteúdo vive num PORTAL (Dialog,
// Drawer, Tooltip, Popover, os dois menus, NotificationCenter) não existe em página estática —
// renderToStaticMarkup não renderiza portal (medido em 30/07/2026: Dialog aberto = 0 bytes).
// Nesses casos o preview mostra o DISPARADOR real e a nota diz por quê; o código é completo.
import {createElement as h} from "react";
import * as A from "../../../packages/react/dist/index.js";
// Os seis módulos de motor opcional vêm por subpath — o catálogo consome a biblioteca como um
// consumidor consome, e é assim que se descobre se a fronteira da Fase 9 é usável.
import {CodeEditor} from "../../../packages/react/dist/code-editor.js";
import {DataGrid} from "../../../packages/react/dist/data-grid.js";
import {QRCode} from "../../../packages/react/dist/qrcode.js";
import {DependencyGraph} from "../../../packages/react/dist/graph.js";
import {Chart, ChartTooltip, ChartLegend} from "../../../packages/react/dist/chart.js";
import {Calendar} from "../../../packages/react/dist/calendar.js";
import {AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis} from "recharts";

const row = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-3)"};
const stack = {display: "grid", gap: "var(--space-3)"};
const wide = {width: "min(30rem,100%)"};

const PORTAL = "This page is static HTML: the popup lives in a portal and only exists in a real "
  + "React app. The preview shows the trigger; the code is the whole composition.";

// A "foto" das páginas de imagem e de galeria: SVG em data URI, porque o catálogo é gerado e
// commitado e um preview que busca bytes na rede não sobrevive a uma máquina sem rede — nem ao
// `dist == build` da CI. 3:2 de propósito, para as caixas de 16/9 e 1/1 terem o que cortar.
const FOTO = "data:image/svg+xml," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">'
  + '<rect width="300" height="200" fill="#3f3f46"/>'
  + '<circle cx="150" cy="100" r="54" fill="#eab308"/></svg>');

// A capa do `MediaEmbed`: uma cena neutra, sem amarelo. Com a `FOTO` de cima a pastilha de tocar,
// que é amarela, se confundia com o círculo amarelo da foto — a prévia ensinava o caso ruim.
const CAPA = "data:image/svg+xml," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180">'
  + '<rect width="320" height="180" fill="#27272a"/>'
  + '<path d="M0 180 L90 90 L150 140 L220 60 L320 160 L320 180 Z" fill="#52525b"/>'
  + '<circle cx="262" cy="42" r="16" fill="#a1a1aa"/></svg>');

// Série de exemplo das três páginas de Chart. Uma só, para que as três mostrem o mesmo dado
// visto de três jeitos — é o que faz a página da legenda e a do tooltip serem comparáveis.
const MES_FIXO = new Date(2026, 7, 1);
const SERIE = [{month: "Jan", runs: 128, errors: 9}, {month: "Feb", runs: 194, errors: 14},
  {month: "Mar", runs: 173, errors: 6}, {month: "Apr", runs: 241, errors: 11},
  {month: "May", runs: 287, errors: 8}, {month: "Jun", runs: 264, errors: 17}];

export default {
  Accordion: {
    code: `<Accordion items={[
  {id: "ship", title: "How do I ship it?", content: "Install the three packages and import the CSS."},
  {id: "theme", title: "Can I theme it?", content: "Every visual value is a token."},
]} />`,
    render: () => h("div", {style: wide}, h(A.Accordion, {items: [
      {id: "ship", title: "How do I ship it?", content: "Install the three packages and import the CSS."},
      {id: "theme", title: "Can I theme it?", content: "Every visual value is a token."},
    ]})),
  },
  Alert: {
    code: `<Alert variant="info" title="Heads up">Contextual information.</Alert>
<Alert variant="danger" title="Upload failed">The file exceeds 10 MB.</Alert>`,
    render: () => h("div", {style: {...stack, ...wide}},
      h(A.Alert, {variant: "info", title: "Heads up"}, "Contextual information."),
      h(A.Alert, {variant: "danger", title: "Upload failed"}, "The file exceeds 10 MB.")),
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
  },
  AureaProvider: {
    description: "Configuration for the whole app, once: where the icon sprite lives, the "
      + "text direction and the UI strings. It renders no box of its own.",
    code: `<AureaProvider spriteUrl="/assets/aurea-icons.svg" direction="ltr" strings={{close: "Fechar"}}>
  <App />
</AureaProvider>`,
    render: () => h(A.AureaProvider, {spriteUrl: ""}, h("div", {style: row},
      h(A.Icon, {name: "checkmark"}), h("span", null, "Icons resolve through the provider."))),
  },
  Avatar: {
    code: `<Avatar fallback="AU" />
<Avatar fallback="VM" size="lg" />`,
    render: () => h("div", {style: row}, h(A.Avatar, {fallback: "AU"}), h(A.Avatar, {fallback: "VM", size: "lg"})),
  },
  Banner: {
    code: `<Banner variant="success" title="Saved" icon="checkmark" onDismiss={() => setShown(false)}>
  Your changes are live.
</Banner>`,
    render: () => h("div", {style: wide}, h(A.Banner, {variant: "success", title: "Saved",
      icon: "checkmark", onDismiss: () => {}}, "Your changes are live.")),
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
  Card: {
    code: `<Card>
  <strong>A floating surface</strong>
  <p>Radius 22px, one border, no shadow stack.</p>
</Card>`,
    render: () => h("div", {style: wide}, h(A.Card, null, h("div", {style: stack},
      h("strong", null, "A floating surface"),
      h("span", {className: "muted"}, "Radius 22px, one border, no shadow stack.")))),
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
<Image src="/photo.jpg" alt="The same photo, uncropped" ratio="1/1" fit="contain" />`,
    render: () => h("div", {style: {display: "grid", gridTemplateColumns: "1fr 1fr",
      gap: "var(--space-3)", width: "min(30rem,100%)"}},
      h(A.Image, {src: FOTO, alt: "The product, from the front", ratio: "16/9"}),
      h(A.Image, {src: FOTO, alt: "The same photo, uncropped", ratio: "1/1", fit: "contain"})),
  },
  // Gallery (L2). O `zoom` fica LIGADO no exemplo e a nota diz por que o diálogo não aparece: é a
  // mesma concessão declarada dos outros componentes de portal. O selecionado entra para a prévia
  // mostrar a linguagem de "escolhido" que a casa já tem — a mesma da aba ativa.
  Gallery: {
    note: PORTAL,
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
    render: () => h("div", {style: {width: "100%"}},
      h(A.Gallery, {label: "Product photos", selected: "back", zoom: true,
        items: ["Front", "Back", "In use", "Packaging"].map(t =>
          ({id: t.toLowerCase().replace(" ", ""), src: FOTO, alt: t, caption: t}))})),
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
      h(A.SortableList, {label: "Pipeline stages", onReorder: () => {}, items: [
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
      h(A.BlockEditor, {label: "Article", onReorder: () => {}, onRemove: () => {}, blocks: [
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
  // O carrossel (L1) não tem motor, e esta página é a prova: o catálogo é HTML ESTÁTICO, sem uma
  // linha de JavaScript, e a faixa continua rolando com o dedo, com a roda e com as setas do
  // teclado — porque quem rola é o contêiner nativo. O que não funciona aqui são as setas e os
  // pontos, que precisam saber em qual slide se está. É exatamente a fronteira do componente.
  Carousel: {
    description: "Slides that snap, in a native scroll container — no carousel engine. How many "
      + "show at once is CSS (--carousel-slide), not a prop, because that is a layout decision.",
    code: `<Carousel label="Product photos" style={{"--carousel-slide": "50%"}}>
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
  // ── Chart (Lote 3) ────────────────────────────────────────────────────────────────────────
  // `prerender: true` porque o Recharts 3 monta o desenho por EFEITO: renderToStaticMarkup
  // devolve a <div> embrulho e nenhum <svg> (medido em 01/08/2026, 127 bytes). O gerador monta
  // estas três num DOM de verdade e grava o HTML — ver o bloco PRERENDER do build-catalog.
  // O código continua sendo o componente, sem nada de prerender: é assim que o consumidor usa.
  Chart: {
    install: 'import {Chart} from "@aurea-uds/react/chart";',
    code: `<Chart label="Runs per month">
  <AreaChart data={data}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <Area dataKey="runs" name="Runs" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.15} />
  </AreaChart>
</Chart>`,
    prerender: true,
    render: () => h(Chart, {label: "Runs per month"},
      h(AreaChart, {data: SERIE},
        h(CartesianGrid, {vertical: false}),
        h(XAxis, {dataKey: "month", tickLine: false, axisLine: false}),
        h(Area, {dataKey: "runs", name: "Runs", stroke: "var(--chart-2)",
          fill: "var(--chart-2)", fillOpacity: 0.15}))),
  },
  ChartLegend: {
    install: 'import {Chart, ChartLegend} from "@aurea-uds/react/chart";',
    code: `<Chart label="Runs and errors">
  <BarChart data={data}>
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <Bar dataKey="runs" name="Runs" fill="var(--chart-2)" />
    <Bar dataKey="errors" name="Errors" fill="var(--chart-4)" />
    <ChartLegend />
  </BarChart>
</Chart>`,
    prerender: true,
    render: () => h(Chart, {label: "Runs and errors"},
      h(BarChart, {data: SERIE},
        h(XAxis, {dataKey: "month", tickLine: false, axisLine: false}),
        h(Bar, {dataKey: "runs", name: "Runs", fill: "var(--chart-2)"}),
        h(Bar, {dataKey: "errors", name: "Errors", fill: "var(--chart-4)"}),
        h(ChartLegend, {}))),
  },
  ChartTooltip: {
    install: 'import {Chart, ChartTooltip} from "@aurea-uds/react/chart";',
    // `defaultIndex` fixa o ponto ativo. Numa página estática não há ponteiro, e sem ele o
    // tooltip nunca apareceria no preview; num app real ele é opcional.
    description: "The tooltip follows the pointer. Here it is pinned to one point so a static "
      + "page can show it.",
    code: `<Chart label="Runs per month">
  <AreaChart data={data}>
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <Area dataKey="runs" name="Runs" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.15} />
    <ChartTooltip />
  </AreaChart>
</Chart>`,
    prerender: true,
    render: () => h(Chart, {label: "Runs per month"},
      h(AreaChart, {data: SERIE},
        h(XAxis, {dataKey: "month", tickLine: false, axisLine: false}),
        h(Area, {dataKey: "runs", name: "Runs", stroke: "var(--chart-2)",
          fill: "var(--chart-2)", fillOpacity: 0.15}),
        h(ChartTooltip, {defaultIndex: 3}))),
  },
  CodeBlock: {
    code: `<CodeBlock language="tsx" copyable>
  {'import {Button} from "@aurea-uds/react";'}
</CodeBlock>`,
    render: () => h("div", {style: wide}, h(A.CodeBlock, {language: "tsx", copyable: true},
      'import {Button} from "@aurea-uds/react";')),
  },
  CodeEditor: {
    install: 'import {CodeEditor} from "@aurea-uds/react/code-editor";',
    description: "CodeMirror 6 with the Aurea theme. The editor mounts on the client, so a "
      + "static page shows only its host element — the code is what you run.",
    code: `import {javascript} from "@codemirror/lang-javascript";

<CodeEditor
  defaultValue={'const total = items.reduce((n, i) => n + i.price, 0);'}
  extensions={[javascript()]}
  onChange={setSource}
/>`,
    render: () => h("div", {style: wide}, h(CodeEditor,
      {defaultValue: "const total = items.reduce((n, i) => n + i.price, 0);"})),
  },
  Cluster: {
    code: `<Cluster>
  <Badge>one</Badge>
  <Badge>two</Badge>
  <Badge>three</Badge>
</Cluster>`,
    render: () => h(A.Cluster, null, h(A.Badge, null, "one"), h(A.Badge, null, "two"),
      h(A.Badge, null, "three")),
  },
  CommandPalette: {
    note: "This page is static HTML: the list lives in a portal and only exists in a real React "
      + "app, so the preview shows the trigger. Rendering the palette open here would draw an "
      + "input announcing itself as expanded with nothing to point at — a lie the accessibility "
      + "gate caught. The code is the whole composition.",
    description: "The palette with the engine wired up: commands are data, it filters as you "
      + "type, moves with the arrows and runs with Enter. Closing happens BEFORE the command "
      + "runs, so one that navigates does not leave the palette over the new screen. For a "
      + "palette whose chrome you compose yourself, the Shell is next door.",
    install: 'import {CommandPalette} from "@aurea-uds/react";',
    code: `<Button leadingIcon="search" kbd="⌘K" onClick={() => setOpen(true)}>Search</Button>

<CommandPalette open={open} onClose={() => setOpen(false)} items={[
  {id: "button", label: "Go to Button", icon: "arrow--right", run: () => go("/button")},
  {id: "theme", label: "Toggle theme", icon: "asleep", kbd: "⌘T", run: toggleTheme},
]} />`,
    render: () => h(A.Button, {leadingIcon: "search", kbd: "⌘K"}, "Search"),
  },
  CommandPaletteShell: {
    description: "Non-modal by design: you own open and query. For a modal palette, put it "
      + "in a Dialog — declaring aria-modal without focus containment is worse than neither.",
    code: `<CommandPaletteShell open={open} query={query} onQueryChange={setQuery}>
  <div className="menu">
    <button className="menu-item" type="button">Go to Button</button>
    <button className="menu-item" type="button">Toggle theme</button>
  </div>
</CommandPaletteShell>`,
    // A `.command-overlay` é `position:fixed; inset:0; z-index:var(--z-modal)`. Sem um bloco
    // contentor ela resolve contra o VIEWPORT: a prévia cobria a página inteira, com scrim e
    // blur, e como o HTML é estático não havia estado para fechá-la — a página do componente
    // ficava impossível de usar. `transform` cria o bloco contentor (é o que a CSS Transforms
    // §3 manda) e o `fixed` passa a resolver contra esta caixa. É o mesmo motivo do
    // `overflow:hidden`: o overlay tem `padding-top: var(--space-16)` e sem teto ele empurraria
    // a caixa. Nada muda no componente — o que se conserta é a MOLDURA da prévia.
    render: () => h("div", {style: {...wide, position: "relative", height: "17rem",
      overflow: "hidden", transform: "translateZ(0)", borderRadius: "var(--radius-card)"}},
      h(A.CommandPaletteShell,
        {open: true, query: "", onQueryChange: () => {}},
        h("div", {className: "menu"},
          h("button", {className: "menu-item", type: "button"}, "Go to Button"),
          h("button", {className: "menu-item", type: "button"}, "Toggle theme")))),
  },
  ContextMenu: {
    note: PORTAL,
    code: `<ContextMenu label="Row actions" items={[
  {label: "Rename", leadingIcon: "edit"},
  "separator",
  {label: "Delete", leadingIcon: "trash-can"},
]}>
  <Card>Right-click me, or focus and press Shift+F10.</Card>
</ContextMenu>`,
    render: () => h("div", {style: wide}, h(A.ContextMenu, {label: "Row actions", items: [
      {label: "Rename", leadingIcon: "edit"}, "separator",
      {label: "Delete", leadingIcon: "trash-can"},
    ]}, h(A.Card, null, "Right-click me, or focus and press Shift+F10."))),
  },
  DataGrid: {
    install: 'import {DataGrid} from "@aurea-uds/react/data-grid";',
    code: `<DataGrid
  label="Members"
  filterable
  data={[{name: "Messenger", role: "Owner"}, {name: "Analyst", role: "Editor"}]}
  columns={[
    {accessorKey: "name", header: "Name"},
    {accessorKey: "role", header: "Role"},
  ]}
/>`,
    render: () => h("div", {style: wide}, h(DataGrid, {
      label: "Members", filterable: true,
      data: [{name: "Messenger", role: "Owner"}, {name: "Analyst", role: "Editor"},
        {name: "Curator", role: "Viewer"}],
      columns: [{accessorKey: "name", header: "Name"}, {accessorKey: "role", header: "Role"}],
    })),
  },
  DataList: {
    code: `<DataList items={[
  {term: "Plan", value: "Pro"},
  {term: "Seats", value: "12"},
]} />`,
    render: () => h("div", {style: wide}, h(A.DataList, {items: [{term: "Plan", value: "Pro"},
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
  },
  Dialog: {
    note: PORTAL,
    code: `<Button variant="danger" onClick={() => setOpen(true)}>Delete project</Button>

<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Delete project"
  footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
    <Button variant="danger" onClick={remove}>Delete</Button></>}
>
  This removes every component and token in it. It cannot be undone.
</Dialog>`,
    render: () => h(A.Button, {variant: "danger"}, "Delete project"),
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
    note: "This page is static HTML: the alert lives in a portal and only exists in a real React "
      + "app. The preview shows the trigger; the code is the whole composition. The difference "
      + "from Dialog is not how it looks — it is that a click outside cannot answer for the user, "
      + "and the focus opens on the safe button.",
    code: `<Button variant="danger" onClick={() => setOpen(true)}>Delete article</Button>

<ConfirmDialog
  open={open}
  title="Delete this article?"
  description="It leaves the site immediately, and this cannot be undone."
  confirmLabel="Delete"
  destructive
  onConfirm={() => { remove(); setOpen(false); }}
  onCancel={() => setOpen(false)}
/>`,
    render: () => h(A.Button, {variant: "danger"}, "Delete article"),
  },
  Drawer: {
    note: PORTAL,
    code: `<Button onClick={() => setOpen(true)}>Edit member</Button>

<Drawer open={open} onClose={() => setOpen(false)} title="Edit member" side="right">
  <Field label="Name"><Input defaultValue="Analyst" /></Field>
  <Button variant="primary">Save</Button>
</Drawer>`,
    render: () => h(A.Button, null, "Edit member"),
  },
  DropdownMenu: {
    note: PORTAL,
    code: `<DropdownMenu
  label="Record actions"
  trigger={<Button variant="outline" trailingIcon="chevron--down">Actions</Button>}
  items={[
    {label: "Duplicate", leadingIcon: "copy"},
    {label: "Rename", leadingIcon: "edit"},
    "separator",
    {label: "Delete", leadingIcon: "trash-can"},
  ]}
/>`,
    render: () => h(A.DropdownMenu, {label: "Record actions",
      trigger: h(A.Button, {variant: "outline", trailingIcon: "chevron--down"}, "Actions"),
      items: [{label: "Duplicate", leadingIcon: "copy"}, {label: "Rename", leadingIcon: "edit"},
        "separator", {label: "Delete", leadingIcon: "trash-can"}]}),
  },
  EmptyState: {
    code: `<EmptyState
  titleAs="h2"
  title="No results"
  description="Try a different filter."
  action={<Button variant="primary" leadingIcon="add">New project</Button>}
/>`,
    render: () => h("div", {style: wide}, h(A.EmptyState, {titleAs: "h2", title: "No results",
      description: "Try a different filter.",
      action: h(A.Button, {variant: "primary", leadingIcon: "add"}, "New project")})),
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
  },
  Icon: {
    description: "One <svg><use> pointing at the shared Carbon sprite. The sprite URL comes "
      + "from the AureaProvider, never from the call site.",
    code: `<Icon name="search" />
<Icon name="add" size="lg" />
<Icon name="checkmark" size="xl" />`,
    render: () => h("div", {style: row}, h(A.Icon, {name: "search"}),
      h(A.Icon, {name: "add", size: "lg"}), h(A.Icon, {name: "checkmark", size: "xl"})),
  },
  KPI: {
    code: `<KPI label="Revenue" value="$48.2k" trend="+12% vs last month" />`,
    render: () => h("div", {style: wide}, h(A.KPI, {label: "Revenue", value: "$48.2k",
      trend: "+12% vs last month"})),
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
    <div className="media-placeholder"><Icon name="video" /><strong>Standing by</strong></div>
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
        <button className="media-control" type="button" aria-label="Mute"><Icon name="volume--up" /></button>
        <button className="media-control" type="button" aria-label="Full screen"><Icon name="maximize" /></button>
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
            h(A.Icon, {name: "video"}), h("strong", null, "Standing by"))),
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
                h(A.Icon, {name: "volume--up"})),
              h("button", {className: "media-control", type: "button", "aria-label": "Full screen"},
                h(A.Icon, {name: "maximize"}))))))),
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
    note: PORTAL,
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
  },
  Pagination: {
    code: `<Pagination page={page} total={12} onPageChange={setPage} />`,
    render: () => h(A.Pagination, {page: 3, total: 12, onPageChange: () => {}}),
  },
  Popover: {
    note: PORTAL,
    code: `<Popover
  title="Filters"
  trigger={<Button variant="outline">Filters</Button>}
>
  <Checkbox label="Only mine" />
  <Checkbox label="Archived" />
</Popover>`,
    render: () => h(A.Popover, {title: "Filters", trigger: h(A.Button, {variant: "outline"}, "Filters")},
      h(A.Checkbox, {label: "Only mine"})),
  },
  Progress: {
    code: `<Progress value={64} label="Uploading" />`,
    render: () => h("div", {style: wide}, h(A.Progress, {value: 64, label: "Uploading"})),
  },
  // Parte H — a camada operacional (09/08/2026). Os três primeiros da família.
  AgentStatus: {
    install: 'import {AgentStatus} from "@aurea-uds/react";',
    code: `<AgentStatus state="running" />`,
    render: () => h("div", {className: "cluster"},
      h(A.AgentStatus, {key: "i", state: "idle"}),
      h(A.AgentStatus, {key: "r", state: "running"}),
      h(A.AgentStatus, {key: "p", state: "paused"}),
      h(A.AgentStatus, {key: "e", state: "error"}),
      h(A.AgentStatus, {key: "c", state: "completed"})),
  },
  AgentCard: {
    install: 'import {AgentCard} from "@aurea-uds/react";',
    code: `<AgentCard
  name="Curator"
  model="opus-5"
  state="running"
  description="Keeps the reference library tidy."
  capabilities={[{name: "search", icon: "search"}, {name: "summarise"}]}
/>`,
    render: () => h(A.AgentCard, {name: "Curator", model: "opus-5", state: "running",
      description: "Keeps the reference library tidy.",
      capabilities: [{name: "search", icon: "search"}, {name: "summarise"}]}),
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
  DependencyGraph: {
    // Subpath próprio + a folha ESTRUTURAL do motor. Só ela: o `style.css` dele é a
    // identidade deles e não entra (ver a ficha e o REFERENCES.md).
    install: 'import {DependencyGraph} from "@aurea-uds/react/graph";\nimport "@xyflow/react/dist/base.css";',
    // A prévia RENDERIZA, e isso é correção de 09/08/2026. A primeira versão dizia que grafo
    // não cabia em HTML estático e mostrava uma caixa vazia com uma frase dentro — o Victor
    // perguntou "cadê?" e estava certo. A conclusão era minha, não medida: o motor tem caminho
    // de SSR documentado, e são três coisas no componente (`initialWidth`, `initialHeight` e
    // `handles` por nó, mais o viewport inicial no provider). Sem elas o motor não tem o que
    // medir e não desenha; com elas, `renderToStaticMarkup` devolve o grafo inteiro.
    code: `<DependencyGraph
  nodes={[
    {id: "ingest", label: "Ingest", kind: "source"},
    {id: "embed", label: "Embed", kind: "model"},
    {id: "index", label: "Index", kind: "store"},
    {id: "answer", label: "Answer", kind: "agent"},
  ]}
  edges={[
    {from: "ingest", to: "embed"},
    {from: "embed", to: "index"},
    {from: "index", to: "answer"},
  ]}
  onSelect={setSelected}
  selectedId={selected}
/>`,
    // Quatro nos em TRES colunas, e a escolha e medida: o enquadramento nunca amplia, entao a
    // profundidade do exemplo decide a escala. Cinco em cadeia caiam a 0,46 num painel de
    // 635px e o rotulo ficava ilegivel; com tres colunas fica ~0,8, e ainda mostra um RAMO,
    // que e o que um grafo existe para mostrar.
    render: () => h(DependencyGraph, {
      height: "20rem", selectedId: "embed", onSelect: () => {},
      nodes: [
        {id: "ingest", label: "Ingest", kind: "source"},
        {id: "embed", label: "Embed", kind: "model"},
        {id: "index", label: "Index", kind: "store"},
        {id: "answer", label: "Answer", kind: "agent"}],
      edges: [
        {from: "ingest", to: "embed"},
        {from: "embed", to: "index"},
        {from: "embed", to: "answer", animated: true}]}),
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
/>`,
    render: () => h("div", {style: stack},
      h(A.AutomationCard, {name: "Nightly reindex", enabled: true, onToggle: () => {},
        // sem `description`: com a escala de letra da 0.8.8 a linha dela empurrava o segundo
        // cartão 18px para fora da caixa, e o código ao lado nunca a mostrou.
        trigger: "Every day at 02:00 UTC", action: "Run the indexer on changed documents",
        lastRun: "yesterday, 02:00", lastResult: "success"}),
      h(A.AutomationCard, {name: "Purge stale drafts", onToggle: () => {},
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
  QRCode: {
    description: "Three sizes, side by side, because the choice is about SCANNING and not about "
      + "layout: the smaller the box, the fewer pixels each module gets, and below roughly four "
      + "an ordinary phone camera starts to miss it. The preview showed only sm, which is why "
      + "this page used to display a code nobody could read.",
    install: 'import {QRCode} from "@aurea-uds/react/qrcode";',
    code: `<QRCode value="https://aureauds.dev" size="sm" />
<QRCode value="https://aureauds.dev" size="md" />
<QRCode value="https://aureauds.dev" size="lg" />`,
    // `flex-end` alinha os três pela BASE: comparação de tamanho com as caixas centradas na
    // vertical faria o `sm` parecer flutuando, e o que a página compara é altura.
    render: () => h("div", {style: {...row, alignItems: "flex-end", gap: "var(--space-5)"}},
      [["sm", "7.5rem"], ["md", "10rem"], ["lg", "15rem"]].map(([tam, medida]) =>
        h("div", {key: tam, style: {display: "grid", gap: "var(--space-2)", justifyItems: "center"}},
          h(QRCode, {value: "https://aureauds.dev", size: tam}),
          h("span", {className: "muted"}, `${tam} · ${medida}`)))),
  },
  Skeleton: {
    code: `<Skeleton style={{height: "0.875rem", width: "70%"}} />
<Skeleton style={{height: "0.875rem", width: "90%"}} />`,
    render: () => h("div", {style: {...stack, ...wide}},
      h(A.Skeleton, {style: {height: "0.875rem", width: "70%"}}),
      h(A.Skeleton, {style: {height: "0.875rem", width: "90%"}})),
  },
  Stack: {
    code: `<Stack>
  <Card>First</Card>
  <Card>Second</Card>
</Stack>`,
    render: () => h("div", {style: wide}, h(A.Stack, null,
      h(A.Card, null, "First"), h(A.Card, null, "Second"))),
  },
  Table: {
    code: `<Table caption="Team">
  <thead><tr><th>Name</th><th>Role</th></tr></thead>
  <tbody>
    <tr><td>Messenger</td><td>Owner</td></tr>
    <tr><td>Analyst</td><td>Editor</td></tr>
  </tbody>
</Table>`,
    render: () => h("div", {style: wide}, h(A.Table, {caption: "Team"},
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
    render: () => h(A.TableOfContents, {label: "Example sections", current: "preview", items: [
      {id: "preview", label: "Preview"}, {id: "installation", label: "Installation"},
      {id: "reference", label: "Reference"},
    ]}),
  },
  Tabs: {
    code: `<Tabs
  label="Report"
  value={tab}
  onChange={setTab}
  tabs={[
    {id: "overview", label: "Overview", content: "One number per row."},
    {id: "detail", label: "Detail", content: "Every row, unaggregated."},
  ]}
/>`,
    render: () => h("div", {style: wide}, h(A.Tabs, {label: "Report", value: "overview",
      onChange: () => {}, tabs: [
        {id: "overview", label: "Overview", content: "One number per row."},
        {id: "detail", label: "Detail", content: "Every row, unaggregated."},
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
    note: "The row is real; the menus open in a portal, which a static page cannot render.",
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
    <Button>Salvar</Button>
    <Button>Descartar</Button>
  </Toolbar>
</ContainerScope>`,
    // Dois contêineres lado a lado, MESMA viewport: é o que a primitive existe para permitir, e
    // ver os dois juntos é o que explica a diferença para uma media query.
    render: () => h("div", {style: {display: "flex", flexWrap: "wrap", gap: "var(--space-4)", alignItems: "flex-start"}},
      ...[220, 480].map((w) => h(A.ContainerScope, {key: w, style: {inlineSize: w, padding: "var(--space-3)",
        border: "1px dashed var(--border)", borderRadius: "var(--radius-lg)"}},
        h(A.Toolbar, {label: `Ações ${w}`, orientation: {base: "vertical", container: {sm: "horizontal"}}},
          h(A.Button, null, "Salvar"), h(A.Button, null, "Descartar"))))),
  },

  useValorResponsivo: {
    code: `const orientacao = useValorResponsivo(
  {base: "vertical", container: {sm: "horizontal"}},
  "horizontal",
  ancora,
);`,
    // O hook resolve; quem mostra o resultado é o componente que o consome. O preview mostra o
    // efeito, que é o que se pode ver — o valor em si é um string.
    render: () => h("div", {style: {display: "flex", flexWrap: "wrap", gap: "var(--space-4)", alignItems: "flex-start"}},
      ...[220, 480].map((w) => h(A.ContainerScope, {key: w, style: {inlineSize: w, padding: "var(--space-3)",
        border: "1px dashed var(--border)", borderRadius: "var(--radius-lg)"}},
        h(A.ToggleGroup, {label: `Alinhar ${w}`, orientation: {base: "vertical", container: {sm: "horizontal"}}},
          h(A.Toggle, {value: "e"}, "Esquerda"), h(A.Toggle, {value: "c"}, "Centro"))))),
  },

  // ── Os três hooks que o merge de 28/08/2026 trouxe da outra linhagem ────────────────────────
  useAureaTheme: {
    code: `const {theme, density, setTheme, setDensity, toggleTheme} = useAureaTheme();

// Lê direto do <html> e acompanha quem mudar o atributo por fora.
// Use este quando a APLICAÇÃO é dona do data-theme; use useTheme quando
// quem guarda a escolha é o AureaProvider.
<IconButton
  icon={theme === "light" ? "moon" : "light"}
  label={theme === "light" ? "Switch to dark" : "Switch to light"}
  onClick={toggleTheme}
/>`,
    render: () => h(A.IconButton, {icon: "light", label: "Switch to dark"}),
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
  icon={theme === "light" ? "moon" : "light"}
  label={theme === "light" ? "Switch to dark" : "Switch to light"}
  onClick={toggleTheme}
/>`,
    // O rótulo diz a AÇÃO, não o estado: um botão rotulado "Dark" não diz se liga ou desliga,
    // e um leitor de tela anuncia exatamente o rótulo. É a mesma regra do `passwordShow`.
    note: "Reads and writes data-theme on the document root, so the whole page follows. A static page has no provider, so the button here is only the shape.",
    render: () => h(A.IconButton, {icon: "light", label: "Switch to light"}),
  },

  useDensity: {
    code: `const {density, setDensity} = useDensity();

<SegmentedControl
  value={density ?? "comfortable"}
  onChange={setDensity}
  items={[
    {value: "compact", label: "Compact"},
    {value: "comfortable", label: "Comfortable"},
    {value: "spacious", label: "Spacious"},
  ]}
/>`,
    note: "Density is the third axis of the system, next to theme and direction: it changes control height, row height and padding across every component at once.",
    render: () => h(A.SegmentedControl, {value: "comfortable", onChange: () => {}, items: [
      {value: "compact", label: "Compact"},
      {value: "comfortable", label: "Comfortable"},
      {value: "spacious", label: "Spacious"}]}),
  },

  useToast: {
    code: `const toast = useToast();

<Button onClick={() => toast.add({title: "Saved", type: "success"})}>
  Save
</Button>`,
    note: "The toast list is mounted by AureaProvider and lives in a portal, which a static page cannot render. The button is real; the toast needs the runtime.",
    render: () => h(A.Button, null, "Save"),
  },

  useAureaStrings: {
    code: `const s = useAureaStrings();

<p>{s.loading}</p>   // "Loading" — or your own dictionary`,
    note: "Reads the dictionary the provider is using. Nothing renders on its own.",
    render: null,
  },

  useSpriteUrl: {
    code: `const url = useSpriteUrl();

<svg><use href={\`\${url}#chevron--down\`} /></svg>`,
    note: "Reads where the provider is loading glyphs from. Nothing renders on its own.",
    render: null,
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
    code: `<InputGroupAddon side="start" layout="inline"><Icon name="search" /></InputGroupAddon>
<InputGroupAddon side="end" layout="inline">.00</InputGroupAddon>`,
    render: () => h("div", {style: {width: "min(360px, 100%)"}},
      h(A.InputGroup, null,
        h(A.InputGroupAddon, null, h(A.Icon, {name: "search"})),
        h(A.Input, {placeholder: "Search", "aria-label": "Search"}),
        h(A.InputGroupAddon, {side: "end", layout: "inline"}, "\u2318K"))),
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
  },

  Collapsible: {
    code: `<Collapsible trigger="Advanced options" defaultOpen>
  <p>Everything here is optional.</p>
</Collapsible>`,
    render: () => h("div", {style: {width: "min(420px, 100%)"}},
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
  },

  Spinner: {
    code: `<Spinner size="sm" />
<Spinner label="Loading results" />
<Spinner size="lg" />`,
    render: () => h("div", {style: row},
      h(A.Spinner, {size: "sm"}),
      h(A.Spinner, {label: "Loading results"}),
      h(A.Spinner, {size: "lg"})),
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
  },
  OTPField: {
    code: `<OTPField length={6} label="Verification code" />`,
    render: () => h(A.OTPField, {length: 6, label: "Verification code"}),
  },
  // O disparador é um `Button variant="link"`, não um `<a>` cru: um link sem pele da Aurea
  // reprovou contraste AA no tema claro dentro do painel de demo — pego pelo axe da varredura.
  // É o mesmo achado da Fase 7 visto de novo: link solto não é componente do sistema.
  HoverCard: {
    note: PORTAL,
    code: `<HoverCard trigger={<Button variant="link" href="#curator">Curator</Button>}>
  <strong>Curator</strong>
  <p className="muted">Reviews and files what comes in.</p>
</HoverCard>`,
    render: () => h(A.Button, {variant: "link", href: "#curator"}, "Curator"),
  },
  Timeline: {
    code: `<Timeline items={[
  {title: "Created", description: "by Curator", time: "09:00"},
  {title: "Shipped", time: "14:20"},
]} />`,
    render: () => h("div", {style: wide}, h(A.Timeline, {items: [
      {title: "Created", description: "by Curator", time: "09:00"},
      {title: "Shipped", time: "14:20"},
    ]})),
  },
  Tooltip: {
    note: PORTAL,
    code: `<Tooltip content="Copy to clipboard" side="top">
  <IconButton icon="copy" label="Copy" />
</Tooltip>`,
    render: () => h(A.Tooltip, {content: "Copy to clipboard"},
      h(A.IconButton, {icon: "copy", label: "Copy"})),
  },
  Topbar: {
    description: "The <header> the AppShell composes, and where the brand lives. Three skins: "
      + "floating, flush and pill.",
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
    render: () => h("div", {style: wide}, h(A.TreeView, {label: "Files",
      defaultExpandedIds: ["src"], items: [
        {id: "src", label: "src", children: [{id: "index", label: "index.tsx"},
          {id: "tokens", label: "tokens.css"}]},
        {id: "readme", label: "README.md"},
      ]})),
  },
};
