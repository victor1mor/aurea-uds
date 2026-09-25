import {test, expect} from "@playwright/test";
import {createElement as h, type CSSProperties} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import * as A from "../../packages/react/dist/index.js";
// Subpath próprio: o Calendar não está no barril principal porque carrega peer opcional.
import * as A2 from "../../packages/react/dist/calendar.js";
// Os demais de motor opcional, pelo mesmo motivo (check 19). Dizia "os outros três" e havia
// quatro logo abaixo: contagem à mão que venceu quando a fronteira cresceu. O Chart fica de fora
// desta lista de propósito — ele entra mais adiante como MARKUP, e a razão está escrita lá.
import * as A3 from "../../packages/react/dist/data-grid.js";
import * as A4 from "../../packages/react/dist/qrcode.js";
import * as A5 from "../../packages/react/dist/code-editor.js";
import * as A6 from "../../packages/react/dist/graph.js";

// PELE. Renderiza os componentes com SÓ o core — sem o chrome do catálogo, sem o docs.css —
// e mede. É o mundo do consumidor.
//
// Existe por causa do achado A13 (Fase 7): nove classes que o pacote React emite não tinham
// regra em CSS nenhum, e o modo de falha era o pior possível para um design system —
// `.grid` parecia pronta em toda página do NOSSO catálogo porque o chrome do gerador a
// redefinia, e chegava `display:block` no consumidor. Medido antes da Fase 11, com só o core:
//   .grid          display:block      (o Grid não era grid: empilhava)
//   .timeline-dot  0×0, display:inline (a linha do tempo tinha trilho e nenhuma marca)
//   .command-overlay static            (o overlay não cobria nada)
//   .empty-state   block, padding 0, alinhado à esquerda
//   .data-list     <dl> cru, com o recuo de 40px que o UA dá ao <dd>
//
// O check 18 do validate.py é o irmão deste teste e olha NOME: classe emitida tem de ter
// regra. Ele não olha EFEITO — uma regra vazia `.grid{}` passaria nele. Quem cobra o efeito
// é este arquivo. Compara estilo computado, não pixel, então vale como gate duro no Linux.

// Mês E "hoje" fixos: `data-today` cairia numa célula diferente a cada dia, e o dia 25 que
// as asserções usam como "dia comum" poderia virar hoje sem aviso.
const MES_FIXO = new Date(2026, 7, 1);

// A "foto" das medições de imagem: 3:2 em data URI, para as caixas de 16/9 e 1/1 terem o que
// cortar, e sem uma requisição de rede — o gate não pode depender de bytes que podem não chegar.
const FOTO_TESTE = "data:image/svg+xml," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">'
  + '<rect width="300" height="200" fill="#3f3f46"/></svg>');

const P = (kids: unknown) =>
  h(A.AureaProvider, {spriteUrl: "/packages/icons/dist/aurea-icons.svg"}, kids as never);

const CORPO = renderToStaticMarkup(P(h("div", null,
  h(A.EmptyState, {key: "e", title: "No results", description: "Try a different search term."}),
  h(A.DataList, {key: "d", items: [{term: "Status", value: "Active"}, {term: "Owner", value: "Messenger"}]}),
  h(A.Accordion, {key: "a", items: [
    {id: "a", title: "First section", content: "Body of the first section."},
    {id: "b", title: "Second section", content: "Body of the second section."}]}),
  h(A.Grid, {key: "g"}, h(A.Card, {key: 1}, "One"), h(A.Card, {key: 2}, "Two"), h(A.Card, {key: 3}, "Three")),
  h(A.Timeline, {key: "t", items: [
    {title: "Created", description: "Draft opened", time: "10:02"},  // com descrição
    {title: "Reviewed", time: "11:40"}]}),                           // sem — e tem de medir igual
  h(A.CommandPaletteShell, {key: "c", open: true, query: "", onQueryChange: () => {}},
    h("div", {className: "menu"}, h("button", {className: "menu-item", type: "button"}, "Go to Button"))),
  // ── Lote 1 do BUILDING.md ────────────────────────────────────────────────────────────
  h(A.Toggle, {key: "t1", icon: "favorite", label: "Favourite", defaultPressed: true}),
  h(A.Toggle, {key: "t2", icon: "pin", label: "Pin"}),
  h("div", {key: "sp"},
    h(A.Spinner, {}), h(A.Spinner, {size: "md"}), h(A.Spinner, {size: "lg"})),
  h(A.NumberField, {key: "nf", defaultValue: 1, min: 0, max: 9, label: "Quantity"}),
  h(A.OTPField, {key: "otp", length: 4, label: "Code"}),
  // HoverCard vive num PORTAL e só existe aberto — `renderToStaticMarkup` não renderiza portal
  // (medido na Fase 7). O que este arquivo mede é a REGRA, não a montagem do componente, então
  // a superfície entra como markup direto. O comportamento de abrir é do motor e tem teste
  // próprio; o que é nosso aqui é a pele.
  h("div", {key: "hc", className: "popover hover-card"}, "Preview"),
  // ── Lote 2 ───────────────────────────────────────────────────────────────────────────
  // A imagem é 3:1 de propósito: foto de perfil raramente vem quadrada, e era assim que ela
  // vazava da caixa redonda. SVG em data URI para não depender de rede.
  h(A.Avatar, {key: "av", src: "data:image/svg+xml," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100"><rect width="300" height="100" fill="#e11d48"/></svg>'),
    alt: "larga"}),
  h(A.AvatarGroup, {key: "ag", max: 2, total: 9, label: "Reviewers"},
    h(A.Avatar, {key: 1, fallback: "A"}), h(A.Avatar, {key: 2, fallback: "B"}),
    h(A.Avatar, {key: 3, fallback: "C"})),
  h(A.Stepper, {key: "st", label: "Publishing", items: [
    {label: "Configure", state: "done"}, {label: "Permissions", state: "active"},
    {label: "Validation", state: "error"}, {label: "Publish"}]}),
  // ── Lote 3 ───────────────────────────────────────────────────────────────────────────
  // Chart, ChartTooltip e ChartLegend entram como MARKUP, pelo mesmo motivo do HoverCard e
  // com uma razão a mais: o Recharts 3 monta o desenho por EFEITO, e `renderToStaticMarkup`
  // devolve a <div> embrulho sem <svg> nenhum (medido em 01/08/2026: 127 bytes). O que este
  // arquivo mede é a REGRA, não a montagem — e a regra da pele do gráfico é escrita contra
  // ELEMENTO (`.chart svg line`, `.chart svg text`), nunca contra `.recharts-*`, porque nome
  // de classe de terceiro no core reprovaria o check 15.
  //
  // O <svg> abaixo é o esqueleto medido da saída real do motor: <line> para grade, eixo e
  // marca de escala (20 num gráfico de linha com grade e dois eixos), <text> para rótulo de
  // escala (9), e o `stroke`/`fill` vindo como ATRIBUTO DE APRESENTAÇÃO — que é o ponto: se
  // a regra não existir, o cinza #ccc/#666 do motor fica, e o gráfico não é da Aurea.
  h("div", {key: "ch", className: "chart"},
    h("svg", {viewBox: "0 0 300 120"},
      h("line", {x1: 10, x2: 290, y1: 30, y2: 30, stroke: "#ccc"}),
      h("text", {x: 10, y: 110, fill: "#666", fontSize: 12}, "Jan"))),
  // O conteúdo do tooltip e da legenda, copiado da montagem real (apps/catalog/chart*.html).
  h("div", {key: "ct", className: "tooltip chart-tooltip"},
    h("strong", null, "Apr"),
    h("span", {className: "chart-key"},
      h("i", {style: {background: "var(--chart-2)"}}), "Runs", h("b", null, "241"))),
  h("ul", {key: "cl", className: "chart-legend"},
    h("li", {className: "chart-key"}, h("i", {style: {background: "var(--chart-2)"}}), "Runs"),
    h("li", {className: "chart-key"}, h("i", {style: {background: "var(--chart-4)"}}), "Errors")),
  // ── Lote 4 ───────────────────────────────────────────────────────────────────────────
  // O Calendar entra RENDERIZADO, ao contrário do Chart: o react-day-picker desenha no
  // servidor (medido em 01/08/2026 — 8618 bytes e <table> de verdade). Mês fixo para o
  // teste não depender do relógio.
  h(A2.Calendar, {key: "cal", mode: "range", defaultMonth: MES_FIXO, today: MES_FIXO,
    selected: {from: new Date(2026, 7, 12), to: new Date(2026, 7, 18)},
    disabled: {before: new Date(2026, 7, 6)}}),
  // O SEGUNDO existe só para produzir dia escondido. Com `showOutsideDays` (nosso default)
  // não há nenhum, e a asserção de `[data-hidden]` seria um laço sobre lista vazia — regra
  // sem prova, que é o defeito que este arquivo inteiro existe para não deixar passar.
  h("div", {key: "cal2", className: "calendar-sem-vizinhos"},
    h(A2.Calendar, {mode: "single", defaultMonth: MES_FIXO, today: MES_FIXO, showOutsideDays: false})),
  // ── Parte B do PLANO-1.0, item B1 ────────────────────────────────────────────────────
  // A Sidebar entra RENDERIZADA e com `items`. Até 06/08/2026 ela era um <aside> vazio: não
  // havia pele de lista para medir porque a lista não existia — quem desenhava item, grupo e
  // item atual era o chrome do catálogo. São DUAS cópias porque o trilho recolhido é o estado
  // em que a regra faz mais, e é o único jeito de provar o que ele promete: o rótulo sai da
  // TELA sem sair do DOM.
  // Os dois vivem dentro de `.app-shell` porque o trilho não é só a lateral: ele encolhe a
  // COLUNA do grid, e a coluna é do shell. O primeiro shell reproduz o defeito medido em
  // 06/08/2026 — a regra nasceu `:has(.sidebar-collapsed)`, sem `>`, e a página do catálogo
  // que mostra uma lateral recolhida como EXEMPLO, dentro do <main>, recolhia a lateral de
  // verdade do documento. O segundo prova que a regra continua funcionando de propósito.
  h("div", {key: "shellA", className: "app-shell"},
    h(A.Sidebar, {label: "Skin", current: "inbox", items: [
      {id: "mail", label: "Mail", items: [
        {id: "inbox", label: "Inbox", icon: "email", href: "#", items: [
          {id: "unread", label: "Unread", href: "#"}]},
        {id: "archive", label: "Archive", icon: "archive", href: "#"}]}]}),
    h("main", {className: "content"},
      h(A.Sidebar, {label: "Skin rail", collapsed: true, items: [
        {id: "inbox", label: "Inbox", icon: "email", href: "#"}]}))),
  h("div", {key: "shellB", className: "app-shell"},
    h(A.Sidebar, {label: "Skin rail direto", collapsed: true, items: [
      {id: "inbox", label: "Inbox", icon: "email", href: "#"}]})),
  // A VARIANTE RENTE entra aqui para a prop não virar enfeite: se `floating` e `flush`
  // desenharem igual, a prop é decoração — é a mesma regra que as variantes da barra inferior
  // pagaram. Rótulo PRÓPRIO: dois landmarks de navegação com o mesmo nome reprovam em
  // `landmark-unique`, e o default de todos é o mesmo.
  h("div", {key: "shellC", className: "app-shell"},
    h(A.Sidebar, {label: "Skin rente", variant: "flush", current: "inbox", items: [
      {id: "inbox", label: "Inbox", icon: "email", href: "#"}]})),
  // ── A barra inferior (17/08/2026) ────────────────────────────────────────────────────
  // Ela usa o MESMO tipo do Sidebar, então o que a pele tem de provar é a diferença: o item
  // vira COLUNA (ícone sobre rótulo) e os itens dividem a largura. Sem essas duas regras, o
  // que sai é uma lateral deitada — que passa no olho de longe e não é uma barra.
  // O acessório é um `<Badge>` DE VERDADE, e isso é o item do teste. Ele era a string "3", que
  // não tem a caixa de 24px do componente — e por isso o gate de "o contador não cobre o rótulo"
  // passou verde com o defeito na tela. Fixture mais fraco que o uso real é gate que mente.
  h(A.BottomNav, {key: "bnav", indicator: "circle", label: "Skin bottom", current: "rides", items: [
    {id: "home", label: "Home", icon: "home", href: "#"},
    {id: "rides", label: "Rides", icon: "meter", href: "#",
      badge: h(A.Badge, {size: "xs", variant: "danger", emphasis: "solid"}, "3")},
    {id: "me", label: "Profile", icon: "user", href: "#"}]}),
  // A `flat` é o padrão, e é a de 3 dos 4 aplicativos medidos. O item do meio leva o contador
  // como PONTO (`badge: ""`), que é como YouTube e WhatsApp dizem "tem coisa nova".
  h(A.BottomNav, {key: "bnavf", variant: "edge", label: "Skin bottom edge", current: "rides",
    items: [{id: "home", label: "Home", icon: "home", href: "#"},
      {id: "rides", label: "Rides", icon: "meter", href: "#", badge: ""},
      {id: "me", label: "Profile", icon: "user", href: "#"}]}),
  // As duas variantes de pílula. Elas entram porque a promessa delas é de PELE: barra em pílula
  // e item atual PREENCHIDO. Sem regra, as três variantes desenham igual e a prop vira enfeite —
  // que é exatamente o modo de falha que este arquivo existe para pegar.
  // O acessório vai no item ATUAL de propósito: é ali que ele cai em cima do amarelo, e é o
  // caso que o Victor achou invisível em 17/08/2026.
  h(A.BottomNav, {key: "bnavp", indicator: "pill", label: "Skin bottom pill", current: "rides",
    items: [{id: "home", label: "Home", icon: "home", href: "#"},
      {id: "rides", label: "Rides", icon: "meter", href: "#",
        badge: h(A.Badge, {size: "xs", variant: "danger", emphasis: "solid"}, "3")}]}),
  h(A.BottomNav, {key: "bnavd", indicator: "circle-bold", label: "Skin bottom bold", current: "rides",
    items: [{id: "home", label: "Home", icon: "home", href: "#"},
      {id: "rides", label: "Rides", icon: "meter", href: "#",
        badge: h(A.Badge, {size: "xs", variant: "danger", emphasis: "solid"}, "3")}]}),
  // ── A RÉGUA (18/08/2026) ─────────────────────────────────────────────────────────────
  // DOIS casos de vertical, e o segundo é o que engana. No flex row ela tem `align-self:stretch` e
  // estica pela altura dos IRMÃOS — tem altura com ou sem piso, então esse caso NÃO prova o piso.
  // Provei isso removendo o piso: a trava passou verde. O caso que prova é a vertical num pai que
  // NÃO é flex, onde `align-self` não faz nada e `height:auto` num `<hr>` vazio dá ZERO. É o erro
  // que o consumidor comete sem perceber, e é a terceira vez hoje que fixture no caso fácil mente.
  h("div", {key: "sepbox", className: "skin-sep"},
    h(A.Separator, {key: "seph"}),
    h("div", {key: "seprow", className: "skin-sep-row",
      style: {display: "flex", alignItems: "center", gap: "8px"}},
      h("span", {key: "a"}, "um"),
      h(A.Separator, {key: "sepv", orientation: "vertical"}),
      h("span", {key: "b"}, "outro")),
    h("div", {key: "sepblock", className: "skin-sep-block"},
      h(A.Separator, {key: "sepvb", orientation: "vertical"}))),
  // ── A LINHA DE LISTA TOCÁVEL (18/08/2026) ────────────────────────────────────────────
  // O fixture é DELIBERADAMENTE do tamanho do uso real, e a lição é de hoje mesmo: a trava da
  // `pill` passou verde com o defeito reposto porque media uma barra de dois itens onde a real
  // tem quatro. Aqui isso significa: rótulo LONGO (é o que prova quem encolhe), valor que é um
  // `<Badge>` de verdade (a string não tem a caixa do componente), e uma linha inerte.
  // O `Card` por fora NÃO é enfeite do fixture: é a composição documentada, e é ela que dispara
  // `.card:has(> .nav-list)`. Sem o Card aqui, a regra do painel apertado não é exercida e a
  // trava abaixo passaria de graça — que é o modo de falha que este arquivo já pagou duas vezes.
  h("div", {key: "navlistbox", className: "skin-navlist", style: {width: "18rem"}},
   h(A.Card, null,
    h(A.NavList, {items: [
      {id: "profile", label: "Profile", description: "Name, photo, handle", icon: "user", href: "#"},
      // O rótulo longo é o item do teste: com o `min-width:0` ausente ele empurraria o valor e a
      // seta para fora da linha em vez de reticenciar.
      {id: "alerts", label: "Notifications and delivery preferences", description: "Push, email",
        icon: "notification", value: h(A.Badge, {size: "xs"}, "4"), href: "#"},
      {id: "beta", label: "Beta features", description: "Not on your plan", icon: "flash",
        disabled: true}]}))),
  // O DEFEITO ANTIGO que a barra inferior desenterrou: acessório sobre a MARCA. Um badge
  // primário dentro de um botão primário media contraste 1 (amarelo sobre amarelo, invisível)
  // e nenhum gate via — o axe do catalog-sweep também não, porque página nenhuma compõe os
  // dois. Este fixture existe para que a composição PASSE a existir num lugar medido.
  h("p", {key: "bpb", className: "cluster"},
    h(A.Button, {variant: "primary"}, "Buy ", h(A.Badge, {variant: "primary"}, "3"))),
  // ── O BADGE REESCRITO (17/08/2026) ───────────────────────────────────────────────────
  // As três ênfases nas seis variantes, os três tamanhos, e o SOBREPOSTO nas duas formas de
  // canto. O que se mede: contraste de texto em todas as combinações, o anel de recorte, e a
  // diferença entre o canto quadrado e o redondo — que é a razão de `anchorShape` existir.
  h("div", {key: "bdg", id: "badge-lab"},
    ...(["neutral", "primary", "info", "success", "warning", "danger"] as const).flatMap(v =>
      (["soft", "solid", "outline"] as const).map(e =>
        h(A.Badge, {key: `${v}-${e}`, variant: v, emphasis: e, className: `lab-${v}-${e}`}, "9"))),
    ...(["sm", "md", "lg"] as const).map(s =>
      h(A.Badge, {key: `s-${s}`, size: s, className: `lab-size-${s}`}, "x")),
    h(A.Badge, {key: "dot", dot: true, className: "lab-dot"}, "Online"),
    h(A.Badge, {key: "sq", anchor: "top-end", count: 8, emphasis: "solid", variant: "danger",
      className: "lab-square"}, h("span", {className: "lab-alvo"}, "bell")),
    h(A.Badge, {key: "ci", anchor: "top-end", anchorShape: "circle", count: 8, emphasis: "solid",
      variant: "danger", className: "lab-circle"}, h("span", {className: "lab-alvo"}, "bell"))),
  // ══ Parte E do PLANO-1.0, item E13 — os 53 que faltavam ═══════════════════════════════
  // Até 07/08/2026 este arquivo cobria 23 componentes e o check 24 valia só para os 13 da
  // lista. Os 53 abaixo entram para que a trava possa valer para os 76 (item E15).
  //
  // O que a MEDIÇÃO do passo 1 disse, antes de escrever qualquer fixture — e ela mudou três
  // decisões, então não era formalidade:
  //   • 42 renderizam inteiros no servidor e entram como COMPONENTE;
  //   • 6 são portal e `renderToStaticMarkup` devolve só o gatilho (Dialog e Drawer devolvem
  //     ZERO bytes). Entram como MARCAÇÃO, no precedente do HoverCard: o que este arquivo mede
  //     é a REGRA, e abrir o popup é do motor, que tem teste próprio;
  //   • o `ToolbarGroup` LANÇA fora de um Toolbar ("ToolbarRootContext is missing") — vai
  //     aninhado, que é o único jeito que existe de usá-lo.
  h(A.Stack, {key: "e13"},
    // ── Feedback ───────────────────────────────────────────────────────────────────────
    h(A.Alert, {key: "al", variant: "warning", title: "Heads up"}, "Body of the alert."),
    h(A.Badge, {key: "bd", variant: "success"}, "Stable"),
    h(A.Banner, {key: "bn", variant: "danger", title: "Down", icon: "warning", onDismiss: () => {}}, "Body."),
    h(A.Skeleton, {key: "sk", style: {width: 160, height: 12}}),
    h(A.Progress, {key: "pg", value: 64, label: "Sending"}),
    // ── Layout e primitivas ────────────────────────────────────────────────────────────
    h(A.Cluster, {key: "cl2"}, h(A.Badge, {key: 1}, "um"), h(A.Badge, {key: 2}, "dois")),
    h(A.KPI, {key: "kpi", label: "Runs", value: "241", trend: "+12%"}),
    h(A.Icon, {key: "ic", name: "add", size: "lg"}),
    h(A.Kbd, {key: "kb"}, "Ctrl"),
    // ── Formulários ────────────────────────────────────────────────────────────────────
    h(A.Field, {key: "fd", label: "Name", hint: "As it appears on the document", error: "Required"},
      h(A.Input, {})),
    h(A.Textarea, {key: "ta", defaultValue: "linha"}),
    h(A.Checkbox, {key: "ck", label: "I agree", defaultChecked: true}),
    h(A.Radio, {key: "rd", label: "One", name: "skin-g"}),
    h(A.Switch, {key: "sw", label: "Active", defaultChecked: true}),
    h(A.Range, {key: "rg", defaultValue: 40}),
    h(A.SearchField, {key: "sf", defaultValue: "query"}),
    h(A.Select, {key: "sl", label: "Level", items: [{value: "a", label: "A"}], defaultValue: "a"}),
    h(A.SegmentedControl, {key: "sg", label: "View", defaultValue: "a",
      items: [{value: "a", label: "List"}, {value: "b", label: "Grid"}]}),
    h(A.Combobox, {key: "cb", label: "Owner", items: [{value: "a", label: "A"}]}),
    h(A.MultiCombobox, {key: "mc", label: "Tags", items: [{value: "a", label: "A"}], defaultValue: ["a"]}),
    h(A.FileInput, {key: "fi", label: "Files"}),
    // ── Ações ──────────────────────────────────────────────────────────────────────────
    h(A.IconButton, {key: "ib", icon: "add", label: "Add"}),
    h(A.ButtonGroup, {key: "bg"}, h(A.Button, {key: 1}, "One"), h(A.Button, {key: 2}, "Two")),
    h(A.Toolbar, {key: "tb", label: "Skin"},
      h(A.ToolbarGroup, {key: "g", label: "Edit"},
        h(A.ToolbarButton, {key: 1, icon: "add", label: "Add"}),
        h(A.ToolbarButton, {key: 2, icon: "copy", label: "Copy"})),
      h(A.ToolbarSeparator, {key: "s"}),
      h(A.ToolbarButton, {key: 3, icon: "trash-can", label: "Delete"})),
    h(A.Pagination, {key: "pn", page: 2, total: 5, onPageChange: () => {}}),
    // ── Dados e navegação ──────────────────────────────────────────────────────────────
    h(A.Table, {key: "tbl", caption: "Runs"},
      h("thead", null, h("tr", null, h("th", null, "Name"), h("th", null, "Value"))),
      h("tbody", null, h("tr", null, h("td", null, "alpha"), h("td", null, "12")))),
    h(A.Breadcrumb, {key: "bc", items: [{label: "Home", href: "#"}, {label: "Here"}]}),
    h(A.Tabs, {key: "tabs", value: "a", onChange: () => {},
      tabs: [{id: "a", label: "First", content: "Panel A"}, {id: "b", label: "Second", content: "Panel B"}]}),
    h(A.TableOfContents, {key: "toc", current: "a",
      items: [{id: "a", label: "Top"}, {id: "b", label: "Nested", sub: true}]}),
    h(A.TreeView, {key: "tv", defaultExpandedIds: ["a"],
      items: [{id: "a", label: "Folder", icon: "folder", children: [{id: "b", label: "Leaf"}]}]}),
    h(A.Topbar, {key: "tp", brand: "Aurea"}, h(A.Badge, null, "beta")),
    // ── Código, comunicação e mídia ────────────────────────────────────────────────────
    h(A.CodeBlock, {key: "cbk", language: "ts", copyable: true}, "const a = 1;"),
    h(A.LogStream, {key: "ls", lines: [
      {time: "10:02", level: "error", text: "failed"}, {time: "10:03", text: "ok"}]}),
    h(A.MessageList, {key: "ml", messages: [
      {id: "1", body: "Hello", author: "Analyst", time: "10:02", avatar: {fallback: "A"},
       status: {label: "read", variant: "success"}}]}),
    h(A.MessageComposer, {key: "mcp", onSend: () => {}, placeholder: "Message", icon: "chat"}),
    h(A.MediaPlayerShell, {key: "mps"}, h("span", null, "custom controls")),
    h(A.MediaPlayer, {key: "mp", src: "/x.mp4", title: "Clip", subtitle: "1080p"}),
    h(A.NotificationCenter, {key: "nc", items: [
      {id: "1", title: "Run finished", time: "10:02", group: "Today"}]}),
    // ── Subpath próprio: dependência opcional pesada ───────────────────────────────────
    h(A3.DataGrid, {key: "dg", filterable: true, selectable: true, pageSize: 1,
      getRowId: (x: {n: string}) => x.n, data: [{n: "alpha", v: 12}, {n: "beta", v: 7}],
      columns: [{accessorKey: "n", header: "Name"}, {accessorKey: "v", header: "Value"}],
      // F3: a linha de filtro. Um campo de texto e uma faceta — a faceta é um
      // MultiCombobox, então aqui sai só o campo (o popup é portal e não monta).
      filters: [{column: "n", label: "Name"}, {column: "v", label: "Value", facet: true}],
      // F5: a barra de lote só existe COM seleção, e `renderToStaticMarkup` renderiza o
      // estado inicial — então a seleção entra CONTROLADA. É render de verdade, não
      // marcação escrita à mão como a dos seis de portal.
      rowSelection: {alpha: true}, hideableColumns: true, resizableColumns: true,
      bulkActions: [{id: "arch", label: "Archive", icon: "archive", onAction: () => {}}]}),
    // F6: uma SEGUNDA grade, com cabeçalho fixo e linhas o bastante para rolar. Só
    // com teto de altura a `.table-wrap` rola por dentro — e é ela, não a janela,
    // que ancora o sticky, porque `overflow:auto` cria o contêiner de rolagem.
    h("div", {key: "dgs", style: {"--datagrid-max-h": "120px"} as never},
      h(A3.DataGrid, {stickyHeader: true,
        data: [1, 2, 3, 4, 5, 6, 7, 8].map(i => ({n: "row " + i, v: i})),
        columns: [{accessorKey: "n", header: "Name"}, {accessorKey: "v", header: "Value"}],
        filters: [{column: "n", label: "Name"}]})),
    // F8: carregando SEM dado — é o único estado que desenha caixa nova (o esqueleto).
    h(A3.DataGrid, {key: "dgl", state: "loading", pageSize: 2, data: [] as Array<{n: string}>,
      columns: [{accessorKey: "n", header: "Name"}]}),
    // F9: o painel só existe aberto — entra CONTROLADO, como a seleção do F5.
    h(A3.DataGrid, {key: "dgd", getRowId: (x: {n: string}) => x.n, detailRowId: "alpha",
      data: [{n: "alpha", v: 1}], columns: [{accessorKey: "n", header: "Name"}],
      renderDetail: () => h("p", null, "Detail body")}),
    // ── Parte H, grupo H.a: as três peças da identidade de agente ──────────────────────
    h(A.AgentStatus, {key: "as", state: "running"}),
    h(A.AgentCard, {key: "ac", name: "Curator", model: "opus-5", state: "paused",
      description: "Keeps the library tidy.",
      capabilities: [{name: "search", icon: "search"}, {name: "summarise"}]}),
    h(A.AgentInspector, {key: "ai", title: "Curator",
      sections: [{label: "Configuration", items: [{term: "Model", value: "opus-5"}]}]}),
    // ── Parte H, grupo H.b: a execução ─────────────────────────────────────────────────
    h(A.InvocationPanel, {key: "ip", title: "Run", input: "Do the thing", running: true,
      steps: [{id: "1", label: "read", state: "done"},
              {id: "2", label: "think", state: "running"},
              {id: "3", label: "write", state: "error", content: h("p", null, "denied")}],
      output: "done"}),
    h(A.TaskQueue, {key: "tq", tasks: [
      {id: "1", title: "Index", state: "running", progress: 0.4},
      {id: "2", title: "Purge", state: "failed", priority: "high"}]}),
    // ── Parte H, grupo H.c: a governança da ação ───────────────────────────────────────
    h(A.HumanApproval, {key: "ha", title: "Delete records", risk: "high",
      details: [{term: "Table", value: "invoices"}], deadline: "2h"}),
    h(A.ToolPermission, {key: "tp", tools: [
      {id: "1", name: "read", scope: "/docs", permission: "always"},
      {id: "2", name: "shell", permission: "never"}]}),
    // ── Parte H, grupo H.d: a observação ───────────────────────────────────────────────
    h(A.EventStream, {key: "es", events: [
      {id: "1", title: "Started", time: "10:02", group: "Today"},
      {id: "2", title: "Denied", time: "10:04", severity: "danger"}]}),
    h(A.TraceTimeline, {key: "tt", spans: [
      {id: "1", label: "invoke", start: 0, end: 900},
      {id: "2", label: "retrieve", start: 40, end: 380, depth: 1},
      {id: "3", label: "guard", start: 880, end: 900, depth: 2, error: true}]}),
    h(A.HealthMatrix, {key: "hm", entries: [
      {id: "1", name: "API", state: "operational"},
      {id: "2", name: "Search", state: "down"}]}),
    // ── Parte H, grupo H.e: custo e memória ────────────────────────────────────────────
    h(A.ModelUsage, {key: "mu", entries: [
      {id: "1", model: "sonnet", tokens: 900_000},
      {id: "2", model: "haiku", tokens: 100_000}]}),
    // Os três estados do orçamento entram RENDERIZADOS, e não como afirmação sobre o CSS:
    // é a única forma de medir que a barra muda de cor de verdade em cada um.
    h(A.CostMeter, {key: "cm1", spent: 12, limit: 100, className: "cm-under"}),
    h(A.CostMeter, {key: "cm2", spent: 85, limit: 100, softLimit: 80, className: "cm-near"}),
    h(A.CostMeter, {key: "cm3", spent: 140, limit: 100, softLimit: 80, className: "cm-over"}),
    // A MESMA cascata e a MESMA lista dentro de uma caixa ESTREITA — 260px, a largura do
    // painel de demo do catálogo a 320px de janela. Sem isto a asserção mede uma tela larga,
    // onde tudo cabe, e o defeito de 09/08/2026 passa: as colunas resolviam `224px 24px` e as
    // barras saíam com 24, 5, 6 e ZERO pixels. Caixa larga não prova coluna espremida.
    h("div", {key: "estreito", className: "medidor-estreito", style: {inlineSize: "260px"}},
      h(A.ModelUsage, {entries: [
        {id: "1", model: "a-very-long-model-name-here", tokens: 900},
        {id: "2", model: "b", tokens: 100}]}),
      h(A.TraceTimeline, {spans: [
        {id: "1", label: "a-very-long-span-label-here", start: 0, end: 100},
        {id: "2", label: "b", start: 50, end: 100, depth: 1}]})),
    // ── Parte H, item H14: o grafo ────────────────────────────────────────────────────
    // A TELA entra RENDERIZADA — é o `DependencyGraph` de verdade, e é dele que sai a
    // `.dependency-graph` medida abaixo. O NÓ entra como marcação, pelo precedente dos seis de
    // portal: o React Flow posiciona por medição de DOM e `renderToStaticMarkup` não mede nada,
    // então o viewport sai sem nó nenhum. Medir a pele do nó a partir de um viewport vazio
    // seria medir o nada; a marcação aqui é cópia do que a montagem real emite.
    h(A6.DependencyGraph, {key: "gr", height: "12rem",
      nodes: [{id: "a", label: "Ingest", kind: "source"}, {id: "b", label: "Embed"}],
      edges: [{from: "a", to: "b"}]}),
    h("div", {key: "grn"},
      h("div", {className: "graph-node"},
        h("button", {type: "button", className: "graph-node-body"},
          h("span", {className: "graph-node-label"}, "Ingest"),
          h("span", {className: "graph-node-kind"}, "source"))),
      h("div", {className: "graph-node", "data-selected": true},
        h("button", {type: "button", className: "graph-node-body", "aria-pressed": true},
          h("span", {className: "graph-node-label"}, "Embed"),
          h("span", {className: "graph-node-kind"}, "model")),
        h("span", {className: "graph-handle"}))),
    // ── Parte H, grupo H.f: a relação ─────────────────────────────────────────────────
    h(A.InterAgentMessage, {key: "iam", messages: [
      {id: "1", from: "Curator", to: "Writer", body: "Draft ready", kind: "handoff", time: "10:02"},
      {id: "2", from: "Writer", body: "Stopping", kind: "error", time: "10:04"}]}),
    // As duas regras entram: uma ligada e uma desligada, porque o recuo da desligada só se
    // mede tendo a ligada do lado.
    h(A.AutomationCard, {key: "au1", className: "au-on", name: "Nightly reindex", enabled: true,
      onToggle: () => {}, trigger: "Every day at 02:00", action: "Run the indexer",
      lastRun: "yesterday", lastResult: "success"}),
    h(A.AutomationCard, {key: "au2", className: "au-off", name: "Purge drafts",
      onToggle: () => {}, trigger: "On draft older than 30 days", action: "Delete it"}),
    h(A.MemoryLedger, {key: "ml", records: [
      {id: "1", content: "Prefers dark mode", scope: "semantic", operation: "added", time: "10:02",
       source: "conversation", details: [{term: "Turn", value: "12"}]},
      {id: "2", content: "Old office address", scope: "episodic", operation: "forgotten", time: "10:05"}]}),
    h(A4.QRCode, {key: "qr", value: "https://aureauds.dev", size: "md"}),
    // O CodeEditor entra, mas o que se mede nele é a FRONTEIRA, não a pele: ele está
    // declarado em `semRegra` no core-boundary.json porque a pele dele vive num StyleModule
    // do CodeMirror, injetado quando a EditorView monta — e aqui não há montagem. Medir
    // "a pele com só o core" nele é medir que o core NÃO contribui, e é isso que se afirma.
    h(A5.CodeEditor, {key: "ce", defaultValue: "const a = 1;"}),
    // ── Os 6 de portal, como MARCAÇÃO (precedente do HoverCard) ────────────────────────
    // `renderToStaticMarkup` não monta portal: Dialog e Drawer saem com ZERO byte e os
    // outros quatro saem só com o gatilho. Medido em 07/08/2026, e é por isso que a
    // superfície entra escrita à mão, copiada da montagem real de overlays.tsx.
    h("div", {key: "dlg", className: "dialog"},
      h("header", null, h("h2", null, "Confirm"),
        h("button", {className: "btn btn-ghost btn-icon", "aria-label": "Close"}, "×")),
      h("div", {className: "dialog-body"}, "Body of the dialog."),
      h("footer", null, h(A.Button, null, "Cancel"))),
    h("div", {key: "dbk", className: "dialog-backdrop"}),
    // Toast (16/08/2026). Entra como MARCAÇÃO pelo mesmo motivo dos outros de portal, e mais
    // um: ele não é componente — nasce do `useToast()` e o viewport mora no AureaProvider.
    // A marcação abaixo é cópia do que o `AureaToastList` emite de verdade.
    // O QUE SE MEDE AQUI: que `toast-${type}` FAZ alguma coisa. As quatro classes não existiam
    // no core até hoje — o tipo publicado não pintava nada, e o check 18 não via porque classe
    // por template é o ponto cego dele. Emitir a classe é o que o teste de unidade cobra; que
    // ela tenha EFEITO só se mede aqui.
    h("div", {key: "tst", className: "toast"},
      h("div", {className: "toast-text"}, h("strong", null, "Saved"))),
    ...(["info", "success", "warning", "danger"] as const).map(t =>
      h("div", {key: `tst-${t}`, className: `toast toast-${t}`},
        h("div", {className: "toast-text"}, h("strong", null, t)))),
    // ConfirmDialog (M5): mesma marcação escrita à mão dos outros de portal. Ele reusa `.dialog`
    // e só acrescenta `.dialog-confirm` — a medição abaixo é justamente que ele NÃO virou uma
    // segunda superfície flutuante, e que o rodapé alinha ao fim com os dois botões.
    // M4: as duas formas de "não dá". A pele é a mesma; o que muda é o alcance do foco, e isso
    // o teste de unidade mede. Aqui se mede que `aria-disabled` NÃO ficou sem pele — um botão
    // inerte com aparência de ativo é pior que o defeito original.
    // CommandPalette: a lista dela REUSA `.menu`/`.menu-item`. O que se mede e que ela nao criou
    // uma segunda pele de lista, e que a linha tem as tres colunas (icone, rotulo, atalho).
    h("div", {key: "cmd", className: "menu command-list"},
      h("div", {className: "menu-item command-item"},
        h(A.Icon, {name: "search"}), h("span", {className: "command-item-label"}, "Go to Button"),
        h(A.Kbd, null, "K"))),
    // Form: a pele dele e SO empilhamento — sem borda, sem fundo, sem largura. Se crescer, vira
    // uma terceira maneira de fazer layout e briga com Stack e Grid.
    h(A.Form, {key: "frm"},
      h(A.Field, {label: "E-mail"}, h(A.Input, {type: "email"})),
      h(A.Field, {label: "Name"}, h(A.Input, null))),
    // DataState: a regra visual é que ele NÃO desenha superfície própria — só empilha. Medir a
    // face `stale` porque é a que mantém o conteúdo E o aviso: dois filhos, não um.
    h(A.DataState, {key: "dst", state: "stale"}, h("p", null, "120 rows")),
    // AccessGate: negado + desabilitar produz o MESMO botão inerte — o portão não inventa pele,
    // ele escolhe. Medir os dois lado a lado é o que prova isso.
    h(A.AccessGate, {key: "agt", allowed: false, mode: "disable", reason: "Only an editor can publish"},
      h(A.Button, {variant: "primary"}, "Publish")),
    h(A.Button, {key: "bdis", disabled: true}, "Disabled"),
    h(A.Button, {key: "bine", "aria-disabled": true}, "Inert"),
    h("div", {key: "cfm", className: "dialog dialog-confirm"},
      h("header", null, h("h2", null, "Delete this article?")),
      h("div", {className: "dialog-body"}, "This cannot be undone."),
      h("footer", null, h(A.Button, {variant: "secondary"}, "Cancel"),
        h(A.Button, {variant: "danger"}, "Delete"))),
    h("div", {key: "drw", className: "drawer drawer-right"},
      h("header", null, h("h2", null, "Details"),
        h("button", {className: "btn btn-ghost btn-icon", "aria-label": "Close"}, "×")),
      "Body of the drawer."),
    h("div", {key: "pop", className: "popover"}, h("strong", null, "Title"), "Popover body."),
    h("div", {key: "ttp", className: "tooltip", role: "tooltip"}, "Short hint"),
    // SortableList (L3). Duas regras da pele são COMPORTAMENTO e não enfeite: `touch-action:none`
    // na alça (sem ela o navegador rola a página em vez de deixar arrastar, e o componente não
    // funciona em toque nenhum) e o alvo de 24px da alça. O item PEGO entra como marcação, porque
    // em HTML estático não há como pegá-lo.
    h("div", {key: "sort", style: {width: "360px"}},
      h(A.SortableList, {label: "Stages", onReorder: () => {}, items: [
        {id: "a", label: "Draft"}, {id: "b", label: "In review"}, {id: "c", label: "Published"}]}),
      h("ul", {className: "sortable-list"},
        h("li", {className: "sortable-item", "data-grabbed": ""},
          h("button", {type: "button", className: "sortable-handle", "aria-pressed": "true"},
            h(A.Icon, {name: "drag--horizontal"})),
          h("span", {className: "sortable-label"}, "Pego")))),
    // BlockEditor (N1). Herda as duas regras de comportamento da lista ordenável — é o mesmo
    // `useReorder` — e traz uma terceira que é só daqui: `min-width:0` no corpo do bloco. Sem ela
    // um filho largo (a figura abaixo) estoura a coluna do grid em vez de encolher, e a página
    // ganha rolagem lateral, que é o que o `catalog-sweep` reprova. A figura está no fixture de
    // propósito: é conteúdo de FLUXO, e foi a razão medida de o componente não ser prop da
    // SortableList. O bloco PEGO entra como marcação, porque em HTML estático não há como pegá-lo.
    h("div", {key: "bloco", style: {width: "360px"}},
      h(A.BlockEditor, {label: "Article", onReorder: () => {}, onRemove: () => {}, blocks: [
        {id: "a", kind: "Heading", children: h("h2", null, "The joke tax")},
        {id: "b", kind: "Image", children: h("figure", {style: {margin: 0}},
          h(A.Image, {src: FOTO_TESTE, alt: "The king", ratio: "16/9"}),
          h("figcaption", null, "The king"))}]}),
      h("ol", {className: "block-editor"},
        h("li", {className: "block-item", "data-grabbed": ""},
          h("div", {className: "block-rail"},
            h("button", {type: "button", className: "block-handle", "aria-pressed": "true"},
              h(A.Icon, {name: "drag--horizontal"}))),
          h("div", {className: "block-body"}, "Pego")))),
    // Prose (L5), e junto dela a PROVA DA TRAVA do item. Os três elementos com `data-fora` são
    // irmãos da prosa, não filhos: se qualquer regra de `.prose` for escrita sem escopo, eles
    // mudam — e é isso que as asserções pegam. É o defeito do Lote 4 (uma regra de tabela de
    // ELEMENTO valendo para todo o documento) escrito como teste em vez de como cicatriz.
    h("div", {key: "prosa"},
      h(A.Prose, null,
        h("h2", null, "The joke tax"),
        h("p", null, "The king came up with ", h("a", {href: "#"}, "a plan"), "."),
        h("blockquote", null, "Everyone enjoys a good joke."),
        h("ul", null, h("li", null, "Puns: 5 coins"), h("li", null, "One-liners: 20 coins")),
        h("p", null, "Inline ", h("code", null, "npm i"), " in a sentence."),
        h("pre", null, h("code", null, "pnpm build")),
        h("table", null,
          h("thead", null, h("tr", null, h("th", null, "Level"), h("th", null, "Coins"))),
          h("tbody", null, h("tr", null, h("td", null, "Puns"), h("td", null, "5"))))),
      h("table", {"data-fora": "tabela"}, h("tbody", null, h("tr", null, h("td", null, "solta")))),
      h("blockquote", {"data-fora": "citacao"}, "solta"),
      h("h2", {"data-fora": "titulo"}, "solto")),
    // Gallery (L2): a grade, e sobretudo que o ladrilho ESCOLHIDO fala a linguagem da casa — a
    // mesma cápsula da aba ativa. Ela quase não apareceu: `.gallery-tile` e `.is-selected` têm a
    // mesma especificidade e a nossa vinha depois no arquivo, então o fundo transparente matava a
    // cápsula. É isto que as asserções abaixo travam.
    h("div", {key: "gal", style: {width: "480px"}},
      h(A.Gallery, {label: "Product photos", selected: "back", onSelect: () => {},
        items: ["Front", "Back", "In use", "Packaging"].map(t =>
          ({id: t.toLowerCase().replace(" ", ""), src: FOTO_TESTE, alt: t, caption: t}))})),
    // Image (L4): o que se mede é a CAIXA RESERVADA, com a imagem ainda não carregada — que é o
    // estado em que o salto de layout acontece. A quarta caixa é a QUEBRADA, e entra como
    // marcação porque em HTML estático não há `onError` que a produza.
    // A foto é um SVG em data URI: o teste não depende de rede.
    // `data-pele` e não uma classe: a galeria acima também emite `img.image`, e um seletor solto
    // media o ladrilho quadrado dela em vez destas caixas. Atributo de dado não mexe com a
    // fronteira de classes do core (checks 15 e 18), que é o que uma classe de teste mexeria.
    h("div", {key: "img", "data-pele": "imagem", style: {width: "400px"}},
      h(A.Image, {src: FOTO_TESTE, alt: "Front", ratio: "16/9"}),
      h(A.Image, {src: FOTO_TESTE, alt: "Uncropped", ratio: "1/1", fit: "contain"}),
      h(A.Image, {src: FOTO_TESTE, alt: "Intrinsic", width: 300, height: 200}),
      h("span", {className: "image image-broken", role: "img", "aria-label": "Missing",
        style: {aspectRatio: "16/9"}}, h(A.Icon, {name: "image"}))),
    // Carousel (L1): aqui a pele É o motor, então o que se mede não é aparência — é
    // comportamento. Se estas regras sumirem, o componente não fica feio: ele para de rolar,
    // para de encaixar e o ponto vira alvo de 8px, que reprova o WCAG 2.2 AA (2.5.8).
    // A caixa é fixa em 480px e o slide é 50% dela — o caso `multiple` da referência, feito com
    // uma variável de CSS e nenhuma prop.
    h("div", {key: "car", style: {width: "480px"}},
      h(A.Carousel, {label: "Product photos", style: {"--carousel-slide": "50%"} as CSSProperties},
        ...["Front", "Back", "In use", "Packaging"].map((t, i) =>
          h(A.Card, {key: i}, h("strong", null, t))))),
    // O AppShell inteiro: ele COMPÕE Topbar e Sidebar, e é a moldura que todo consumidor vê
    // primeiro. Vive fora dos dois shells do trilho (item B1) para não confundir a medida
    // daquela regra — por isso a medição da lateral filtra por `:has(.sidebar-collapsed)`.
    h(A.AppShell, {key: "shellC", brand: "Aurea", navigation: h("span", null, "nav")}, "content"),
    // Os gatilhos dos dois menus entram RENDERIZADOS (medido: 88b e 113b) — é o popup que o
    // portal não monta. A superfície `.menu` abaixo serve aos DOIS de propósito: no Base UI,
    // `ContextMenu.Item`/`.Separator`/`.Popup` SÃO os mesmos componentes de `Menu.*`, então
    // existe uma pele só e medi-la duas vezes seria medir a mesma regra duas vezes.
    h(A.DropdownMenu, {key: "dd", trigger: h(A.Button, null, "Open"), items: [
      {label: "First"}, "separator", {label: "Second", disabled: true}]}),
    h(A.ContextMenu, {key: "cm", label: "Row actions", items: [{label: "First"}]},
      h("span", null, "right-click area")),
    h("div", {key: "mnu", className: "menu"},
      h("div", {className: "menu-item"}, "First"),
      h("div", {className: "menu-sep"}),
      h("div", {className: "menu-item", "data-disabled": ""}, "Second")),
    h("div", {key: "npn", className: "popover notification-panel"},
      h("div", {className: "notification-head"}, h("strong", null, "Notifications")),
      h("div", {className: "notification-list"},
        h("p", {className: "notification-group-label"}, "Today"),
        h("ul", {className: "notification-sublist"},
          h("li", null, h("div", {className: "notification-item"},
            h("span", {className: "notification-dot"}),
            h("span", {className: "notification-item-title"}, "Run finished"),
            h("span", {className: "notification-time"}, "10:02"))))))))));

const pagina = (theme: string) => `<!doctype html><html data-theme="${theme}"><head>
  <link rel="stylesheet" href="/packages/fonts/dist/fonts.css">
  <link rel="stylesheet" href="/packages/core/dist/aurea.css">
</head><body style="width:900px">${CORPO}</body></html>`;

for (const theme of ["dark", "light"] as const) {
  test(`pele: os nove componentes do A13 têm pele com só o core · ${theme}`, async ({page: p, baseURL}) => {
    const url = `${baseURL}/__pele-${theme}`;
    await p.route(url, r => r.fulfill({contentType: "text/html; charset=utf-8", body: pagina(theme)}));
    await p.goto(url, {waitUntil: "networkidle"});
    await p.evaluate(() => document.fonts.ready);

    const m = await p.evaluate(() => {
      const cs = (s: string) => getComputedStyle(document.querySelector(s)!);
      const box = (s: string) => document.querySelector(s)!.getBoundingClientRect();
      // resolve token em px, como o geometry.spec: sobrevive a troca de unidade.
      const emPx = (token: string, prop = "height") => {
        const sonda = document.createElement("div");
        sonda.style.cssText = `position:absolute;visibility:hidden;${prop}:var(${token})`;
        document.body.append(sonda);
        const v = parseFloat(getComputedStyle(sonda)[prop as "height"]);
        sonda.remove();
        return v;
      };
      const cards = [...document.querySelectorAll(".grid > .card")].map(e => Math.round(e.getBoundingClientRect().top));
      const dt = box(".data-list dt"), dd = box(".data-list dd");
      const sums = [...document.querySelectorAll(".accordion > details > summary")];
      const det2 = getComputedStyle(document.querySelectorAll(".accordion > details")[1]!);
      return {
        grid: {display: cs(".grid").display, topos: [...new Set(cards)].length, filhos: cards.length},
        dot: {w: parseFloat(cs(".timeline-dot").width), h: parseFloat(cs(".timeline-dot").height),
              raio: parseFloat(cs(".timeline-dot").borderTopLeftRadius), bg: cs(".timeline-dot").backgroundColor,
              primary: getComputedStyle(document.documentElement).getPropertyValue("--primary").trim()},
        timeline: {marcador: cs(".timeline").listStyleType,
                   // o item SEM descrição: título e horário não podem cair na mesma linha
                   semDesc: (() => {
                     const li = document.querySelectorAll(".timeline > li")[1]!;
                     const t = li.querySelector("strong")!.getBoundingClientRect();
                     const h = li.querySelector("small")!.getBoundingClientRect();
                     return Math.round(t.top) !== Math.round(h.top);
                   })()},
        overlay: {pos: cs(".command-overlay").position, w: box(".command-overlay").width,
                  bg: cs(".command-overlay").backgroundColor},
        palette: {raio: parseFloat(cs(".command-palette").borderTopLeftRadius),
                  radiusCard: emPx("--radius-card"), bg: cs(".command-palette").backgroundColor,
                  w: box(".command-palette").width},
        dataList: {display: cs(".data-list").display, ddIndent: parseFloat(cs(".data-list dd").marginLeft),
                   mesmaLinha: Math.round(dt.top) === Math.round(dd.top)},
        accordion: {alturas: sums.map(e => e.getBoundingClientRect().height),
                    controlMd: emPx("--control-h-md"), divisoria: parseFloat(det2.borderTopWidth),
                    corpoBaixo: parseFloat(cs(".accordion-content").paddingBottom)},
        empty: {align: cs(".empty-state").textAlign, padTop: parseFloat(cs(".empty-state").paddingTop),
                display: cs(".empty-state").display},
        emptyTitle: {fs: parseFloat(cs(".empty-title").fontSize), textBase: emPx("--text-base", "font-size")},
        // ── Lote 1 ────────────────────────────────────────────────────────────────────
        toggle: (() => {
          const ts = [...document.querySelectorAll(".toggle")];
          const pressed = ts.find(e => e.hasAttribute("data-pressed"))!;
          const solto = ts.find(e => !e.hasAttribute("data-pressed"))!;
          return {n: ts.length, bgPressed: getComputedStyle(pressed).backgroundColor,
                  bgSolto: getComputedStyle(solto).backgroundColor,
                  corPressed: getComputedStyle(pressed).color,
                  corSolto: getComputedStyle(solto).color,
                  secundario: getComputedStyle(document.documentElement).getPropertyValue("--secondary").trim()};
        })(),
        spinner: {
          larguras: [...document.querySelectorAll(".spinner")].map(e => parseFloat(getComputedStyle(e).width)),
          iconSm: emPx("--icon-sm", "width"),
          anima: cs(".spinner").animationName,
          papel: document.querySelector(".spinner")!.getAttribute("role"),
        },
        // `display` NÃO serve como asserção aqui: o grupo é filho de um flex, e o CSS
        // blockifica `inline-flex` para `flex` no valor computado. O que importa é o efeito —
        // os três na mesma linha —, então é isso que se mede.
        numberField: {mesmaLinha: (() => {
                        const t = [...document.querySelectorAll(".number-field-group > *")]
                          .map(e => Math.round(e.getBoundingClientRect().top));
                        return t.length === 3 && new Set(t).size === 1;
                      })(),
                      w: parseFloat(cs(".number-field-input").width),
                      align: cs(".number-field-input").textAlign,
                      botoes: document.querySelectorAll(".number-field .btn").length},
        otp: {display: cs(".otp-field").display,
              slots: document.querySelectorAll(".otp-slot").length,
              lado: parseFloat(cs(".otp-slot").width),
              alt: parseFloat(cs(".otp-slot").height),
              fonte: cs(".otp-slot").fontFamily},
        // ── Lote 2 ────────────────────────────────────────────────────────────────────
        avatar: (() => {
          const a = document.querySelector(".avatar")!, img = a.querySelector("img")!;
          const ca = a.getBoundingClientRect(), ci = img.getBoundingClientRect();
          return {vaza: ci.width > ca.width + 1 || ci.height > ca.height + 1,
                  overflow: getComputedStyle(a).overflow, fit: getComputedStyle(img).objectFit};
        })(),
        avatarGroup: (() => {
          const g = document.querySelector(".avatar-group")!;
          const tops = [...g.children].map(e => Math.round(e.getBoundingClientRect().top));
          return {mesmaLinha: new Set(tops).size === 1, filhos: g.children.length,
                  contagem: g.querySelector(".avatar-count")?.textContent,
                  sobrepoe: parseFloat(getComputedStyle(g.children[1]).marginInlineStart) < 0};
        })(),
        stepper: (() => {
          const s = document.querySelector(".stepper")!;
          const steps = [...s.querySelectorAll(".step")];
          const tops = steps.map(e => Math.round(e.getBoundingClientRect().top));
          const erro = s.querySelector(".step-error")!;
          return {mesmaLinha: new Set(tops).size === 1, n: steps.length,
                  larguras: new Set(steps.map(e => Math.round(e.getBoundingClientRect().width))).size,
                  corErro: getComputedStyle(erro).color,
                  corNormal: getComputedStyle(steps[3]).color,
                  pontoW: parseFloat(getComputedStyle(s.querySelector(".step-dot")!).width),
                  conector: getComputedStyle(steps[1], "::before").backgroundColor};
        })(),
        hoverCard: {maxW: parseFloat(cs(".hover-card").maxWidth),
                    raio: parseFloat(cs(".hover-card").borderTopLeftRadius),
                    radiusCard: emPx("--radius-card"),
                    bg: cs(".hover-card").backgroundColor},
        // ── Lote 3 ────────────────────────────────────────────────────────────────────
        // `sonda` resolve o token na MESMA página, então a asserção sobrevive a uma troca de
        // valor do token: o que se cobra é "usa --border", não "é rgb(x,y,z)".
        chart: (() => {
          const sonda = document.createElement("div");
          sonda.style.cssText = "position:absolute;visibility:hidden;color:var(--border)";
          document.body.append(sonda);
          const border = getComputedStyle(sonda).color;
          sonda.style.color = "var(--muted-foreground)";
          const muted = getComputedStyle(sonda).color;
          sonda.remove();
          const box = document.querySelector(".chart")!.getBoundingClientRect();
          return {altura: box.height, largura: box.width,
                  linha: cs(".chart svg line").stroke, border,
                  rotulo: cs(".chart svg text").fill, muted,
                  rotuloFs: parseFloat(cs(".chart svg text").fontSize),
                  textXs: emPx("--text-xs", "font-size")};
        })(),
        chartTooltip: {display: cs(".chart-tooltip").display,
                       bg: cs(".chart-tooltip").backgroundColor,
                       raio: parseFloat(cs(".chart-tooltip").borderTopLeftRadius),
                       // o valor é empurrado para a direita: nome à esquerda, número à direita
                       valorADireita: (() => {
                         const l = document.querySelector(".chart-tooltip .chart-key")!;
                         const b = l.querySelector("b")!.getBoundingClientRect();
                         return Math.round(b.right) >= Math.round(l.getBoundingClientRect().right) - 1;
                       })()},
        // ── Lote 4 ────────────────────────────────────────────────────────────────────
        // A pele do calendário é escrita contra ELEMENTO e `data-*`, e o motor conta com o
        // CSS DELE (que não importamos) para várias destas. Sem as regras: dia sem forma de
        // botão, selecionado indistinguível, e o dia escondido das pontas APARECENDO.
        calendar: (() => {
          const cel = (sel: string) => document.querySelector(`.calendar ${sel}`)!;
          // 25 e não 14: o 14 cai DENTRO do intervalo 12–18 do fixture e sairia "selecionado",
          // que foi como esta asserção pegou o erro de quem a escreveu.
          const dia = cel('td[data-day="2026-08-25"] button');
          const sel = cel('td[data-selected] button');
          const fora = cel("td[data-outside] button");
          const desab = cel("td button:disabled");
          const rb = dia.getBoundingClientRect();
          const sonda = document.createElement("div");
          sonda.style.cssText = "position:absolute;visibility:hidden;color:var(--primary)";
          document.body.append(sonda);
          const primary = getComputedStyle(sonda).color;
          sonda.remove();
          return {
            raio: parseFloat(cs(".calendar").borderTopLeftRadius),
            radiusCard: emPx("--radius-card"),
            fundo: cs(".calendar").backgroundColor,
            diaW: rb.width, diaH: rb.height, controlMd: emPx("--control-h-md"),
            diaRaio: parseFloat(getComputedStyle(dia).borderTopLeftRadius),
            selBg: getComputedStyle(sel).backgroundColor, primary,
            normalBg: getComputedStyle(dia).backgroundColor,
            foraCor: getComputedStyle(fora).color,
            normalCor: getComputedStyle(dia).color,
            desabOpacidade: parseFloat(getComputedStyle(desab).opacity),
            // grade fixa: o motor esconde a ponta pela classe DELE, que não temos
            escondidos: [...document.querySelectorAll(".calendar td[data-hidden]")]
              .map(e => getComputedStyle(e).visibility),
            navBtn: (() => { const b = cel("nav button"); const r = b.getBoundingClientRect();
              return {w: r.width, h: r.height, controlSm: emPx("--control-h-sm")}; })(),
            // a navegação fica NA LINHA do mês, não numa fileira própria acima dele
            navNaLinhaDoMes: (() => {
              const n = cel("nav").getBoundingClientRect();
              const c = document.querySelector(".calendar-caption")!.getBoundingClientRect();
              return Math.abs(n.top - c.top) <= 2;
            })(),
          };
        })(),
        // ── Parte B, item B1 — a lista da lateral ─────────────────────────────────────
        // O <ul> cru vem com marcador e 40px de recuo do UA, e o <a> vem sem caixa nenhuma:
        // sem estas regras a navegação da Aurea seria uma lista com bolinhas. E o item ATUAL
        // é o que mais importa aqui, porque ele é pintado a partir de [aria-current] — se a
        // regra sumir, o único sinal de "você está aqui" some junto.
        // O BADGE REESCRITO. Três medições, e cada uma corresponde a um erro que já aconteceu:
        // (1) contraste em TODAS as combinações — as ênfases nasceram escritas ANTES das
        //     variantes no arquivo e, com a mesma especificidade, não faziam nada em quatro das
        //     seis; (2) o anel de recorte, que é o que separava o contador do ícone; (3) o canto
        //     redondo contra o quadrado, que é a razão de `anchorShape` existir.
        badgeLab: (() => {
          const cv = document.createElement("canvas");
          cv.width = cv.height = 1;
          const ctx = cv.getContext("2d", {willReadFrequently: true})!;
          const srgb = (v: string, base?: string) => {
            ctx.clearRect(0, 0, 1, 1);
            ctx.fillStyle = base ?? "#000"; ctx.fillRect(0, 0, 1, 1);
            ctx.fillStyle = v; ctx.fillRect(0, 0, 1, 1);
            const d = ctx.getImageData(0, 0, 1, 1).data;
            return [d[0], d[1], d[2]] as [number, number, number];
          };
          const lum = (c: [number, number, number]) => {
            const [r, g, b] = c.map(x => {
              const v = x / 255;
              return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
          };
          const razao = (a: [number, number, number], b: [number, number, number]) => {
            const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
            return (x + 0.05) / (y + 0.05);
          };
          const pagina = srgb(getComputedStyle(document.body).backgroundColor);
          const contrastes: Record<string, number> = {};
          const fundos: Record<string, string> = {};
          for (const v of ["neutral", "primary", "info", "success", "warning", "danger"]) {
            for (const e of ["soft", "solid", "outline"]) {
              const el = document.querySelector(`.lab-${v}-${e}`)!;
              const cs = getComputedStyle(el);
              const fundo = srgb(cs.backgroundColor, `rgb(${pagina.join(",")})`);
              contrastes[`${v}/${e}`] = razao(srgb(cs.color, `rgb(${fundo.join(",")})`), fundo);
              fundos[`${v}/${e}`] = cs.backgroundColor;
            }
          }
          const alt = (s: string) => document.querySelector(s)!.getBoundingClientRect().height;
          const canto = (s: string) => {
            const b = document.querySelector(s)!;
            const o = b.querySelector(".badge-overlay")!.getBoundingClientRect();
            const alvo = b.querySelector(".lab-alvo")!.getBoundingClientRect();
            return {passa: o.right - alvo.right, acima: alvo.top - o.top};
          };
          return {
            contrastes, fundos,
            alturas: {sm: alt(".lab-size-sm"), md: alt(".lab-size-md"), lg: alt(".lab-size-lg")},
            pontoNoChip: document.querySelector(".lab-dot .badge-dot") != null,
            anel: getComputedStyle(document.querySelector(".lab-square")!).boxShadow,
            quadrado: canto(".badge-anchor:has(.lab-square)"),
            circulo: canto(".badge-anchor:has(.lab-circle)"),
            ariaEscondido: document.querySelector(".lab-square")!.getAttribute("aria-hidden"),
          };
        })(),
        // A BARRA INFERIOR. Mesmo tipo de dado do Sidebar, pele oposta: o que se mede aqui é
        // exatamente o que a separa de uma lateral deitada — item em COLUNA e largura dividida.
        // O recuo do indicador do iPhone é o único efeito que ESTE navegador não consegue
        // produzir (`env(safe-area-inset-bottom)` é 0 fora do aparelho), então ele se prova
        // pela declaração: se alguém apagar a linha, a busca no CSS não acha mais.
        bottomNav: (() => {
          const barra = document.querySelector(".bottom-nav")!;
          const atual = document.querySelector(".bottom-nav-item[aria-current]")!;
          const comum = document.querySelector(".bottom-nav-item:not([aria-current])")!;
          const larguras = [...barra.querySelectorAll(".bottom-nav-item")]
            .map(i => Math.round(i.getBoundingClientRect().width));
          const icone = atual.querySelector(".icon")!.getBoundingClientRect();
          const rotulo = atual.querySelector(".bottom-nav-label")!.getBoundingClientRect();
          // `r.cssText` e NÃO `style.getPropertyValue("padding-bottom")`: a regra também traz o
          // atalho `padding:var(…)`, e um atalho com `var()` deixa as quatro longhands como
          // *pending-substitution*, que o CSSOM serializa como "".
          // E a busca DESCE nas regras de grupo: o `aurea.css` inteiro mora dentro de
          // `@layer aurea{…}`, então varrer só o topo enxerga uma regra só. As duas coisas
          // foram medidas aqui — cada uma reprovou os três motores antes de virar esta linha.
          let declaracaoSafeArea = "";
          const varrer = (regras: CSSRuleList) => {
            for (const r of [...regras]) {
              if (r instanceof CSSStyleRule && r.selectorText === ".bottom-nav") {
                declaracaoSafeArea = r.cssText;
              } else if ("cssRules" in r) {
                varrer((r as CSSGroupingRule).cssRules);
              }
            }
          };
          for (const folha of [...document.styleSheets]) {
            try { varrer(folha.cssRules); } catch { continue; }
          }
          return {
            grudada: getComputedStyle(barra).position,
            grudadaEmbaixo: getComputedStyle(barra).bottom,
            barraRaio: parseFloat(cs(".bottom-nav").borderTopLeftRadius),
            raioCard: emPx("--radius-card"),
            itemColuna: getComputedStyle(comum).flexDirection,
            itemCresce: getComputedStyle(comum).flexGrow,
            larguras,
            itemAltura: parseFloat(cs(".bottom-nav-item").minHeight),
            controlLg: emPx("--control-h-lg"),
            // ícone EM CIMA do rótulo — é a diferença de anatomia entre barra e lateral
            iconeAcima: icone.bottom <= rotulo.top,
            atualCor: getComputedStyle(atual).color,
            comumCor: getComputedStyle(comum).color,
            // o acessório monta no canto do ícone, e não na fila do texto
            badgePos: getComputedStyle(atual.querySelector(".bottom-nav-badge")!).position,
            declaracaoSafeArea,
            // AS VARIANTES. O que se mede é o que as separa: raio da barra, direção do item e
            // o preenchimento do atual. Se as três desenharem igual, a prop é enfeite.
            variantes: (() => {
              const medir = (sel: string) => {
                const barra = document.querySelector(sel)!;
                const at = barra.querySelector(".bottom-nav-item[aria-current]")!;
                const cx2 = barra.querySelector(".bottom-nav-item:not([aria-current])")!;
                const r = at.getBoundingClientRect();
                return {
                  raio: parseFloat(getComputedStyle(barra).borderTopLeftRadius),
                  direcao: getComputedStyle(cx2).flexDirection,
                  atualBg: getComputedStyle(at).backgroundColor,
                  atualFg: getComputedStyle(at).color,
                  redondo: Math.abs(r.width - r.height) < 1,
                  rotulosOcultos: [...barra.querySelectorAll(".bottom-nav-label.sr-only")].length,
                };
              };
              return {pill: medir(".bottom-nav-ind-pill"), "circle-bold": medir(".bottom-nav-ind-circle-bold")};
            })(),
            // CONTRASTE do acessório sobre a marca, medido de verdade. O canvas resolve
            // qualquer notação de cor para sRGB e COMPÕE a translucidez sobre o que está
            // debaixo — ler os números de uma string `oklch(…)` como se fossem rgb dá
            // resultado errado nos dois lados, e foi o que aconteceu na primeira medição.
            // ONDE O CONTADOR MORA. Ele pendura no ÍCONE, no canto, e NÃO pode encostar no
            // rótulo — foi assim que ele nasceu errado: ancorado no item, `50%` caiu no meio do
            // nome na variante de linha. Mede-se a interseção das caixas, que é o defeito em si.
            contador: (() => {
              const caso = (sel: string) => {
                const it = document.querySelector(`${sel} .bottom-nav-item[aria-current]`)!;
                const b = it.querySelector(".bottom-nav-badge")!.getBoundingClientRect();
                const ic = it.querySelector(".icon")!.getBoundingClientRect();
                const rot = it.querySelector(".bottom-nav-label")!.getBoundingClientRect();
                const cruza = (a: DOMRect, c: DOMRect) =>
                  a.left < c.right && a.right > c.left && a.top < c.bottom && a.bottom > c.top;
                return {
                  sobreORotulo: rot.width > 1 && cruza(b, rot),
                  encostaNoIcone: cruza(b, ic),
                  // canto SUPERIOR: o topo do contador fica acima do meio do ícone
                  noAlto: b.top < ic.top + ic.height / 2,
                  visivel: b.width > 0 && b.height > 0,
                };
              };
              return {circulo: caso(".bottom-nav-ind-circle"),
                pill: caso(".bottom-nav-ind-pill"), bold: caso(".bottom-nav-ind-circle-bold")};
            })(),
            // O PONTO: sem número não há caixa, e a razão contra o ícone é a medida que o
            // Victor cobrou — nos quatro aplicativos o contador é MENOR que o ícone.
            ponto: (() => {
              const p = document.querySelector(".bottom-nav-edge .bottom-nav-badge")!;
              const ic = document.querySelector(".bottom-nav-edge .icon")!;
              const rp = p.getBoundingClientRect(), ri = ic.getBoundingClientRect();
              return {largura: rp.width, redondo: Math.abs(rp.width - rp.height) < 1,
                temTexto: (p.textContent ?? "").trim().length > 0, iconeLargura: ri.width};
            })(),
            // A razão contador/ícone, que é o número que ele mandou refazer: era 1,12.
            razaoContadorIcone: (() => {
              const it = document.querySelector(".bottom-nav-ind-circle .bottom-nav-item[aria-current]")!;
              const b = it.querySelector(".bottom-nav-badge")!.getBoundingClientRect();
              const ic = it.querySelector(".icon")!.getBoundingClientRect();
              return b.height / ic.height;
            })(),
            // O RÓTULO QUE DEVE APARECER NÃO PODE MEDIR ZERO — e mede-se APERTADO, porque é só
            // apertado que o defeito existe. Na `pill` os quatro itens repartiam a barra em partes
            // IGUAIS (`flex:1` herdado) e só o atual carrega texto: o rótulo dele recebia 0px e
            // sumia da tela. A suíte inteira passava — 143 de 143 — porque `sobreORotulo` acima
            // PULA a checagem quando a largura é 0, e nenhuma outra asserção olhava o tamanho.
            // Fixture largo não pega: a barra do catálogo tem 179px, e foi lá que ele apareceu.
            // Por isso a medida clona a barra num palco ESTREITO em vez de confiar no viewport.
            rotulosSumidos: (() => {
              const palco = document.createElement("div");
              palco.style.cssText = "position:fixed;left:0;top:0;width:200px;visibility:hidden";
              document.body.appendChild(palco);
              const sumiram: string[] = [];
              for (const barra of document.querySelectorAll(".bottom-nav")) {
                const variante = [...barra.classList].find(c => c.startsWith("bottom-nav-")) ?? "?";
                palco.replaceChildren(barra.cloneNode(true));
                const nav = palco.firstElementChild!;
                // O FIXTURE TEM DOIS ITENS E A BARRA REAL TEM QUATRO — e com dois sobra espaço,
                // então o defeito NÃO aparece. Foi assim que esta trava passou verde na primeira
                // tentativa, com o defeito reposto de propósito no CSS. Os quatro aplicativos
                // medidos (WhatsApp, YouTube, Mercado Livre, Shopee) têm 4 e 5; a página do
                // catálogo tem 4. A medida completa o clone até QUATRO em vez de confiar no
                // fixture: instrumento fraco é gate que mente, e este já mentiu uma vez.
                const inativo = nav.querySelector(".bottom-nav-item:not([aria-current])");
                while (inativo && nav.querySelectorAll(".bottom-nav-item").length < 4) {
                  nav.appendChild(inativo.cloneNode(true));
                }
                nav.getBoundingClientRect();
                for (const l of nav.querySelectorAll(".bottom-nav-label")) {
                  if (l.classList.contains("sr-only")) continue;
                  if (l.getBoundingClientRect().width < 1) {
                    sumiram.push(`${variante}:${(l.textContent ?? "").trim()}`);
                  }
                }
              }
              palco.remove();
              return sumiram;
            })(),
            // A `flat` NÃO pinta fundo no atual (3 dos 4); a `surface` pinta só a caixa do ÍCONE
            // (o WhatsApp, que é o 4º) — e nunca o item inteiro, que não existe em lugar nenhum.
            realce: (() => {
              const f = document.querySelector(".bottom-nav-edge .bottom-nav-item[aria-current]")!;
              const s2 = document.querySelector(".bottom-nav-ind-circle .bottom-nav-item[aria-current]")!;
              return {
                flatItem: getComputedStyle(f).backgroundColor,
                flatMarca: getComputedStyle(f.querySelector(".bottom-nav-mark")!).backgroundColor,
                flatCor: getComputedStyle(f).color,
                flatComumCor: getComputedStyle(
                  document.querySelector(".bottom-nav-edge .bottom-nav-item:not([aria-current])")!).color,
                superficieItem: getComputedStyle(s2).backgroundColor,
                superficieMarca: getComputedStyle(s2.querySelector(".bottom-nav-mark")!).backgroundColor,
                // o rótulo tem de ficar FORA da caixa realçada
                rotuloForaDaMarca: (() => {
                  const m = s2.querySelector(".bottom-nav-mark")!.getBoundingClientRect();
                  const r = s2.querySelector(".bottom-nav-label")!.getBoundingClientRect();
                  return r.top >= m.bottom - 1;
                })(),
              };
            })(),
            contraste: (() => {
              const cv = document.createElement("canvas");
              cv.width = cv.height = 1;
              const ctx = cv.getContext("2d", {willReadFrequently: true})!;
              const srgb = (v: string, base?: string) => {
                ctx.clearRect(0, 0, 1, 1);
                ctx.fillStyle = base ?? "#000"; ctx.fillRect(0, 0, 1, 1);
                ctx.fillStyle = v; ctx.fillRect(0, 0, 1, 1);
                const d = ctx.getImageData(0, 0, 1, 1).data;
                return [d[0], d[1], d[2]] as [number, number, number];
              };
              const lum = (c: [number, number, number]) => {
                const [r, g, b] = c.map(x => {
                  const v = x / 255;
                  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
                });
                return 0.2126 * r + 0.7152 * g + 0.0722 * b;
              };
              const razao = (a: [number, number, number], b: [number, number, number]) => {
                const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
                return (x + 0.05) / (y + 0.05);
              };
              const par = (badge: Element, dono: Element) => {
                const cb = getComputedStyle(badge);
                const fundo = srgb(getComputedStyle(dono).backgroundColor);
                const fBadge = srgb(cb.backgroundColor, `rgb(${fundo.join(",")})`);
                return {
                  texto: razao(srgb(cb.color, `rgb(${fBadge.join(",")})`), fBadge),
                  contra: razao(fBadge, fundo),
                };
              };
              const noAtual = (sel: string) => {
                const it = document.querySelector(`${sel} .bottom-nav-item[aria-current]`)!;
                return par(it.querySelector(".badge")!, it);
              };
              const btn = document.querySelector(".btn-primary:has(.badge)")!;
              return {
                pill: noAtual(".bottom-nav-ind-pill"),
                "circle-bold": noAtual(".bottom-nav-ind-circle-bold"),
                botao: par(btn.querySelector(".badge")!, btn),
              };
            })(),
            controlLgPx: emPx("--control-h-lg"),
            primaria: (() => {
              const s = document.createElement("div");
              s.style.cssText = "position:absolute;visibility:hidden;background:var(--primary)";
              document.body.append(s);
              const v = getComputedStyle(s).backgroundColor;
              s.remove();
              return v;
            })(),
          };
        })(),
        // A RÉGUA (18/08/2026). O check 18 aprova classe declarada; quem prova que ela DESENHA é
        // isto. E a vertical é o caso que engana: sem piso ela existe no DOM e mede zero.
        separator: (() => {
          const hz = document.querySelector<HTMLElement>(".skin-sep > .separator")!;
          const vt = document.querySelector<HTMLElement>(".skin-sep-row > .separator-vertical")!;
          // a vertical num pai que NÃO é flex: aqui `align-self` não salva, e sem piso ela é zero
          const vtSolta = document.querySelector<HTMLElement>(".skin-sep-block > .separator-vertical")!;
          const rh = hz.getBoundingClientRect(), rv = vt.getBoundingClientRect();
          const csh = getComputedStyle(hz), csv = getComputedStyle(vt);
          const corDaBorda = (() => {
            const p = document.createElement("span");
            p.style.color = "var(--border)";
            document.body.appendChild(p);
            const v = getComputedStyle(p).color;
            p.remove();
            return v;
          })();
          return {
            hzTag: hz.tagName,
            hzAltura: +rh.height.toFixed(2),
            hzLargura: +rh.width.toFixed(1),
            hzFundo: csh.backgroundColor,
            corDaBorda,
            // `<hr>` chega com margem e borda do navegador; as duas têm de estar zeradas
            hzMargem: csh.margin,
            hzBorda: parseFloat(csh.borderTopWidth),
            vtLargura: +rv.width.toFixed(2),
            vtAltura: +rv.height.toFixed(2),
            vtSoltaAltura: +vtSolta.getBoundingClientRect().height.toFixed(2),
            vtOrientacao: vt.getAttribute("aria-orientation"),
            hzOrientacao: hz.getAttribute("aria-orientation"),
          };
        })(),
        // A LINHA DE LISTA TOCÁVEL (18/08/2026). O que a pele tem de provar aqui é a REPARTIÇÃO
        // da linha: o texto é a única trilha que cede, o valor e a seta não cedem nunca. Valor
        // cortado MENTE e seta cortada deixa de dizer que a linha abre — as duas coisas passariam
        // por qualquer gate de nome de classe, e é por isso que se mede caixa.
        navList: (() => {
          const lista = document.querySelector(".skin-navlist .nav-list")!;
          const linhas = [...lista.querySelectorAll<HTMLElement>(".nav-list-row")];
          const longa = linhas.find(l => l.querySelector(".nav-list-value"))!;
          const rot = longa.querySelector<HTMLElement>(".nav-list-label")!;
          const val = longa.querySelector<HTMLElement>(".nav-list-value")!;
          const seta = longa.querySelector<HTMLElement>(".nav-list-chevron")!;
          const desc = longa.querySelector<HTMLElement>(".nav-list-description")!;
          const inerte = lista.querySelector<HTMLElement>('.nav-list-row[aria-disabled="true"]')!;
          const viva = linhas.find(l => !l.hasAttribute("aria-disabled"))!;
          // O alvo de toque de 44px NÃO se mede neste navegador: `pointer:coarse` não se emula
          // por `emulateMedia`. Então ele se cobra na DECLARAÇÃO, que é o mesmo caminho que o
          // `env(safe-area-inset-bottom)` da barra inferior já usa aqui, pelo mesmo motivo. E a
          // varredura DESCE nas regras de grupo: o `aurea.css` mora dentro de `@layer aurea{…}`,
          // então olhar só o topo de `styleSheets` não acha nada.
          let alvoCoarse = "";
          const varrer2 = (regras: CSSRuleList) => {
            for (const r of [...regras]) {
              if (r instanceof CSSMediaRule && r.conditionText.replace(/\s/g, "").includes("pointer:coarse")) {
                for (const i of [...r.cssRules]) {
                  if (i instanceof CSSStyleRule && i.selectorText.includes(".nav-list-row")) alvoCoarse = i.cssText;
                }
              }
              if ("cssRules" in r) varrer2((r as CSSGroupingRule).cssRules);
            }
          };
          for (const folha of [...document.styleSheets]) {
            try { varrer2(folha.cssRules); } catch { continue; }
          }
          return {
            // a lista NÃO pinta superfície: quem agrupa é o Card, de fora
            listaFundo: getComputedStyle(lista).backgroundColor,
            listaMarcador: getComputedStyle(lista).listStyleType,
            linhaDirecao: getComputedStyle(viva).flexDirection,
            linhaAltura: parseFloat(getComputedStyle(viva).minHeight),
            controlLg: emPx("--control-h-lg"),
            linhaRaio: parseFloat(getComputedStyle(viva).borderTopLeftRadius),
            raioControle: parseFloat(cs(".nav-list-row").borderTopLeftRadius),
            // QUEM ENCOLHE: o rótulo reticencia, o valor e a seta ficam inteiros
            rotuloCortado: rot.scrollWidth > rot.clientWidth,
            rotuloTemLargura: rot.clientWidth,
            valorInteiro: val.scrollWidth <= val.clientWidth + 1,
            valorLargura: val.getBoundingClientRect().width,
            setaLargura: seta.getBoundingClientRect().width,
            // a seta é a ÚLTIMA coisa da linha, depois do valor
            setaDepoisDoValor: seta.getBoundingClientRect().left >= val.getBoundingClientRect().right - 1,
            setaEUltima: longa.lastElementChild === seta,
            // a segunda linha é menor e apagada — se desenhar igual ao rótulo, ela é enfeite
            descFonte: parseFloat(getComputedStyle(desc).fontSize),
            rotuloFonte: parseFloat(getComputedStyle(rot).fontSize),
            descCor: getComputedStyle(desc).color,
            mutedCor: (() => {
              const p = document.createElement("span");
              p.style.color = "var(--muted-foreground)";
              document.body.appendChild(p);
              const v = getComputedStyle(p).color;
              p.remove();
              return v;
            })(),
            // linha inerte: apagada, e AINDA focável (não tem o atributo `disabled`)
            inerteOpacidade: parseFloat(getComputedStyle(inerte).opacity),
            inerteTemAtributoDisabled: inerte.hasAttribute("disabled"),
            inerteEhBotao: inerte.tagName,
            // A SETA É DO DESTINO. O fixture tem duas linhas com `href` e uma sem — se alguém
            // voltar a emitir a seta sempre, o número deixa de bater.
            // O PAINEL DÁ QUASE NADA E A LINHA DÁ O RESTO (18/08/2026, o Victor circulou a folga
            // no print). Com o `--card-pad` de 20px o realce começava a 21px da borda e a linha
            // ocupava 88% da largura: realce flutuando dentro de uma caixa grande.
            // A CONTA CONCÊNTRICA: `raio do filho = raio do pai − padding do pai`. Sem ela a curva
            // da linha e a curva do painel divergem, e o Victor viu isso num print antes de
            // qualquer medição (18/08/2026). Mede-se o EFETIVO: `999px` não desenha 999 — o
            // navegador limita à metade da altura, então a pílula muda de raio quando a linha ganha
            // uma segunda linha de texto. Era erro de 8,8px, e nenhum raio de card corrigia os dois
            // casos ao mesmo tempo.
            concentrico: (() => {
              const painel = lista.parentElement!;
              const cs = getComputedStyle(painel), ls = getComputedStyle(viva);
              const h = viva.getBoundingClientRect().height;
              const efetivo = Math.min(parseFloat(ls.borderTopLeftRadius) || 9999, h / 2);
              return {
                raioDaLinha: +efetivo.toFixed(1),
                padDoPainel: parseFloat(cs.paddingLeft),
                raioDoPainel: parseFloat(cs.borderTopLeftRadius),
                erro: +(efetivo + parseFloat(cs.paddingLeft) - parseFloat(cs.borderTopLeftRadius)).toFixed(1),
              };
            })(),
            painelPadding: parseFloat(getComputedStyle(lista.parentElement!).paddingLeft),
            cardPad: emPx("--card-pad"),
            pctDaLargura: (() => {
              const p = lista.parentElement!.getBoundingClientRect();
              return Math.round(100 * viva.getBoundingClientRect().width / p.width);
            })(),
            linhas: linhas.length,
            linhasComDestino: linhas.filter(l => l.tagName === "A").length,
            setas: lista.querySelectorAll(".nav-list-chevron").length,
            setaNaLinhaDeAcao: !!inerte.querySelector(".nav-list-chevron"),
            alvoCoarse,
          };
        })(),
        // AS DUAS VARIANTES TÊM DE DESENHAR DIFERENTE. A `floating` é o padrão e a identidade
        // desta casa; a `flush` é a única exceção autorizada, e é opt-in. Se as duas medirem
        // igual, a prop é enfeite — e o que as separa é justamente margem, raio e de que lados
        // vem a borda.
        lateralVariantes: (() => {
          const rente = document.querySelector<HTMLElement>(".sidebar-flush")!;
          const flutua = document.querySelector<HTMLElement>(".app-shell > .sidebar:not(.sidebar-flush)")!;
          const ler = (el: HTMLElement) => {
            const cs = getComputedStyle(el);
            return {
              margem: parseFloat(cs.marginLeft),
              raio: parseFloat(cs.borderTopLeftRadius),
              bordaEsquerda: parseFloat(cs.borderInlineStartWidth),
              bordaDireita: parseFloat(cs.borderInlineEndWidth),
              // a linha de dentro NÃO segue o painel para zero: o `calc()` é contra o token do
              // card, não contra o raio do painel
              raioDaLinha: (() => {
                const it = el.querySelector<HTMLElement>(".sidebar-item");
                return it ? parseFloat(getComputedStyle(it).borderTopLeftRadius) : -1;
              })(),
            };
          };
          return {rente: ler(rente), flutua: ler(flutua)};
        })(),
        // O TETO VEM DO CONTAINER, NÃO DA JANELA (18/08/2026). A altura da lateral é calculada em
        // `100vh`, e sozinha ela faz a lateral presumir que é dona da tela: dentro de qualquer
        // caixa menor ela transbordava e era CORTADA — 818px dentro de 272px na prévia do
        // catálogo, sem nem rolar. Mede-se num palco de altura DEFINIDA e menor que a janela, que
        // é o caso em que o defeito existe; num palco alto o teste passaria de graça.
        lateralNoContainer: (() => {
          const orig = document.querySelector(".sidebar")!;
          const palco = document.createElement("div");
          palco.style.cssText = "position:fixed;left:0;top:0;width:280px;height:260px;visibility:hidden";
          document.body.appendChild(palco);
          palco.appendChild(orig.cloneNode(true));
          const el = palco.firstElementChild as HTMLElement;
          el.getBoundingClientRect();
          const r = el.getBoundingClientRect(), rp = palco.getBoundingClientRect();
          const out = {
            alturaDoPalco: +rp.height.toFixed(1),
            alturaDaLateral: +r.height.toFixed(1),
            transborda: +(r.height - rp.height).toFixed(1) > 0,
            rolaPorDentro: getComputedStyle(el).overflow,
          };
          palco.remove();
          return out;
        })(),
        sidebar: (() => {
          const atual = document.querySelector(".sidebar-item[aria-current]")!;
          const comum = document.querySelector(".sidebar-list .sidebar-item:not([aria-current])")!;
          // O filho DIRETO é o caso real: a trilha do shell inclui as margens, enquanto o painel
          // continua medindo exatamente `--sidebar-rail`. O antigo `querySelector` pegava primeiro
          // o exemplo aninhado num conteúdo largo e aprovava um rail de verdade quebrado.
          const trilho = document.querySelector(".app-shell > .sidebar-collapsed")!;
          const rotuloTrilho = trilho.querySelector(".sidebar-label")!;
          const itemTrilho = trilho.querySelector(".sidebar-item")!;
          const r = rotuloTrilho.getBoundingClientRect();
          return {
            listaMarcador: cs(".sidebar-list").listStyleType,
            listaRecuo: parseFloat(cs(".sidebar-list").paddingInlineStart),
            itemAltura: parseFloat(cs(".sidebar-item").minHeight),
            controlMd: emPx("--control-h-md"),
            itemRaio: parseFloat(cs(".sidebar-item").borderTopLeftRadius),
            atualBg: getComputedStyle(atual).backgroundColor,
            comumBg: getComputedStyle(comum).backgroundColor,
            subRecuo: parseFloat(cs(".sidebar-sub").paddingInlineStart),
            grupoCaixaAlta: cs(".sidebar-group-label").textTransform,
            grupoCor: cs(".sidebar-group-label").color,
            itemCor: getComputedStyle(comum).color,
            // o rótulo do trilho: FORA da tela, DENTRO do DOM
            trilhoRotuloW: r.width, trilhoRotuloH: r.height,
            trilhoRotuloTexto: (rotuloTrilho.textContent ?? "").trim(),
            trilhoCentrado: getComputedStyle(itemTrilho).justifyContent,
            railToken: emPx("--sidebar-rail"),
            sidebarToken: emPx("--sidebar-width"),
            // O ACENTO DA LATERAL CONTRA O FUNDO DA LATERAL — trava nascida de um defeito meu em
            // 20/08/2026. Ao consertar as cores invertidas que o Victor viu sob a marca `lory`, eu
            // tirei o ajuste de tema claro que existia por um motivo e deixei o amarelo cru no item
            // atual: **1,60:1** sobre o painel branco. Nenhum gate viu, porque nenhum media isto.
            // Mede TOKEN contra TOKEN de propósito: é o par que os dois consumidores usam — o
            // `.sidebar-item[aria-current]` do componente e o `.doc-nav a.active` do catálogo —, e
            // token é o que cada marca redefine. Uma marca nova entra por aqui sem teste novo.
            acentoDaLateral: (() => {
              // PELO CANVAS, e não lendo a string: `getComputedStyle` devolve o token em `oklch()`,
              // e uma conta que trate esses três números como RGB dá lixo — foi o que a primeira
              // versão desta trava fez, em 20/08/2026, e ela reprovou uma cor que estava certa.
              const cv = document.createElement("canvas");
              cv.width = cv.height = 1;
              const ctx = cv.getContext("2d", {willReadFrequently: true})!;
              const sonda = (token: string) => {
                const el = document.createElement("div");
                el.style.cssText = `position:absolute;visibility:hidden;background:var(${token})`;
                document.body.append(el);
                const v = getComputedStyle(el).backgroundColor;
                el.remove();
                ctx.clearRect(0, 0, 1, 1);
                ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 1, 1);
                ctx.fillStyle = v; ctx.fillRect(0, 0, 1, 1);
                const d = ctx.getImageData(0, 0, 1, 1).data;
                return `rgb(${d[0]}, ${d[1]}, ${d[2]})`;
              };
              return {texto: sonda("--sidebar-primary"), fundo: sonda("--sidebar-accent")};
            })(),
            // a COLUNA dos dois shells: A tem o trilho aninhado (não deve encolher),
            // B tem o trilho como filho direto (deve encolher)
            // SÓ os dois shells do trilho: desde o item E13 há um AppShell inteiro na
            // página, e contá-lo aqui quebraria a medida por uma razão que não é defeito.
            colunas: [...document.querySelectorAll(".app-shell:has(.sidebar-collapsed)")]
              .map(s => parseFloat(getComputedStyle(s).gridTemplateColumns.split(" ")[0])),
            icone: (() => {
              const i = trilho.querySelector(".icon")!.getBoundingClientRect();
              const p = trilho.getBoundingClientRect();
              return {dentro: i.left >= p.left && i.right <= p.right, w: i.width};
            })(),
          };
        })(),
        // ══ Parte E, item E13 — os 53 que faltavam ═══════════════════════════════════
        // Todo número abaixo foi MEDIDO no navegador antes de virar asserção (o dump do
        // passo 1, 07/08/2026). Escrever primeiro e medir depois produz gate que concorda
        // com o presente, que é o que o QUALITY.md #29 recusa.
        e13: (() => {
          const caixa = (s: string) => document.querySelector(s)!.getBoundingClientRect();
          const est = (s: string) => getComputedStyle(document.querySelector(s)!);
          // Compara o CENTRO vertical, não o topo: numa fila de coisas de alturas diferentes
          // (o Badge do meio da paginação, o chevron do breadcrumb) os topos divergem sem que
          // nada esteja errado. Medido em 07/08/2026 — a primeira versão comparava topo e
          // acusava defeito onde havia alinhamento correto.
          // Escopado ao PRIMEIRO pai, e isso não é detalhe: o `.pagination` aparece duas
          // vezes na página (a fixture e a que o DataGrid desenha), e comparar as duas
          // dizia "não alinhado" sobre duas filas que estavam ambas alinhadas.
          const linhaUnica = (pai: string, filho: string) => {
            const p = document.querySelector(pai);
            if (!p) return false;
            const f = [...p.querySelectorAll(filho)];
            const centros = f.map(e => { const r = e.getBoundingClientRect(); return Math.round(r.top + r.height / 2); });
            return f.length > 1 && Math.max(...centros) - Math.min(...centros) <= 1;
          };
          return {
            // Feedback: cada um é uma CAIXA, e sem regra viraria texto solto no fluxo.
            alerta: {display: est(".alert").display, pad: parseFloat(est(".alert").paddingTop),
                     raio: parseFloat(est(".alert").borderTopLeftRadius),
                     radiusLg: emPx("--radius-lg"),
                     bordaDanger: est(".banner-danger").borderTopColor,
                     bordaAlerta: est(".alert-warning").borderTopColor},
            // Toast: a base e as quatro faces do tipo. Medir COR, não existência de regra — o
            // defeito de origem era exatamente uma classe emitida sem nada atrás.
            toast: {baseFundo: est(".toast").backgroundColor, baseBorda: est(".toast").borderTopColor,
                    fundos: ["info", "success", "warning", "danger"].map(t => est(`.toast-${t}`).backgroundColor),
                    bordas: ["info", "success", "warning", "danger"].map(t => est(`.toast-${t}`).borderTopColor)},
            badge: {display: est(".badge").display, raio: parseFloat(est(".badge").borderTopLeftRadius),
                    radiusControl: emPx("--radius-control"), alt: caixa(".badge").height,
                    entrelinha: est(".badge").lineHeight},
            banner: {display: est(".banner").display, raio: parseFloat(est(".banner").borderTopLeftRadius),
                     radiusCard: emPx("--radius-card"), colunas: est(".banner").gridTemplateColumns.split(" ").length},
            skeleton: {anima: est(".skeleton").animationName, bg: est(".skeleton").backgroundColor,
                       raio: parseFloat(est(".skeleton").borderTopLeftRadius)},
            progresso: {alt: caixa(".progress").height, over: est(".progress").overflow,
                        raio: parseFloat(est(".progress").borderTopLeftRadius),
                        preenchidoW: caixa(".progress > span").width, trilhoW: caixa(".progress").width},
            kpi: {display: est(".kpi").display, raio: parseFloat(est(".kpi").borderTopLeftRadius),
                  radiusCard: emPx("--radius-card")},
            cluster: {display: est(".cluster").display, quebra: est(".cluster").flexWrap,
                      gap: parseFloat(est(".cluster").columnGap)},
            kbd: {display: est(".kbd").display, fonte: est(".kbd").fontFamily,
                  fontCode: getComputedStyle(document.documentElement).getPropertyValue("--font-code").trim().replace(/,\s*/g, ","),
                  borda: parseFloat(est(".kbd").borderTopWidth)},
            // Formulários: o `.field` empilha; hint e erro NÃO podem medir igual ao rótulo.
            field: {display: est(".field").display, gap: parseFloat(est(".field").rowGap),
                    hintCor: est(".hint").color, erroCor: est(".field-error").color,
                    rotuloCor: est(".field .label").color},
            textarea: {alt: caixa(".textarea").height, minAlt: est(".textarea").minHeight,
                       raio: parseFloat(est(".textarea").borderTopLeftRadius),
                       resize: est(".textarea").resize},
            marca: {w: caixa(".control-mark").width, h: caixa(".control-mark").height,
                    raio: parseFloat(est(".checkbox .control-mark").borderTopLeftRadius),
                    radioRedondo: parseFloat(est(".radio .control-mark").borderTopLeftRadius),
                    radioW: caixa(".radio .control-mark").width},
            switchT: {w: caixa(".switch-track").width, h: caixa(".switch-track").height,
                      raio: parseFloat(est(".switch-track").borderTopLeftRadius),
                      pilula: parseFloat(est(".switch-track").borderTopLeftRadius) >= caixa(".switch-track").height / 2},
            select: {alt: caixa(".select").height, controlMd: emPx("--control-h-md"),
                     raio: parseFloat(est(".select").borderTopLeftRadius),
                     radiusControl: emPx("--radius-control"),
                     seta: est(".select").backgroundImage !== "none"},
            segmented: {display: est(".segmented").display, raio: parseFloat(est(".segmented").borderTopLeftRadius),
                       radiusControl: emPx("--radius-control"),
                        botoesNaLinha: linhaUnica(".segmented", "button")},
            combobox: {grupoDisplay: est(".combobox-group").display,
                       chipsQuebra: est(".combobox-chips").flexWrap,
                       chipsGap: parseFloat(est(".combobox-chips").columnGap)},
            dropzone: {display: est(".dropzone").display, raio: parseFloat(est(".dropzone").borderTopLeftRadius),
                       radiusCard: emPx("--radius-card"), tracejada: est(".dropzone").borderTopStyle,
                       pad: parseFloat(est(".dropzone").paddingTop)},
            // Ações
            iconBtn: {w: caixa(".btn-icon").width, h: caixa(".btn-icon").height,
                      quadrado: Math.abs(caixa(".btn-icon").width - caixa(".btn-icon").height) <= 1,
                      controlMd: emPx("--control-h-md")},
            btnGroup: {display: est(".btn-group").display, naLinha: linhaUnica(".btn-group", ":scope > .btn")},
            toolbar: {display: est(".toolbar").display, raio: parseFloat(est(".toolbar").borderTopLeftRadius),
                      radiusControl: emPx("--radius-control"),
                      grupoDisplay: est(".toolbar-group").display,
                      grupoGap: parseFloat(est(".toolbar-group").columnGap),
                      space1: emPx("--space-1", "width"),
                      sepW: caixa(".toolbar-sep").width, sepH: caixa(".toolbar-sep").height,
                      sepCor: est(".toolbar-sep").backgroundColor},
            pagination: {display: est(".pagination").display, alinha: est(".pagination").alignItems,
                         naLinha: linhaUnica(".pagination", ":scope > *"),
                         },
            // Dados e navegação
            tabela: {regiaoOver: est(".table-region").overflow,
                     raio: parseFloat(est(".table-region").borderTopLeftRadius),
                     colapso: est(".table").borderCollapse,
                     alturaLinha: caixa(".table tbody td").height, rowH: emPx("--row-h"),
                     alinhamento: est(".table th").textAlign,
                     // no <th>, não no <td>: a única linha do fixture é também a ÚLTIMA, e a
                     // última perde a divisória de propósito. Medido em 07/08/2026.
                     divisoria: parseFloat(est(".table th").borderBottomWidth)},
            breadcrumb: {display: est(".breadcrumb").display, naLinha: linhaUnica(".breadcrumb", ":scope > *")},
            tabs: {display: est(".tabs").display, raio: parseFloat(est(".tabs").borderTopLeftRadius),
                   radiusControl: emPx("--radius-control"),
                   tabRaio: parseFloat(est(".tab").borderTopLeftRadius),
                   tabAlt: caixa(".tab").height, tabsNaLinha: linhaUnica(".tabs", ":scope > .tab")},
            toc: {display: est(".toc").display, rotuloCaixaAlta: est(".toc-label").textTransform,
                  subRecuo: parseFloat(est(".toc-sub").paddingInlineStart),
                  atualCor: est(".toc a[aria-current]").color,
                  comumCor: est(".toc a:not([aria-current])").color},
            tree: {marcador: est(".tree").listStyleType, recuo: parseFloat(est(".tree").paddingInlineStart),
                   noDisplay: est(".tree-node").display,
                   noRaio: parseFloat(est(".tree-node").borderTopLeftRadius),
                   grupoRecuo: parseFloat(est(".tree-node").paddingInlineStart)},
            topbar: {display: est(".topbar").display, raio: parseFloat(est(".topbar").borderTopLeftRadius),
                     radiusCard: emPx("--radius-card"), alt: caixa(".topbar").height,
                     topbarH: emPx("--topbar-height")},
            // Código, comunicação e mídia
            codeBlock: {fonte: est(".code-block").fontFamily,
                        fontCode: getComputedStyle(document.documentElement).getPropertyValue("--font-code").trim().replace(/,\s*/g, ","),
                        raio: parseFloat(est(".code-block").borderTopLeftRadius),
                        over: est(".code-block").overflowX,
                        botaoPos: est(".code-block-wrap .copy-code").position},
            // A cor do NÍVEL, não a do container: é o `.log-level` que pinta. Medir o
            // container devolvia a mesma cor nos dois e escondia o defeito.
            // A célula do nível pode NÃO EXISTIR — foi o defeito medido —, então a medida é
            // guardada: sem isto o teste morre com TypeError em vez de dizer o que quebrou, e
            // mensagem é metade do valor de um gate.
            log: (() => {
              // O SELETOR seguia a forma do DEFEITO que o comentário das asserções descreve:
              // `.log-error .log-level` só casa se a classe do nível estiver no CONTAINER, que
              // é exatamente o que o core parou de pintar. Com a correção, o nível é MODIFICADOR
              // da célula (`.log-level.error`) — e o gate continuava medindo a forma antiga,
              // passando enquanto o React escrevia a errada. Corrigido em 29/08/2026.
              const nivel = document.querySelector(".log-line .log-level.error");
              const linhas = document.querySelectorAll(".log-line");
              const normal = linhas[1]?.querySelector(".log-level") ?? null;
              const texto = document.querySelector(".log-line > span:last-child");
              return {fonte: est(".log-stream").fontFamily, linhaDisplay: est(".log-line").display,
                      nivelExiste: !!nivel,
                      erroCor: nivel ? getComputedStyle(nivel).color : "",
                      normalCor: normal ? getComputedStyle(normal).color : "",
                      colunas: est(".log-line").gridTemplateColumns.split(" ").length,
                      filhos: document.querySelector(".log-line")!.children.length,
                      // o TEXTO tem de cair na coluna larga, não na do nível (72px)
                      textoW: texto ? texto.getBoundingClientRect().width : 0};
            })(),
            mensagem: {display: est(".message").display,
                       balaoRaio: parseFloat(est(".message-bubble").borderTopLeftRadius),
                       balaoBg: est(".message-bubble").backgroundColor,
                       composerDisplay: est(".message-composer").display,
                       composerNaLinha: linhaUnica(".message-composer", ":scope > *")},
            media: {shellRaio: parseFloat(est(".media-player").borderTopLeftRadius),
                    radiusCard: emPx("--radius-card"), over: est(".media-player").overflow,
                    controlesDisplay: est(".media-controls").display},
            notificacao: {painelRaio: parseFloat(est(".notification-panel").borderTopLeftRadius),
                          radiusCard: emPx("--radius-card"),
                          listaMarcador: est(".notification-sublist").listStyleType,
                          listaRecuo: parseFloat(est(".notification-sublist").paddingInlineStart),
                          itemDisplay: est(".notification-item").display,
                          pontoW: caixa(".notification-dot").width},
            // Subpath próprio
            datagrid: {display: est(".datagrid").display, gap: parseFloat(est(".datagrid").rowGap),
                       wrapOver: est(".table-wrap").overflow,
                       wrapRaio: parseFloat(est(".table-wrap").borderTopLeftRadius),
                       radiusCard: emPx("--radius-card"),
                       ordenavelCursor: est(".datagrid-sort").cursor,
                       // F3: só se mede o que se afirma. Cada número abaixo tem uma
                       // asserção, e cada asserção foi provada tirando a declaração
                       // de CSS correspondente e vendo o valor mudar.
                       filtroPadIn: parseFloat(est(".datagrid-filters th").paddingInlineStart),
                       cabecPadIn: parseFloat(est(".datagrid thead tr:first-child th").paddingInlineStart),
                       filtroCaixa: est(".datagrid-filters th").textTransform,
                       campoGap: parseFloat(est(".datagrid-filters .field").rowGap),
                       // a caixa de CONTROLE de cada célula, não o <input> dentro dela:
                       // o campo de texto é um <input> nu e a faceta é um .field com
                       // recheio, então comparar os <input> acusaria desalinhamento
                       // onde há alinhamento — o mesmo tropeço registrado no item E13.
                       // F5: a barra não tem CSS próprio — o que se mede é se o REUSO
                       // (Toolbar + .hint) chega ao consumidor como superfície, com só o core.
                       loteRaio: parseFloat(est(".datagrid .toolbar").borderTopLeftRadius),
                       loteFundo: est(".datagrid .toolbar").backgroundColor,
                       loteBotoes: document.querySelectorAll(".datagrid .toolbar button").length,
                       // F7: a busca passou a morar num Cluster ao lado do seletor de
                       // colunas. Mede-se se ela ENCOLHEU: era item de grid (largura toda)
                       // e virou item de flex.
                                              // F8: `.skeleton` é uma <div> VAZIA — sem altura própria ela mede
                       // zero e a linha de carregamento não parece linha.
                       esqueletoAlt: Math.round(caixa(".datagrid-skeleton").height),
                       painelRaio: parseFloat(est(".datagrid-detail").borderTopLeftRadius),
                       painelDir: Math.round(caixa(".datagrid-detail").left) > Math.round(caixa(".datagrid-split .table-wrap").left),
                       listaVisivel: Math.round(caixa(".datagrid-split .table-wrap").width) > 0,
                       alcaCursor: est(".datagrid-resizer").cursor,
                       alcaLarg: Math.round(caixa(".datagrid-resizer").width),
                       alcaAltura: Math.round(caixa(".datagrid-resizer").height),
                       cabecAltura: Math.round(caixa(".datagrid thead tr:first-child th").height),
                        // F6: a prova é ROLAR. Guarda o topo das duas linhas de
                       // cabeçalho, rola a caixa por dentro, e compara. Se o sticky
                       // não pegar, elas sobem junto com o corpo.
                       // F6: a prova é ROLAR. Guarda o topo das CÉLULAS de cabeçalho
                       // (não das <tr>: a linha não acompanha a célula grudada, e medir
                       // a caixa errada me fez concluir, errado, que o sticky não pegava),
                       // rola a caixa por dentro e compara.
                       fixo: (() => {
                         const wrap = document.querySelector(".datagrid-sticky .table-wrap") as HTMLElement;
                         const topos = () => [...wrap.querySelectorAll("thead tr")].map(tr => Math.round(tr.querySelector("th")!.getBoundingClientRect().top));
                         const antes = topos();
                         wrap.scrollTop = 120;
                         const depois = topos();
                         const rolou = wrap.scrollTop > 0;
                         wrap.scrollTop = 0;
                         return {antes, depois, rolou, degrau: depois[1] - depois[0], rowH: emPx("--row-h")};
                       })(),
                       radiusControl: emPx("--radius-control"),
                       controles: [...document.querySelectorAll(".datagrid:not(.datagrid-sticky) .datagrid-filters th")].map(th=>{const c=th.firstElementChild;if(!c)return null;const r=c.getBoundingClientRect();return {cls:c.className,top:Math.round(r.top),h:Math.round(r.height)}}).filter(Boolean)},
            // Parte H — as três são COMPOSIÇÃO: o que se mede é se o arranjo chega
            // ao consumidor com só o core, e se a peça reusada mantém a pele dela.
            agentes: {statusPonto: caixa(".agent-card .status-dot").width,
                      capRaio: parseFloat(est(".agent-cap").borderTopLeftRadius),
                      radiusControl: emPx("--radius-control"),
                      cardRaio: parseFloat(est(".agent-card").borderTopLeftRadius),
                      radiusCard: emPx("--radius-card"),
                      cabecFlex: est(".agent-card-head").display,
                      rotuloCaixa: est(".agent-inspector-label").textTransform,
                      capsQuebra: est(".agent-caps").flexWrap,
                      // H.b: o estado do passo entra por BORDA lateral, não por fundo —
                      // fundo colorido compete com o texto do passo.
                      passoBordaRod: est('.invocation-step[data-state="running"]').borderInlineStartColor,
                      passoBordaOk: est('.invocation-step[data-state="done"]').borderInlineStartColor,
                      passoFundo: est('.invocation-step[data-state="error"]').backgroundColor,
                      tarefaRaio: parseFloat(est(".task-item").borderTopLeftRadius),
                      tarefaLinha: est(".task-line").display,
                      // H.c: a decisão destrutiva não pode ser a primeira do foco, e o
                      // escopo da ferramenta não pode ficar escondido do lado do nome.
                      acoesFim: est(".approval-actions").justifyContent,
                      ordemBotoes: [...document.querySelectorAll(".approval-actions button")].map(b=>b.textContent),
                      // compara com o TOKEN resolvido em vez de adivinhar o nome da fonte na pilha —
                      // foi assim que a primeira versão desta asserção reprovou por engano.
                      // As ASPAS caem junto com o espaço, e isso é do item K1: o Chromium devolve
                      // `"IBM Plex Mono",…` no estilo computado e o WebKit devolve `IBM Plex Mono,…`.
                      // Normalizar os dois lados mantém o que a asserção quer dizer (é a mono do
                      // sistema, não a de texto) sem cobrar um detalhe de serialização de motor.
                      // As outras quatro comparações de fonte deste arquivo usam `toContain` e já
                      // eram imunes — medido antes de mexer; esta era a única exata.
                      escopoFonte: est(".tool-permission-scope").fontFamily.replace(/["']/g, "").replace(/,\s*/g, ","),
                      monoToken: getComputedStyle(document.documentElement).getPropertyValue("--font-code").trim().replace(/["']/g, "").replace(/,\s*/g, ","),
                      escopoVisivel: caixa(".tool-permission-scope").width > 0,
                      permLinha: est(".tool-permission-item").display,
                      // H.d: o ponto do evento tem de medir igual ao ponto do Status —
                      // dois indicadores de gravidade com tamanhos diferentes na mesma
                      // tela leem como coisas diferentes, e não são.
                      pontoEvento: caixa(".event-dot").width,
                      pontoStatus: caixa(".agent-card .status-dot").width,
                      eventoGrave: est('.event-item[data-severity="danger"] .event-dot').backgroundColor,
                      eventoInfo: est('.event-item[data-severity="info"] .event-dot').backgroundColor,
                      // a cascata: barra mais funda recua, e a que erra muda de cor.
                      spanRecuo0: parseFloat(est(".trace-span").paddingInlineStart),
                      spanRecuo2: parseFloat(getComputedStyle(document.querySelectorAll(".trace-span")[2]).paddingInlineStart),
                      barraErro: est('.trace-span[data-error] .trace-bar').backgroundColor,
                      barraOk: est(".trace-span .trace-bar").backgroundColor,
                      saudeColunas: est(".health-matrix").gridTemplateColumns.split(" ").length,
                      // H.e: os dois medidores medem IGUAL, e a barra é fatia de verdade.
                      trilhaUso: caixa(".model-usage-track").height,
                      trilhaRastro: caixa(".trace-track").height,
                      trilhaCusto: caixa(".cost-meter-track").height,
                      barraMaior: caixa(".model-usage-row:first-child .model-usage-bar").width,
                      barraMenor: caixa(".model-usage-row:last-child .model-usage-bar").width,
                      // A caixa de 260px: a barra tem PISO e o rótulo é quem cede. Medir a
                      // razão, e não "maior que a menor" — 1px > 0px também é "maior".
                      estreitoTrilhaUso: caixa(".medidor-estreito .model-usage-track").width,
                      estreitoBarraUso: caixa(".medidor-estreito .model-usage-bar").width,
                      estreitoTrilhaRastro: caixa(".medidor-estreito .trace-track").width,
                      estreitoRotulo: caixa(".medidor-estreito .model-usage-name").width,
                      pesoTotal: est(".metric-total strong").fontWeight,
                      pesoBase: getComputedStyle(document.body).fontWeight,
                      // o orçamento muda a BARRA, e o cartão continua sendo cartão.
                      custoSob: est(".cm-under .cost-meter-bar").backgroundColor,
                      custoPerto: est(".cm-near .cost-meter-bar").backgroundColor,
                      custoAcima: est(".cm-over .cost-meter-bar").backgroundColor,
                      custoFundo: est(".cm-over").backgroundColor,
                      cartaoFundo: est(".agent-card").backgroundColor,
                      // o limite brando fala por PALAVRA, e é o que se mede: o aviso EXISTE
                      // no cartão de perto e não existe no de baixo do teto.
                      avisoPerto: !!document.querySelector(".cm-near .alert"),
                      avisoSob: !!document.querySelector(".cm-under .alert"),
                      avisoAcima: est(".cm-over .alert").borderColor,
                      alertaPerto: est(".cm-near .alert").borderColor,
                      // o razão é apende-só: a linha esquecida CONTINUA na lista, riscada.
                      razaoLinhas: document.querySelectorAll(".memory-entry").length,
                      razaoRiscado: est('.memory-entry[data-operation="forgotten"] .memory-content').textDecorationLine,
                      razaoNormal: est('.memory-entry[data-operation="added"] .memory-content').textDecorationLine,
                      razaoRaio: parseFloat(est(".memory-entry").borderTopLeftRadius),
                      // H.f: o recado que falhou muda a BORDA, e a regra desligada RECUA.
                      recadoBordaErro: est('.agent-message[data-kind="error"]').borderTopColor,
                      recadoBordaOk: est('.agent-message[data-kind="handoff"]').borderTopColor,
                      recadoFundoErro: est('.agent-message[data-kind="error"]').backgroundColor,
                      recadoFundoOk: est('.agent-message[data-kind="handoff"]').backgroundColor,
                      regraLigada: est(".au-on .automation-id").color,
                      regraDesligada: est(".au-off .automation-id").color,
                      regraDesligadaExiste: !!document.querySelector(".au-off .automation-id strong"),
                      regraFundoLigada: est(".au-on").backgroundColor,
                      regraFundoDesligada: est(".au-off").backgroundColor,
                      // H14: o nó é superfície da Aurea, e o motor não pinta nada aqui.
                      grafoRaio: parseFloat(est(".dependency-graph").borderTopLeftRadius),
                      noRaio: parseFloat(est(".graph-node-body").borderTopLeftRadius),
                      noFundo: est(".graph-node-body").backgroundColor,
                      noBorda: est(".graph-node .graph-node-body").borderTopColor,
                      noBordaSel: est(".graph-node[data-selected] .graph-node-body").borderTopColor,
                      tipoCaixa: est(".graph-node-kind").textTransform,
                      tipoCor: est(".graph-node-kind").color,
                      rotuloCor: est(".graph-node-label").color},
            qr: {w: caixa(".qrcode").width, h: caixa(".qrcode").height,
                 quadrado: Math.abs(caixa(".qrcode").width - caixa(".qrcode").height) <= 1,
                 raio: parseFloat(est(".qrcode").borderTopLeftRadius), radiusCard: emPx("--radius-card"),
                 modulos: document.querySelectorAll(".qrcode .qr-mod").length},
            // O CodeEditor: aqui se mede a FRONTEIRA, não a pele. Ele está em `semRegra`.
            codeEditor: {altura: caixa(".code-editor").height,
                         regraNoCore: [...document.styleSheets].some(s => {
                           try { return [...s.cssRules].some(r =>
                             (r as CSSStyleRule).selectorText?.includes(".code-editor")); }
                           catch { return false; }
                         })},
            // Os 6 de portal
            dialog: {raio: parseFloat(est(".dialog").borderTopLeftRadius), radiusCard: emPx("--radius-card"),
                     largura: caixa(".dialog").width, bg: est(".dialog").backgroundColor,
                     fundoPos: est(".dialog-backdrop").position,
                     fundoCobre: caixa(".dialog-backdrop").width >= window.innerWidth},
            paleta: {colunas: est(".command-item").gridTemplateColumns.split(" ").length,
                     tetoLista: est(".command-list").maxHeight,
                     rolaLista: est(".command-list").overflowY,
                     mesmaPeleDeMenu: est(".command-list").backgroundColor === est(".menu").backgroundColor},
            form: {display: est(".form").display, gap: parseFloat(est(".form").rowGap),
                   bg: est(".form").backgroundColor, borda: parseFloat(est(".form").borderTopWidth)},
            dataState: {bg: est(".data-state").backgroundColor,
                        borda: parseFloat(est(".data-state").borderTopWidth),
                        display: est(".data-state").display,
                        gap: parseFloat(est(".data-state").rowGap),
                        filhos: document.querySelector(".data-state")?.childElementCount ?? 0},
            portao: {inertes: document.querySelectorAll('.btn[aria-disabled="true"]').length},
            botaoInerte: {op: parseFloat(est('.btn[aria-disabled="true"]').opacity),
                          opDisabled: parseFloat(est(".btn:disabled").opacity),
                          cursor: est('.btn[aria-disabled="true"]').cursor},
            confirmDialog: {raio: parseFloat(est(".dialog-confirm").borderTopLeftRadius),
                            radiusCard: emPx("--radius-card"),
                            largura: caixa(".dialog-confirm").width,
                            larguraDoDialog: caixa(".dialog").width,
                            rodapeAlinha: est(".dialog-confirm>footer").justifyContent,
                            rodapeGap: parseFloat(est(".dialog-confirm>footer").columnGap)},
            drawer: {pos: est(".drawer").position, alt: caixa(".drawer").height,
                     colaNaDireita: Math.round(caixa(".drawer").right) === window.innerWidth,
                     bordaEsq: parseFloat(est(".drawer").borderLeftWidth)},
            popover: {raio: parseFloat(est(".popover").borderTopLeftRadius), radiusCard: emPx("--radius-card"),
                      bg: est(".popover").backgroundColor, maxW: est(".popover").maxWidth},
            tooltip: {raio: parseFloat(est(".tooltip").borderTopLeftRadius),
                      bg: est(".tooltip").backgroundColor, maxW: est(".tooltip").maxWidth,
                      fs: parseFloat(est(".tooltip").fontSize), textSm: emPx("--text-sm", "font-size")},
            // SortableList (L3). Aqui a pele carrega comportamento — ver o comentário no corpo.
            ordenavel: (() => {
              const solto = document.querySelector(".sortable-item:not([data-grabbed])")!;
              const pego = document.querySelector(".sortable-item[data-grabbed]")!;
              const alcaPega = pego.querySelector(".sortable-handle")!;
              return {display: est(".sortable-list").display,
                      marcador: est(".sortable-list").listStyleType,
                      recuo: parseFloat(est(".sortable-list").paddingInlineStart),
                      itemDisplay: est(".sortable-item").display,
                      itemRaio: parseFloat(est(".sortable-item").borderTopLeftRadius),
                      radiusLg: emPx("--radius-lg"),
                      alcaW: caixa(".sortable-handle").width, alcaH: caixa(".sortable-handle").height,
                      space6: emPx("--space-6"),
                      cursor: est(".sortable-handle").cursor,
                      toque: est(".sortable-handle").touchAction,
                      cursorPego: getComputedStyle(alcaPega).cursor,
                      bordaSolto: getComputedStyle(solto).borderTopColor,
                      bordaPego: getComputedStyle(pego).borderTopColor,
                      sombraSolto: getComputedStyle(solto).boxShadow,
                      sombraPego: getComputedStyle(pego).boxShadow,
                      fundoSolto: getComputedStyle(solto).backgroundColor,
                      fundoPego: getComputedStyle(pego).backgroundColor};
            })(),
            // BlockEditor (N1). Mesma natureza da lista ordenável: aqui a pele carrega
            // comportamento. `corpoEstoura` é a asserção que só existe neste componente — mede se
            // a figura larga cabe na coluna em vez de furar o contêiner.
            blocos: (() => {
              const solto = document.querySelector(".block-item:not([data-grabbed])")!;
              const pego = document.querySelector(".block-item[data-grabbed]")!;
              const corpo = solto.querySelector(".block-body")!;
              const figura = corpo.querySelector("figure");
              return {display: est(".block-editor").display,
                      marcador: est(".block-editor").listStyleType,
                      recuo: parseFloat(est(".block-editor").paddingInlineStart),
                      itemDisplay: est(".block-item").display,
                      itemRaio: parseFloat(est(".block-item").borderTopLeftRadius),
                      radiusLg: emPx("--radius-lg"),
                      alcaW: caixa(".block-handle").width, alcaH: caixa(".block-handle").height,
                      lixoW: caixa(".block-remove").width, lixoH: caixa(".block-remove").height,
                      space6: emPx("--space-6"),
                      cursor: est(".block-handle").cursor,
                      toque: est(".block-handle").touchAction,
                      cursorPego: getComputedStyle(pego.querySelector(".block-handle")!).cursor,
                      corpoMin: getComputedStyle(corpo).minWidth,
                      corpoEstoura: figura ? figura.getBoundingClientRect().width
                                             - corpo.getBoundingClientRect().width : -1,
                      bordaSolto: getComputedStyle(solto).borderTopColor,
                      bordaPego: getComputedStyle(pego).borderTopColor,
                      sombraSolto: getComputedStyle(solto).boxShadow,
                      sombraPego: getComputedStyle(pego).boxShadow,
                      fundoSolto: getComputedStyle(solto).backgroundColor,
                      fundoPego: getComputedStyle(pego).backgroundColor};
            })(),
            // Prose (L5). Duas metades: a pele do texto, e a prova de que ela NÃO VAZA.
            prosa: {
              maxW: parseFloat(est(".prose").maxWidth), largura: caixa(".prose").width,
              fs: parseFloat(est(".prose").fontSize), textBase: emPx("--text-base", "font-size"),
              // 1.7 é `--leading-relaxed`; a conta em px sobrevive a troca de unidade.
              lh: parseFloat(est(".prose").lineHeight),
              tituloFs: parseFloat(est(".prose h2").fontSize), text2xl: emPx("--text-2xl", "font-size"),
              tituloTopo: parseFloat(est(".prose h2").marginBlockStart), space8: emPx("--space-8"),
              citacaoBorda: parseFloat(est(".prose blockquote").borderInlineStartWidth),
              citacaoRecuo: parseFloat(est(".prose blockquote").paddingInlineStart),
              listaRecuo: parseFloat(est(".prose ul").paddingInlineStart),
              codigoFs: parseFloat(est(".prose p code").fontSize),
              codigoPaiFs: parseFloat(est(".prose p").fontSize),
              codigoFonte: est(".prose p code").fontFamily,
              // A fonte do token se resolve numa SONDA, pelo mesmo motivo da cor: o valor
              // computado normaliza as aspas (`IBM Plex Mono, …`) e o texto cru do token não
              // (`"IBM Plex Mono",…`). Comparar computado com texto de token reprova por
              // serialização, não por pele — medido em 15/08/2026.
              monoToken: (() => {
                const sonda = document.createElement("div");
                sonda.style.cssText = "position:absolute;visibility:hidden;font-family:var(--font-code)";
                document.body.append(sonda);
                const v = getComputedStyle(sonda).fontFamily;
                sonda.remove();
                return v;
              })(),
              blocoRola: est(".prose pre").overflowX,
              blocoCodigoFundo: est(".prose pre code").backgroundColor,
              tabelaMinW: parseFloat(est(".prose table").minWidth),
              tabelaCaixaAlta: est(".prose th").textTransform,
              tabelaPad: parseFloat(est(".prose td").paddingTop),
              // A TRAVA: os três de fora têm de continuar como o navegador os deixou.
              foraTabelaMinW: parseFloat(est('[data-fora="tabela"]').minWidth),
              foraTabelaPad: parseFloat(est('[data-fora="tabela"] td').paddingTop),
              foraCitacaoBorda: parseFloat(est('[data-fora="citacao"]').borderInlineStartWidth),
              foraCitacaoRecuo: parseFloat(est('[data-fora="citacao"]').paddingInlineStart),
              foraTituloFs: parseFloat(est('[data-fora="titulo"]').fontSize),
            },
            // Gallery (L2). O que se mede é a grade e a LINGUAGEM do escolhido.
            galeria: (() => {
              const sel = document.querySelector(".gallery-tile.is-selected")!;
              const solto = [...document.querySelectorAll(".gallery-tile")]
                .find(e => !e.classList.contains("is-selected"))!;
              const fio = getComputedStyle(sel, "::after");
              const leg = (e: Element) => getComputedStyle(e.querySelector(".gallery-caption")!).color;
              return {display: est(".gallery").display,
                      colunas: est(".gallery").gridTemplateColumns.split(" ").length,
                      marcador: est(".gallery").listStyleType,
                      recuo: parseFloat(est(".gallery").paddingInlineStart),
                      ladrilhoDisplay: est(".gallery-tile").display,
                      ladrilhoCursor: est(".gallery-tile").cursor,
                      ladrilhoRaio: parseFloat(est(".gallery-tile").borderTopLeftRadius),
                      radiusLg: emPx("--radius-lg"),
                      fundoSel: getComputedStyle(sel).backgroundColor,
                      fundoSolto: getComputedStyle(solto).backgroundColor,
                      legendaSel: leg(sel), legendaSolta: leg(solto),
                      fioAltura: parseFloat(fio.height),
                      legendaFs: parseFloat(est(".gallery-caption").fontSize),
                      textSm: emPx("--text-sm", "font-size"),
                      fotoQuadrada: (() => {
                        const c = document.querySelector(".gallery-tile .image")!.getBoundingClientRect();
                        return Math.abs(c.width - c.height) <= 1;
                      })()};
            })(),
            // Image (L4). A caixa reservada é o produto do componente, e o que a prova é medir com
            // a imagem AINDA NÃO CARREGADA — é aí que o salto de layout acontece.
            imagem: (() => {
              const caixa = document.querySelector('[data-pele="imagem"]')!;
              const imgs = [...caixa.querySelectorAll("img.image")] as HTMLImageElement[];
              const quebrada = caixa.querySelector(".image-broken")!;
              const cor = (token: string) => {
                const sonda = document.createElement("div");
                sonda.style.cssText = `position:absolute;visibility:hidden;background:var(${token})`;
                document.body.append(sonda);
                const v = getComputedStyle(sonda).backgroundColor;
                sonda.remove();
                return v;
              };
              const razao = (e: Element) => {
                const c = e.getBoundingClientRect();
                return c.height ? +(c.width / c.height).toFixed(3) : 0;
              };
              const um = getComputedStyle(imgs[0]);
              return {razao169: razao(imgs[0]), fit169: um.objectFit,
                      raio: parseFloat(um.borderTopLeftRadius), radiusLg: emPx("--radius-lg"),
                      fundo: um.backgroundColor, surface3: cor("--surface-3"),
                      razao11: razao(imgs[1]), fit11: getComputedStyle(imgs[1]).objectFit,
                      fundo11: getComputedStyle(imgs[1]).backgroundColor,
                      // A terceira NÃO tem `ratio`: quem reserva é o par width/height do elemento.
                      carregou: imgs[2].complete && imgs[2].naturalWidth > 0,
                      razaoIntrinseca: razao(imgs[2]), alturaIntrinseca: imgs[2].getBoundingClientRect().height,
                      razaoQuebrada: razao(quebrada),
                      displayQuebrada: getComputedStyle(quebrada).display,
                      fundoQuebrada: getComputedStyle(quebrada).backgroundColor,
                      raioQuebrada: parseFloat(getComputedStyle(quebrada).borderTopLeftRadius)};
            })(),
            // Carousel (L1). Aqui a pele É o motor: sem estas regras o componente não fica feio,
            // ele para de funcionar. Por isso o que se mede é comportamento — que a faixa rola de
            // verdade, que o encaixe existe, e que o alvo do ponto passa no WCAG 2.2 AA.
            carousel: (() => {
              const trilho = document.querySelector(".carousel-track") as HTMLElement;
              const antes = (e: Element) => getComputedStyle(e, "::before");
              const pontos = [...document.querySelectorAll(".carousel-dot")];
              // COR DE TOKEN SE RESOLVE NUMA SONDA, como `emPx` já faz com comprimento — e não
              // se lê o texto cru de `getPropertyValue`. Medido em 15/08/2026: o Chromium
              // devolve `oklch(0.795 0.184 86.047)` e o WebKit/Firefox devolvem
              // `86.046997` para a MESMA cor. Comparar computado com texto de token reprova em
              // dois dos três navegadores por arredondamento de float, não por defeito de pele.
              const corDeToken = (token: string) => {
                const sonda = document.createElement("div");
                sonda.style.cssText = `position:absolute;visibility:hidden;background:var(${token})`;
                document.body.append(sonda);
                const v = getComputedStyle(sonda).backgroundColor;
                sonda.remove();
                return v;
              };
              return {display: est(".carousel-track").display,
                      overflowX: est(".carousel-track").overflowX,
                      encaixe: est(".carousel-track").scrollSnapType,
                      animacao: est(".carousel-track").scrollBehavior,
                      rola: trilho.scrollWidth > trilho.clientWidth,
                      alinha: est(".carousel-slide").scrollSnapAlign,
                      slideW: caixa(".carousel-slide").width, trilhoW: caixa(".carousel-track").width,
                      alvo: caixa(".carousel-dot").width, alvoAlt: caixa(".carousel-dot").height,
                      space6: emPx("--space-6"), space2: emPx("--space-2"),
                      pontoW: parseFloat(antes(pontos[0]).width),
                      pontoRaio: antes(pontos[0]).borderTopLeftRadius,
                      pontoAceso: antes(document.querySelector('.carousel-dot[aria-current="true"]')!).backgroundColor,
                      pontoApagado: antes(pontos[1]).backgroundColor,
                      primary: corDeToken("--primary"), borda: corDeToken("--border"),
                      controles: est(".carousel-controls").display,
                      setas: document.querySelectorAll(".carousel-controls .btn").length};
            })(),
            menu: {raio: parseFloat(est(".menu").borderTopLeftRadius), bg: est(".menu").backgroundColor,
                   itemDisplay: est(".menu-item").display,
                   itemRaio: parseFloat(est(".menu-item").borderTopLeftRadius),
                   sepH: caixa(".menu-sep").height, sepCor: est(".menu-sep").backgroundColor},
          };
        })(),
        chartLegend: (() => {
          const itens = [...document.querySelectorAll(".chart-legend > li")];
          const tops = itens.map(e => Math.round(e.getBoundingClientRect().top));
          const swatch = document.querySelector(".chart-legend .chart-key i")!;
          const s = swatch.getBoundingClientRect();
          return {marcador: cs(".chart-legend").listStyleType,
                  recuo: parseFloat(cs(".chart-legend").paddingInlineStart),
                  mesmaLinha: new Set(tops).size === 1, n: itens.length,
                  swatchW: s.width, swatchH: s.height,
                  swatchRaio: parseFloat(getComputedStyle(swatch).borderTopLeftRadius)};
        })(),
      };
    });

    // 1. Grid é grid, e as três colunas cabem numa linha só a 900px (auto-fill de verdade).
    expect(m.grid.display, "o Grid tem de ser grid — sem a regra sai display:block").toBe("grid");
    expect(m.grid.filhos, "fixture com 3 cards").toBe(3);
    expect(m.grid.topos, "os 3 cards ficam na MESMA linha a 900px").toBe(1);

    // 2. O ponto da timeline existe, é redondo e é o amarelo do sistema. Media 0×0.
    expect(m.dot.w, "o .timeline-dot media 0×0 antes da Fase 11").toBeGreaterThan(0);
    expect(m.dot.h, ".timeline-dot sem altura").toBeGreaterThan(0);
    expect(m.dot.raio, "o ponto é redondo: raio >= metade da largura").toBeGreaterThanOrEqual(m.dot.w / 2);
    expect(m.dot.bg, "o ponto usa --primary").not.toBe("rgba(0, 0, 0, 0)");
    expect(m.timeline.marcador, "o <ol> não mostra a numeração do navegador").toBe("none");
    expect(m.timeline.semDesc, "item sem descrição colava título e horário: 'Shipped14:20'").toBe(true);

    // 3. O overlay da paleta cobre a janela, e a paleta é superfície flutuante Aurea.
    expect(m.overlay.pos, "sem a regra o .command-overlay fica no fluxo (static)").toBe("fixed");
    expect(m.overlay.bg, "o overlay escurece o fundo").not.toBe("rgba(0, 0, 0, 0)");
    expect(m.palette.raio, "a paleta usa --radius-card (22px)").toBe(m.palette.radiusCard);
    expect(m.palette.bg, "a paleta tem superfície própria").not.toBe("rgba(0, 0, 0, 0)");
    expect(m.palette.w, "a paleta não ocupa a janela inteira").toBeLessThanOrEqual(680);

    // 4. DataList é chave/valor em duas colunas, sem o recuo do UA.
    expect(m.dataList.display, "o <dl> cru saía display:block").toBe("grid");
    expect(m.dataList.ddIndent, "o <dd> vinha com os 40px de recuo do navegador").toBe(0);
    expect(m.dataList.mesmaLinha, "termo e valor ficam na mesma linha").toBe(true);

    // 5. Accordion: linha na altura de controle, divisória entre itens, corpo com respiro.
    for (const a of m.accordion.alturas) {
      expect(a, `cabeçalho do accordion mede ao menos --control-h-md (${m.accordion.controlMd}px)`)
        .toBeGreaterThanOrEqual(m.accordion.controlMd);
    }
    expect(m.accordion.divisoria, "item seguinte tem divisória de 1px").toBeGreaterThan(0);
    expect(m.accordion.corpoBaixo, "o corpo não cola no item de baixo").toBeGreaterThan(0);

    // 6. EmptyState é o membro grande da família "aqui não há nada": centralizado e com folga.
    expect(m.empty.display, "sem a regra saía display:block").toBe("flex");
    expect(m.empty.align, "centralizado, como .notification-empty e .datagrid-empty").toBe("center");
    expect(m.empty.padTop, "sem a regra o padding era 0").toBeGreaterThan(0);
    expect(m.emptyTitle.fs, "o título vinha com o h3 do NAVEGADOR (16,38px), não com --text-base")
      .toBe(m.emptyTitle.textBase);

    // ── Lote 1 do BUILDING.md ───────────────────────────────────────────────────────────
    // 7. Toggle: pressionado tem de PARECER pressionado, e com o mesmo token do segmento aceso.
    //    Sem a regra, `data-pressed` existe no DOM e não muda um pixel — que é o modo de falha
    //    que o check 18 aprova (a classe existe) e só este teste pega.
    expect(m.toggle.n, "fixture com dois toggles").toBe(2);
    expect(m.toggle.bgPressed, "toggle pressionado não pode ter o mesmo fundo do solto")
      .not.toBe(m.toggle.bgSolto);
    expect(m.toggle.corPressed, "o pressionado usa a cor de seleção do sistema, não a de texto")
      .not.toBe(m.toggle.corSolto);

    // 8. Spinner: três tamanhos DISTINTOS, o médio no eixo dos ícones, e girando de verdade.
    expect(new Set(m.spinner.larguras).size, "sm, md e lg têm de medir diferente").toBe(3);
    // O base é --icon-sm, que são os 16px que o spinner sempre teve: apontar para --icon-md
    // mudaria o botão em carregamento de toda página, e os baselines pegaram isso.
    expect(m.spinner.larguras[0], "o base mede --icon-sm — o tamanho de sempre").toBe(m.spinner.iconSm);
    expect(m.spinner.anima, "sem animação não é spinner").not.toBe("none");
    expect(m.spinner.papel, "quem espera precisa ouvir que está esperando").toBe("status");

    // 9. NumberField: menos · campo · mais na mesma linha, campo estreito e centrado.
    expect(m.numberField.mesmaLinha, "menos, campo e mais ficam na MESMA linha").toBe(true);
    expect(m.numberField.botoes, "um botão de cada lado").toBe(2);
    expect(m.numberField.align, "número centrado, senão a vírgula dança ao digitar").toBe("center");
    expect(m.numberField.w, "campo de quantidade não é caixa de texto").toBeLessThan(120);

    // 10. OTPField: uma caixa por dígito, quadrada, em fonte de largura fixa.
    expect(m.otp.display, "a fila de dígitos fica em linha").toBe("inline-flex");
    expect(m.otp.slots, "uma caixa por dígito").toBe(4);
    expect(Math.abs(m.otp.lado - m.otp.alt), "a caixa do dígito é quadrada").toBeLessThanOrEqual(1);
    expect(m.otp.fonte, "dígito em fonte de largura fixa, senão a fila treme").toContain("Mono");

    // 11. HoverCard: superfície flutuante do sistema, com largura de leitura.
    expect(m.hoverCard.raio, "usa o raio de card da Aurea").toBe(m.hoverCard.radiusCard);
    expect(m.hoverCard.bg, "tem superfície própria").not.toBe("rgba(0, 0, 0, 0)");
    expect(m.hoverCard.maxW, "prévia é conteúdo: tem largura de leitura, não a da janela")
      .toBeGreaterThan(0);

    // ── Lote 2 do BUILDING.md ───────────────────────────────────────────────────────────
    // 12. Avatar: foto que não é quadrada tem de ser RECORTADA, não vazar. Medido antes da
    //     correção: imagem 3:1 saía 300×100 dentro de uma caixa de 40×40.
    expect(m.avatar.vaza, "a foto vazava inteira da caixa redonda — 300×100 em 40×40").toBe(false);
    expect(m.avatar.overflow, "sem overflow:hidden o border-radius não recorta filho nenhum")
      .not.toBe("visible");
    expect(m.avatar.fit, "a foto preenche o círculo sem distorcer").toBe("cover");

    // 13. AvatarGroup: a fila é horizontal e sobreposta. O container não tinha regra, então
    //     os avatares empilhavam na vertical.
    expect(m.avatarGroup.mesmaLinha, "os avatares empilhavam na vertical").toBe(true);
    expect(m.avatarGroup.sobrepoe, "a pilha é sobreposta, não uma fileira com espaço").toBe(true);
    expect(m.avatarGroup.filhos, "2 avatares + a contagem").toBe(3);
    expect(m.avatarGroup.contagem, "o excedente vira +7 (9 no total, 2 mostrados)").toBe("+7");

    // 14. Stepper: etapas de larguras IGUAIS numa linha só — é o que faz a conectora, ancorada
    //     em -50%, cair no lugar. E o erro tem cor própria: reprovar não é progredir.
    expect(m.stepper.mesmaLinha, "as etapas ficam na mesma linha").toBe(true);
    expect(m.stepper.n, "quatro etapas").toBe(4);
    expect(m.stepper.larguras, "todas as etapas medem o mesmo").toBe(1);
    expect(m.stepper.pontoW, "o ponto tem tamanho — a regra dele só existia no docs.css")
      .toBeGreaterThan(0);
    expect(m.stepper.corErro, "erro não pode ter a cor de uma etapa comum").not.toBe(m.stepper.corNormal);
    expect(m.stepper.conector, "a linha entre etapas é desenhada").not.toBe("rgba(0, 0, 0, 0)");

    // ── Lote 3 do BUILDING.md ───────────────────────────────────────────────────────────
    // 15. Chart: a caixa tem altura (o ResponsiveContainer do motor exige um pai medido —
    //     sem ela o gráfico sai 0×0 e não desenha nada), e a grade e os rótulos que o motor
    //     pinta de #ccc/#666 passam a usar token. É a prova de que CSS vence atributo de
    //     apresentação: sem estas duas regras o gráfico fica cinza de outra biblioteca.
    expect(m.chart.altura, "sem altura o motor não tem onde desenhar").toBeGreaterThan(0);
    expect(m.chart.largura, "a caixa ocupa a largura disponível").toBeGreaterThan(0);
    expect(m.chart.linha, "a grade vinha #ccc do motor; tem de usar --border").toBe(m.chart.border);
    expect(m.chart.rotulo, "o rótulo de escala vinha #666; tem de usar --muted-foreground")
      .toBe(m.chart.muted);
    expect(m.chart.rotuloFs, "rótulo de escala mede --text-xs").toBe(m.chart.textXs);

    // 16. ChartTooltip: é a superfície de tooltip da Aurea, e o número encosta à direita —
    //     senão duas séries de dígitos diferentes desalinham a coluna de valores.
    expect(m.chartTooltip.display, "as linhas do tooltip empilham").toBe("grid");
    expect(m.chartTooltip.bg, "herda a superfície do .tooltip").not.toBe("rgba(0, 0, 0, 0)");
    expect(m.chartTooltip.raio, "herda o raio do .tooltip").toBeGreaterThan(0);
    expect(m.chartTooltip.valorADireita, "o valor encosta à direita da linha").toBe(true);

    // 17. ChartLegend: é <ul>, então sem marcador e sem o recuo de 40px do navegador; os
    //     itens ficam em linha e o quadradinho de cor tem tamanho de verdade.
    expect(m.chartLegend.n, "fixture com duas séries").toBe(2);
    expect(m.chartLegend.marcador, "legenda não mostra bolinha de lista").toBe("none");
    expect(m.chartLegend.recuo, "o <ul> cru vem com os 40px de recuo do navegador").toBe(0);
    expect(m.chartLegend.mesmaLinha, "as séries ficam lado a lado").toBe(true);
    expect(m.chartLegend.swatchW, "o quadradinho de cor media 0 sem regra").toBeGreaterThan(0);
    expect(m.chartLegend.swatchH, "o quadradinho de cor media 0 sem regra").toBeGreaterThan(0);
    expect(m.chartLegend.swatchRaio, "o quadradinho usa raio da Aurea, não canto vivo")
      .toBeGreaterThan(0);

    // ── Lote 4 do BUILDING.md ───────────────────────────────────────────────────────────
    // 18. Calendar: superfície flutuante da Aurea, dia com a área de toque de um controle e
    //     em pill, e os três estados que o motor só marca em `data-*` — sem regra, o CSS
    //     dele (que não importamos) faria falta e o selecionado ficaria igual ao normal.
    expect(m.calendar.raio, "o calendário é superfície flutuante: raio de card")
      .toBe(m.calendar.radiusCard);
    expect(m.calendar.fundo, "tem superfície própria").not.toBe("rgba(0, 0, 0, 0)");
    expect(m.calendar.diaW, "o dia tem a largura de um controle").toBe(m.calendar.controlMd);
    expect(m.calendar.diaH, "o dia tem a altura de um controle").toBe(m.calendar.controlMd);
    expect(m.calendar.diaRaio, "dia em pill, como todo controle da Aurea")
      .toBeGreaterThanOrEqual(m.calendar.diaW / 2);
    expect(m.calendar.selBg, "o dia escolhido usa o amarelo do sistema").toBe(m.calendar.primary);
    expect(m.calendar.selBg, "escolhido não pode ter o mesmo fundo de um dia comum")
      .not.toBe(m.calendar.normalBg);
    expect(m.calendar.foraCor, "dia do mês vizinho é mais apagado que o do mês")
      .not.toBe(m.calendar.normalCor);
    expect(m.calendar.desabOpacidade, "dia fechado não parece disponível").toBeLessThan(1);
    // 19. A grade não muda de forma ao trocar de mês: com showOutsideDays não há dia
    //     escondido, e se houver (o consumidor desligou) ele fica invisível — o motor
    //     esconde pelo CSS DELE, que não importamos.
    expect(m.calendar.escondidos.length, "o 2º calendário do fixture existe para HAVER dia "
      + "escondido — laço sobre lista vazia é regra sem prova").toBeGreaterThan(0);
    for (const v of m.calendar.escondidos) {
      expect(v, "dia escondido tem de sumir, não ocupar buraco visível").toBe("hidden");
    }
    // 20. As setas do mês ficam NA LINHA do mês. Sem a âncora do `.calendar-months` elas
    //     caem numa fileira própria acima, e o cabeçalho vira duas linhas.
    expect(m.calendar.navBtn.w, "a seta mede um controle pequeno").toBe(m.calendar.navBtn.controlSm);
    expect(m.calendar.navNaLinhaDoMes, "as setas ficam na linha do nome do mês").toBe(true);
    // 21. Sidebar (Parte B, B1): a lista que o componente não tinha. Sem as regras, um <ul>
    //     cru com bolinha e 40px de recuo, e o item sem caixa nenhuma.
    expect(m.sidebar.listaMarcador, "a navegação não mostra a bolinha do <ul>").toBe("none");
    expect(m.sidebar.listaRecuo, "o <ul> vem com 40px de recuo do navegador").toBe(0);
    expect(m.sidebar.itemAltura, "o item tem a altura de um controle").toBe(m.sidebar.controlMd);
    expect(m.sidebar.itemRaio, "item em pill, como todo controle da Aurea")
      .toBeGreaterThanOrEqual(m.sidebar.itemAltura / 2);
    // 22. O item ATUAL: é a única marca de "você está aqui", e ela é pintada a partir de
    //     [aria-current] — a mesma coisa que o leitor de tela anuncia.
    expect(m.sidebar.atualBg, "o item atual tem fundo próprio")
      .not.toBe("rgba(0, 0, 0, 0)");
    expect(m.sidebar.atualBg, "o item atual não pode parecer um item comum")
      .not.toBe(m.sidebar.comumBg);
    // 23. Grupo e aninhamento têm de ser VISÍVEIS como tais: sem o recuo, a sublista fica
    //     indistinguível da lista de cima e a hierarquia só existe no HTML.
    expect(m.sidebar.subRecuo, "a sublista recua em relação ao pai").toBeGreaterThan(0);
    expect(m.sidebar.grupoCaixaAlta, "o rótulo de grupo é caixa alta").toBe("uppercase");
    expect(m.sidebar.grupoCor, "rótulo de grupo é mais apagado que item — ele não é clicável")
      .not.toBe(m.sidebar.itemCor);
    // 24. O TRILHO recolhido, e é a promessa que mais barato seria quebrar: esconder o rótulo
    //     com display:none passaria no olho e deixaria uma coluna de ícones anônimos para
    //     quem usa leitor de tela. Ele tem de sair da TELA e continuar no DOM.
    expect(m.sidebar.trilhoRotuloTexto, "o rótulo continua no DOM na lateral recolhida")
      .toBe("Inbox");
    expect(m.sidebar.trilhoRotuloW, "e sai da tela: largura de .sr-only").toBeLessThanOrEqual(1);
    expect(m.sidebar.trilhoRotuloH, "e sai da tela: altura de .sr-only").toBeLessThanOrEqual(1);
    expect(m.sidebar.trilhoCentrado, "sem rótulo, o ícone fica centrado no trilho").toBe("center");
    expect(m.sidebar.icone.w, "o trilho tem um ícone para caber").toBeGreaterThan(0);
    expect(m.sidebar.icone.dentro, "o ícone tem de CABER no painel real do trilho — a trilha do "
      + "grid precisa reservar as duas margens sem consumi-las do --sidebar-rail")
      .toBe(true);
    // 25. E o trilho encolhe a COLUNA do shell — mas só quando a lateral recolhida é filha
    //     DIRETA dele. Sem o `>` na regra, um exemplo de lateral recolhida dentro do <main>
    //     recolhia a lateral de verdade do documento (medido em 06/08/2026, na página do
    //     catálogo). Gate nenhum via, porque `sidebar.html` não tem baseline de pixel.
    // A LATERAL PRECISA SER LEGÍVEL DENTRO DELA MESMA, e não contra a página. Ver o comentário
    // ao lado da medição: em 20/08/2026 o item atual mediu 1,60:1 sobre o painel branco porque a
    // cor vinha do `--primary` cru. AA para texto é 4,5.
    {
      const px = (c: string) => (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
      const lum = (c: number[]) => {
        const [r, g, b] = c.map(x => { const v = x / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const [a, b2] = [lum(px(m.sidebar.acentoDaLateral.texto)), lum(px(m.sidebar.acentoDaLateral.fundo))].sort((x, y) => y - x);
      expect((a + 0.05) / (b2 + 0.05), `o acento da lateral (--sidebar-primary) contra o fundo do `
        + "item atual (--sidebar-accent) tem de ser legível — AA, 4,5:1").toBeGreaterThanOrEqual(4.5);
    }
    expect(m.sidebar.colunas.length, "o fixture tem dois shells: o do defeito e o da prova")
      .toBe(2);
    expect(m.sidebar.colunas[0], "trilho ANINHADO não pode encolher a coluna do shell; a "
      + "flutuante larga preserva o painel e as duas margens")
      .toBe(m.sidebar.sidebarToken + m.lateralVariantes.flutua.margem * 2);
    expect(m.sidebar.colunas[1], "trilho como filho direto encolhe a coluna sem consumir as "
      + "margens do painel flutuante")
      .toBe(m.sidebar.railToken + m.lateralVariantes.flutua.margem * 2);

    // 25a. BADGE reescrito (17/08/2026, a pedido do Victor: "o nosso atual é pobre").
    const bl = m.badgeLab;
    for (const [combo, r] of Object.entries(bl.contrastes)) {
      expect(r, `badge ${combo}: texto legível (AA, 4.5:1) — as 18 combinações se medem, não `
        + "se conferem no olho").toBeGreaterThanOrEqual(4.5);
    }
    // A prova de que as ênfases FAZEM alguma coisa. Escritas antes das variantes no arquivo elas
    // perdiam por ordem de fonte — mesma especificidade — e `solid` desenhava igual ao `soft`.
    for (const v of ["info", "success", "warning", "danger"]) {
      expect(bl.fundos[`${v}/solid`], `badge ${v}: solid tem fundo PRÓPRIO, não o do soft`)
        .not.toBe(bl.fundos[`${v}/soft`]);
      expect(bl.fundos[`${v}/outline`], `badge ${v}: outline não tem fundo`)
        .toBe("rgba(0, 0, 0, 0)");
    }
    expect(bl.alturas.sm, "sm é menor que md").toBeLessThan(bl.alturas.md);
    expect(bl.alturas.lg, "lg é maior que md").toBeGreaterThan(bl.alturas.md);
    expect(bl.pontoNoChip, "o ponto de estado entra no chip").toBe(true);
    expect(bl.anel, "o ANEL DE RECORTE é o que separa o contador do que está atrás — sem ele o "
      + "badge derrete no ícone, que foi o defeito que o Victor viu").not.toBe("none");
    expect(bl.ariaEscondido, "o sobreposto é decoração: o número mora no nome de quem é decorado")
      .toBe("true");
    // O canto REDONDO recolhe 14% (o `overlap` da MUI). Sem isso o contador de um avatar fica
    // solto fora do círculo — e é a única diferença entre as duas formas.
    expect(bl.circulo.passa, "circle recolhe o contador para dentro do canto")
      .toBeLessThan(bl.quadrado.passa);
    expect(bl.circulo.acima, "e também na vertical").toBeLessThan(bl.quadrado.acima);
    expect(bl.quadrado.passa, "square deixa o contador passar da borda, que é o canto clássico")
      .toBeGreaterThan(0);

    // 25b. BottomNav (17/08/2026): ela recebe o MESMO tipo do Sidebar, então sem as regras
    //      abaixo o que sai é uma lateral deitada — e uma lateral deitada não é uma barra.
    const bn = m.bottomNav;
    expect(bn.grudada, "a barra gruda no fim do fluxo; `fixed` escaparia do contêiner")
      .toBe("sticky");
    expect(bn.grudadaEmbaixo, "e gruda EMBAIXO — sem isto o sticky não faz nada").toBe("0px");
    // A BARRA FLUTUANTE É PÍLULA desde 20/08/2026 — é o que as sete telas do Victor mostram, e
    // é coerente com a identidade: cartão é superfície de conteúdo, barra de controle é pílula.
    expect(bn.barraRaio, "a barra flutuante é PÍLULA, não card").toBeGreaterThan(bn.raioCard);
    expect(bn.itemColuna, "o item é COLUNA — ícone sobre rótulo; em linha vira item de lateral")
      .toBe("column");
    expect(bn.itemCresce, "os itens dividem a largura da barra").not.toBe("0");
    expect(new Set(bn.larguras).size, "e dividem IGUAL: as três medidas são a mesma").toBe(1);
    expect(bn.iconeAcima, "o ícone fica ACIMA do rótulo, não ao lado").toBe(true);
    expect(bn.itemAltura, "alvo de toque: o item usa a altura de controle GRANDE")
      .toBe(bn.controlLg);
    // O item atual se distingue pela COR, e não por fundo: as duas asserções que exigiam fundo
    // aqui saíram em 17/08/2026, quando os prints de aplicativo real mostraram que 3 dos 4 não
    // pintam nada. Quem cobra o realce de cada variante é o bloco 25f, que sabe qual é qual.
    expect(bn.atualCor, "o item atual não pode ter a mesma cor de um item comum")
      .not.toBe(bn.comumCor);
    expect(bn.badgePos, "o acessório monta no canto do ícone; na fila empurraria o rótulo")
      .toBe("absolute");
    // O único efeito que este navegador não produz: fora do aparelho `env()` devolve 0. Então
    // ele se cobra na DECLARAÇÃO — apagou a linha, esta asserção reprova.
    expect(bn.declaracaoSafeArea, "o recuo do indicador de tela cheia do iPhone tem de estar "
      + "declarado — `env()` é 0 neste navegador, mas some se alguém apagar a linha")
      .toContain("safe-area-inset-bottom");
    // 25c. OS INDICADORES (reescrito em 20/08/2026 pela auditoria de UI/UX). O bloco anterior
    //      cobrava `pill` e `dock` do jeito antigo — item em LINHA, atual preenchido de amarelo,
    //      rótulo escondido — e por isso ele PROTEGIA o defeito que a auditoria achou. O que se
    //      cobra agora é a gramática: a forma muda, o resto não.
    for (const [nome, v] of Object.entries(bn.variantes)) {
      expect(v.raio, `${nome}: a barra flutuante é PÍLULA, não card`).toBeGreaterThan(bn.raioCard);
      expect(v.direcao, `${nome}: o item é COLUNA em todo indicador — ícone sobre rótulo`)
        .toBe("column");
      expect(v.rotulosOcultos, `${nome}: NENHUM rótulo se esconde. Era o achado 6/7 da auditoria,`
        + " e havia um teste aqui garantindo o contrário").toBe(0);
    }
    // E o `circle-bold` é o ÚNICO preenchido com o amarelo sólido — é o que separa ele do `pill`,
    // que usa o mesmo amarelo a 12%. Sem esta medida os dois seriam a mesma variante com nomes
    // diferentes, que é exatamente o defeito estrutural que a reescrita desfez.
    expect(bn.variantes["circle-bold"].atualBg, "circle-bold: preenchido com a cor da marca")
      .toBe(bn.primaria);
    expect(bn.variantes["circle-bold"].atualFg, "e o texto sobre ele não é a cor do próprio fundo")
      .not.toBe(bn.variantes["circle-bold"].atualBg);
    expect(bn.variantes.pill.atualBg, "pill: o realce é tingido, não sólido — se ficar igual ao"
      + " bold, as duas variantes viraram uma só").not.toBe(bn.primaria);
    expect(bn.variantes.pill.atualBg, "e ainda assim PINTA algo: sem fundo ele vira o `none`")
      .not.toBe("rgba(0, 0, 0, 0)");
    // 25d. ACESSÓRIO SOBRE A MARCA (17/08/2026). O Victor viu o contador sumir dentro do item
    //      amarelo, e a pergunta "quem mais tem esse problema?" achou o mesmo defeito no
    //      `.btn-primary`, PUBLICADO e nunca visto: badge primário sobre botão primário media
    //      contraste **1** — amarelo sobre amarelo. Gate nenhum via, nem o axe do sweep, porque
    //      página nenhuma compunha os dois. Agora o fixture compõe, e o número é medido.
    // 25e. ONDE O CONTADOR MORA (17/08/2026, segundo achado do Victor no mesmo dia). Ancorado no
    //      ITEM, `50%` caía no meio do RÓTULO na variante de linha e cobria o nome inteiro. A
    //      pesquisa corrigiu: canto do ÍCONE, encostando na borda dele, nunca sobre o texto.
    for (const [onde, c] of Object.entries(bn.contador)) {
      expect(c.visivel, `${onde}: o contador existe e tem tamanho`).toBe(true);
      expect(c.sobreORotulo, `${onde}: o contador NÃO pode cobrir o rótulo — foi exatamente `
        + "assim que ele nasceu errado").toBe(false);
      expect(c.encostaNoIcone, `${onde}: ele pendura NO ÍCONE, encostando na borda — solto no `
        + "canto do item ele deixa de dizer a que se refere").toBe(true);
      expect(c.noAlto, `${onde}: e no canto de CIMA, que é onde contador de aviso mora`).toBe(true);
    }
    // 25f. O TAMANHO do contador e o REALCE do atual (17/08/2026, terceira volta). Os dois
    //      números saíram de aplicativo que roda — os prints de WhatsApp, YouTube, Mercado
    //      Livre e Shopee. Antes: contador 18px sobre ícone 16px, razão 1,12, MAIOR que o
    //      ícone; e o realce pintava o item inteiro, que nenhum dos quatro faz.
    expect(bn.razaoContadorIcone, "o contador é MENOR que o ícone — nos quatro aplicativos "
      + "medidos a razão é ~0,67, e a primeira versão daqui era 1,12").toBeLessThan(0.8);
    // 25g. O RÓTULO QUE SOME (18/08/2026). Achado OLHANDO a página do catálogo: na `pill` o
    //      rótulo do item atual media ZERO e não aparecia, enquanto a variante prometia por
    //      escrito que "o atual ABRE para caber". Sumir é pior que cortar — `text-overflow` não
    //      tem o que reticenciar num box de largura 0. A regra vale para TODA variante, que é a
    //      resposta a "quem mais tem esse problema?".
    expect(bn.rotulosSumidos, "rótulo que não é `.sr-only` tem de ter largura: apertada em 200px "
      + "a `pill` deixava o rótulo do atual em ZERO e ele sumia da tela").toEqual([]);
    expect(bn.ponto.temTexto, "sem número não há texto: é ponto").toBe(false);
    expect(bn.ponto.redondo, "e o ponto é redondo").toBe(true);
    expect(bn.ponto.largura, "o ponto é bem menor que o ícone")
      .toBeLessThan(bn.ponto.iconeLargura / 2);
    expect(bn.realce.flatItem, "flat: o item atual NÃO tem fundo — 3 dos 4 aplicativos")
      .toBe("rgba(0, 0, 0, 0)");
    expect(bn.realce.flatMarca, "flat: nem a caixa do ícone").toBe("rgba(0, 0, 0, 0)");
    expect(bn.realce.flatCor, "flat: o que marca o atual é a COR").not.toBe(bn.realce.flatComumCor);
    expect(bn.realce.superficieItem, "surface: o item inteiro NÃO se pinta — pintar tudo não "
      + "existe em aplicativo nenhum dos quatro").toBe("rgba(0, 0, 0, 0)");
    expect(bn.realce.superficieMarca, "surface: quem se pinta é a caixa do ÍCONE (o WhatsApp)")
      .not.toBe("rgba(0, 0, 0, 0)");
    expect(bn.realce.rotuloForaDaMarca, "surface: e o rótulo fica FORA dela, embaixo").toBe(true);
    for (const [onde, c] of Object.entries(bn.contraste)) {
      expect(c.texto, `${onde}: o número dentro do acessório tem de ser LEGÍVEL (AA, 4.5:1)`)
        .toBeGreaterThanOrEqual(4.5);
    }
    // O 3:1 DE SEPARAÇÃO vale onde o defeito existe: sobre PREENCHIMENTO SÓLIDO. Foi ali que o
    // Victor viu o contador sumir — badge primário sobre botão primário media contraste 1 —, e é
    // ali que ele continua sendo cobrado: no `circle-bold` e no `.btn-primary`.
    // Sobre o realce TINGIDO do `pill`/`subtle` (amarelo a 12%) a conta não diz o mesmo: o fundo
    // do item é quase o fundo da barra, então medir o contador contra ele é medi-lo contra a
    // barra — que é o caso comum de qualquer contador, em qualquer lugar, e não o defeito que
    // esta trava nasceu para pegar. Medido em 20/08/2026 com badge `danger solid`: 2,38 no tema
    // claro, e a tela mostra um disco vermelho legível sobre amarelo pálido. Subir a tinta para
    // 22% foi tentado e PIOROU — aproximar o fundo do tom do contador não separa, aproxima.
    for (const onde of ["circle-bold", "botao"] as const) {
      expect(bn.contraste[onde].contra, `${onde}: sobre preenchimento sólido o acessório tem de `
        + "se separar — sem isso ele existe no DOM e não na tela").toBeGreaterThanOrEqual(3);
    }

    // ══ A LATERAL FLUTUA POR PADRÃO, E A RENTE É A VARIANTE (20/08/2026) ═══════════════
    // O PADRÃO É O QUE ESTA TRAVA EXISTE PARA SEGURAR. Em 18/08 ela travou o padrão invertido e
    // passou verde enquanto as 106 páginas do catálogo perdiam o flutuante: trava só vale se
    // estiver apontada para o lado certo. `flutua` é a lateral SEM classe de variante — ou seja,
    // é o padrão que está sendo medido aqui, não uma variante pedida.
    const lv = m.lateralVariantes;
    expect(lv.flutua.margem, "o PADRÃO flutua: ele tem margem, e é a identidade desta casa")
      .toBeGreaterThan(0);
    expect(lv.flutua.raio, "e tem raio de card").toBeGreaterThan(0);
    expect(lv.flutua.bordaEsquerda, "e borda nos quatro lados").toBeGreaterThan(0);
    expect(lv.rente.margem, "rente NÃO tem margem — ela encosta na borda, que é o que Cloudflare, "
      + "Sophos, o app do Claude e o painel do HeroUI fazem").toBe(0);
    expect(lv.rente.raio, "e não tem raio: painel rente não é card").toBe(0);
    expect(lv.rente.bordaEsquerda, "nem borda do lado de fora").toBe(0);
    expect(lv.rente.bordaDireita, "o que separa do conteúdo é UM TRAÇO, não um vão")
      .toBeGreaterThan(0);
    // Se as duas medirem igual, a prop é enfeite — a mesma regra das variantes da barra inferior.
    expect(lv.flutua.margem, "e as duas TÊM de medir diferente, senão a prop é enfeite")
      .toBeGreaterThan(lv.rente.margem);
    expect(lv.flutua.raio, "idem no raio").toBeGreaterThan(lv.rente.raio);
    // A ARMADILHA QUE FOI MAPEADA ANTES DE EXISTIR: com o painel em raio 0, a conta concêntrica
    // daria NEGATIVO. Ela não dá, porque o `calc()` é contra `--radius-card` e não contra o raio
    // do painel — e as linhas continuam arredondadas dentro do painel reto, como nas referências.
    expect(lv.rente.raioDaLinha, "a linha mantém o raio dela mesmo no painel reto — a conta é "
      + "contra o token do card, não contra o raio do painel").toBeGreaterThan(0);
    expect(lv.rente.raioDaLinha, "e é o MESMO raio nas duas variantes: o que muda é o painel")
      .toBe(lv.flutua.raioDaLinha);

    // ══ A LATERAL CABE NO CONTAINER (18/08/2026) ═══════════════════════════════════════
    const lat = m.lateralNoContainer;
    expect(lat.transborda, "a lateral NÃO pode transbordar o container: a altura dela é calculada "
      + "em `100vh`, e sozinha isso a faz presumir que é dona da tela — era 818px dentro de 272px "
      + "na prévia, cortada e sem nem rolar").toBe(false);
    expect(lat.alturaDaLateral, "e ela cabe dentro do palco, com a própria margem descontada")
      .toBeLessThanOrEqual(lat.alturaDoPalco);
    expect(lat.rolaPorDentro, "o que sobra rola POR DENTRO — é o intento da altura cheia, e ele "
      + "não pode se perder junto com o teto").toBe("auto");

    // ══ A RÉGUA (18/08/2026) ═══════════════════════════════════════════════════════════
    const sep = m.separator;
    expect(sep.hzTag, "é `<hr>` nativo — o papel vem do elemento, não de um atributo").toBe("HR");
    expect(sep.hzAltura, "a horizontal desenha um fio de 1px").toBeCloseTo(1, 1);
    expect(sep.hzLargura, "e atravessa a largura").toBeGreaterThan(0);
    expect(sep.hzFundo, "ela pinta com `background` na cor de borda — `border` faria a espessura "
      + "depender de qual lado alguém escreveu").toBe(sep.corDaBorda);
    expect(sep.hzMargem, "a margem que o navegador dá ao `<hr>` tem de estar zerada, senão a régua "
      + "chega com folga que ninguém pediu").toBe("0px");
    expect(sep.hzBorda, "e a borda do navegador também").toBe(0);
    // O CASO QUE ENGANA: num pai sem altura própria, sem piso ela mede ZERO e desaparece.
    expect(sep.vtLargura, "a vertical é um fio de 1px de largura").toBeCloseTo(1, 1);
    expect(sep.vtAltura, "no flex row ela estica pela altura dos irmãos").toBeGreaterThan(0);
    // O CASO QUE PROVA O PISO. Sem `min-height`, `height:auto` num `<hr>` vazio dentro de um pai
    // que não é flex dá ZERO: ela existe no DOM e não na tela.
    expect(sep.vtSoltaAltura, "e tem altura TAMBÉM num pai que não é flex, onde `align-self` não "
      + "faz nada — é aqui que o piso é a única coisa que a mantém visível").toBeGreaterThan(0);
    // ARIA redundante é pior que ARIA nenhuma: o papel já é horizontal por padrão.
    expect(sep.hzOrientacao, "a horizontal NÃO escreve aria-orientation").toBeNull();
    expect(sep.vtOrientacao, "a vertical escreve").toBe("vertical");

    // ══ A LINHA DE LISTA TOCÁVEL (18/08/2026, §4.3 do CONSUMIDOR-1) ══════════════
    // Todo número abaixo foi medido no navegador ANTES de virar asserção.
    const nl = m.navList;
    expect(nl.listaFundo, "a lista NÃO pinta superfície — quem agrupa é o Card, de fora; repintar "
      + "aqui seria um segundo lugar para a mesma coisa").toBe("rgba(0, 0, 0, 0)");
    expect(nl.listaMarcador, "e não é lista com marcador: as linhas são o desenho").toBe("none");
    expect(nl.linhaDirecao, "a linha é LINHA — ícone, texto, valor e seta lado a lado").toBe("row");
    expect(nl.linhaAltura, "o alvo de dedo usa a altura de controle GRANDE, como a barra inferior")
      .toBe(nl.controlLg);
    expect(nl.linhaRaio, "o realce da linha é a PÍLULA da casa, e é por isso que não há traço "
      + "divisor: os dois se contradizem").toBe(nl.raioControle);

    // O CORAÇÃO DA PELE: quem cede espaço. Com o `min-width:0` ausente no texto, o rótulo longo
    // empurra o valor e a seta para fora da linha em vez de reticenciar — e aí o valor mente e a
    // seta desaparece. As três asserções abaixo são uma medida só, vista de três lados.
    expect(nl.rotuloCortado, "com rótulo longo é o TEXTO que reticencia").toBe(true);
    expect(nl.rotuloTemLargura, "mas ele não pode virar zero — sumir é pior que cortar, foi o "
      + "defeito que a `pill` da barra inferior pagou hoje").toBeGreaterThan(0);
    expect(nl.valorInteiro, "o valor NUNCA é cortado: um \"R$ 1.2\" no lugar de \"R$ 1.234\" mente")
      .toBe(true);
    expect(nl.valorLargura, "e o valor existe na tela, não só no DOM").toBeGreaterThan(0);
    expect(nl.setaLargura, "a seta também não encolhe — cortada, deixa de dizer que a linha abre")
      .toBeGreaterThan(0);
    expect(nl.setaDepoisDoValor, "a seta vem DEPOIS do valor, no fim da linha").toBe(true);
    expect(nl.setaEUltima, "e é o último elemento — se ela vier antes, o valor deixa de ser o "
      + "acessório e passa a parecer parte do destino").toBe(true);

    // A segunda linha veio da MUI. Se desenhar igual ao rótulo, ela é enfeite.
    expect(nl.descFonte, "a segunda linha é MENOR que o rótulo").toBeLessThan(nl.rotuloFonte);
    expect(nl.descCor, "e apagada — ela é contexto, não título").toBe(nl.mutedCor);

    // Linha indisponível: apagada, e AINDA focável. `:disabled` tira da ordem de foco e quem usa
    // teclado nunca descobre que a linha existe — a medição está no core, ao lado de `.btn:disabled`.
    expect(nl.inerteOpacidade, "a linha indisponível se apaga").toBeLessThan(1);
    expect(nl.inerteTemAtributoDisabled, "mas NÃO leva o atributo `disabled`: com ele o teclado "
      + "nunca chega na linha e o usuário não descobre que ela existe").toBe(false);
    expect(nl.inerteEhBotao, "e ela é botão, porque link desabilitado não existe em HTML")
      .toBe("BUTTON");

    // O PAINEL APERTADO. Sem esta regra o realce da linha flutua no meio do card: era 88% da
    // largura, e o texto começava a 65px da borda. `--card-pad` é padding de CONTEÚDO; lista de
    // linhas tocáveis quer outra escala — é a anatomia dos `NavigationMenu` que o Victor mandou.
    expect(nl.painelPadding, "o painel que contém a lista aperta o padding — 20px de conteúdo faz "
      + "o realce flutuar no meio da caixa").toBeLessThan(nl.cardPad);
    expect(nl.pctDaLargura, "e a linha PREENCHE o painel; 88% era o defeito que ele viu no print")
      .toBeGreaterThanOrEqual(95);

    // A CONTA CONCÊNTRICA (18/08/2026). O erro era 8,8px com a pílula; a conta zera sempre.
    expect(nl.concentrico.erro, "raio da linha + padding do painel tem de dar o raio do painel — "
      + "senão a curva da linha e a do painel divergem, e o vão deixa de ser constante. Era 8,8px "
      + "de erro com `--radius-control`, porque `999px` desenha metade da ALTURA e muda quando a "
      + "linha ganha segunda linha de texto").toBeCloseTo(0, 0);
    expect(nl.concentrico.raioDaLinha, "e a linha não pode voltar a ser pílula: com duas linhas de "
      + "texto a pílula passa de 26px e estoura a conta")
      .toBeLessThan(nl.concentrico.raioDoPainel);

    // A seta é do DESTINO, não da linha (18/08/2026, achado olhando o catálogo).
    expect(nl.setas, "só a linha com destino leva seta — a de ação não abre nada")
      .toBe(nl.linhasComDestino);
    expect(nl.linhas, "e o fixture tem MAIS linhas que destinos, senão a asserção acima passa de "
      + "graça").toBeGreaterThan(nl.linhasComDestino);
    expect(nl.setaNaLinhaDeAcao, "a linha sem destino não tem seta").toBe(false);

    // O alvo de 44px não se emula neste navegador (`pointer:coarse` não entra por `emulateMedia`),
    // então se cobra na DECLARAÇÃO — o mesmo caminho do `env(safe-area-inset-bottom)` acima, e
    // pelo mesmo motivo. Apagou a linha do bloco `coarse`, esta asserção reprova.
    expect(nl.alvoCoarse, "em ponteiro grosseiro a linha inteira cresce para o alvo de toque, e a "
      + "regra tem de estar no bloco `(pointer:coarse)` que JÁ existe — não num bloco novo")
      .toContain("--target-min");

    // ══ Parte E, item E13 — os 53 que faltavam ═════════════════════════════════════════
    // Todo número abaixo foi medido no navegador ANTES de virar asserção. O que cada uma
    // cobra é o EFEITO, porque o check 18 já aprova regra vazia — é a razão deste arquivo.
    const e = m.e13;

    // 26. Feedback: cada um é uma CAIXA. Sem regra, viram texto solto no fluxo.
    expect(e.alerta.display, "o Alert é grid de 3 colunas, não texto corrido").toBe("grid");
    expect(e.alerta.raio, "o Alert usa --radius-lg").toBe(e.alerta.radiusLg);
    expect(e.alerta.pad, "sem padding o texto cola na borda").toBeGreaterThan(0);
    expect(e.alerta.bordaDanger, "a variante colore a BORDA — danger e warning não podem medir igual")
      .not.toBe(e.alerta.bordaAlerta);
    // 26b. Toast: o tipo publicado tem de PINTAR. As quatro classes não existiam no core até
    // 16/08/2026 — `AureaToastType` prometia quatro faces e as quatro mediam igual à base.
    expect(new Set(e.toast.bordas).size, "as quatro faces do toast têm de ter bordas DISTINTAS")
      .toBe(4);
    expect(e.toast.fundos.every(f => f !== e.toast.baseFundo),
      "cada face do toast muda o fundo em relação à base — classe emitida sem regra é o defeito")
      .toBe(true);
    expect(e.toast.bordas.every(b => b !== e.toast.baseBorda),
      "cada face do toast tinge a borda em relação à base").toBe(true);
    expect(e.badge.raio, "o Badge é pill: --radius-control").toBe(e.badge.radiusControl);
    expect(e.badge.entrelinha, "o Badge fixa line-height (achado A2: ele media duas alturas)")
      .not.toBe("normal");
    expect(e.banner.raio, "o Banner é superfície flutuante: --radius-card").toBe(e.banner.radiusCard);
    expect(e.banner.colunas, "3 colunas — ícone, corpo, dispensar — e elas se mantêm sem ícone")
      .toBe(3);
    expect(e.skeleton.anima, "o Skeleton sem animação é um retângulo cinza parado").not.toBe("none");
    expect(e.skeleton.bg, "o Skeleton precisa de superfície própria").not.toBe("rgba(0, 0, 0, 0)");
    expect(e.progresso.over, "sem overflow:hidden o preenchimento vaza da pílula").toBe("hidden");
    expect(e.progresso.preenchidoW, "value=64 desenha ~64% da barra")
      .toBeCloseTo(e.progresso.trilhoW * 0.64, 0);
    expect(e.kpi.raio, "o KPI é um Card: --radius-card").toBe(e.kpi.radiusCard);

    // 27. Layout e primitivas.
    expect(e.cluster.display, "o Cluster é flex").toBe("flex");
    expect(e.cluster.quebra, "o Cluster QUEBRA — sem isso ele é a fonte mais barata de rolagem lateral")
      .toBe("wrap");
    expect(e.kbd.fonte, "o Kbd usa a fonte de código").toContain("IBM Plex Mono");
    expect(e.kbd.borda, "o Kbd é uma tecla: tem borda").toBeGreaterThan(0);

    // 28. Formulários: hint, erro e rótulo não podem medir a mesma cor — foi o achado A12.
    expect(e.field.hintCor, "hint e erro descrevem coisas diferentes e não podem parecer iguais")
      .not.toBe(e.field.erroCor);
    expect(e.field.erroCor, "o erro se distingue do rótulo").not.toBe(e.field.rotuloCor);
    expect(e.field.gap, "o Field empilha com respiro").toBeGreaterThan(0);
    expect(e.textarea.resize, "o Textarea cresce só na vertical — na horizontal quebraria o layout")
      .toBe("vertical");
    expect(e.marca.w, "a marca de controle é quadrada e visível").toBeGreaterThan(0);
    expect(e.marca.h, "a marca de controle tem altura").toBe(e.marca.w);
    expect(e.marca.raio, "a do Checkbox é arredondada, não redonda").toBeLessThan(e.marca.w / 2);
    expect(e.marca.radioRedondo, "a do Radio é REDONDA (50% resolve acima da metade da largura)")
      .toBeGreaterThanOrEqual(e.marca.radioW / 2);
    expect(e.switchT.pilula, "o trilho do Switch é pílula").toBe(true);
    expect(e.select.alt, "o Select mede --control-h-md, como os outros controles")
      .toBe(e.select.controlMd);
    expect(e.select.raio, "o Select é pill").toBe(e.select.radiusControl);
    expect(e.select.seta, "sem a seta desenhada o <select> fica com o widget do sistema").toBe(true);
    expect(e.segmented.raio, "o SegmentedControl é pill").toBe(e.segmented.radiusControl);
    expect(e.segmented.botoesNaLinha, "os segmentos ficam na mesma linha").toBe(true);
    expect(e.combobox.chipsQuebra, "os chips do MultiCombobox quebram em vez de empurrar a caixa")
      .toBe("wrap");
    expect(e.dropzone.tracejada, "a área de soltar arquivo é tracejada — é o sinal de alvo de drop")
      .toBe("dashed");
    expect(e.dropzone.raio, "e é superfície flutuante").toBe(e.dropzone.radiusCard);

    // 29. Ações.
    expect(e.iconBtn.quadrado, "o IconButton é QUADRADO: ícone sem rótulo não pode virar cápsula")
      .toBe(true);
    expect(e.iconBtn.w, "e mede --control-h-md, como o Button de texto").toBe(e.iconBtn.controlMd);
    expect(e.btnGroup.naLinha, "o ButtonGroup alinha os botões numa fila").toBe(true);
    expect(e.toolbar.raio, "a Toolbar é pill").toBe(e.toolbar.radiusControl);
    expect(e.toolbar.grupoGap, "o ToolbarGroup usa --space-1 — era `gap:4px` cru até o item E12")
      .toBe(e.toolbar.space1);
    expect(e.toolbar.sepW, "o separador é uma linha de 1px").toBeGreaterThan(0);
    expect(e.toolbar.sepH, "e ele ATRAVESSA a barra — sem align-self:stretch mede 0")
      .toBeGreaterThan(20);
    expect(e.toolbar.sepCor, "e tem cor, senão é um espaço em branco").not.toBe("rgba(0, 0, 0, 0)");
    expect(e.pagination.alinha, "a Pagination centraliza verticalmente").toBe("center");
    expect(e.pagination.naLinha, "botões e contador ficam na mesma fila").toBe(true);

    // 30. Dados e navegação.
    expect(e.tabela.regiaoOver, "a região da tabela rola — é o que a torna alcançável por teclado")
      .toBe("auto");
    expect(e.tabela.colapso, "a tabela colapsa as bordas").toBe("collapse");
    expect(e.tabela.alturaLinha, "a linha mede --row-h").toBe(e.tabela.rowH);
    expect(e.tabela.alinhamento, "o cabeçalho alinha ao INÍCIO, não à esquerda — RTL depende disso")
      .toBe("start");
    expect(e.tabela.divisoria, "há divisória entre linhas (a última perde a dela de propósito)")
      .toBeGreaterThan(0);
    expect(e.breadcrumb.naLinha, "o Breadcrumb alinha rótulos e chevrons pelo centro").toBe(true);
    expect(e.tabs.raio, "a lista de abas é pill").toBe(e.tabs.radiusControl);
    expect(e.tabs.tabRaio, "e cada aba também").toBe(e.tabs.radiusControl);
    expect(e.tabs.tabsNaLinha, "as abas ficam na mesma linha").toBe(true);
    expect(e.toc.rotuloCaixaAlta, "o rótulo do índice é caixa alta").toBe("uppercase");
    expect(e.toc.subRecuo, "o item aninhado recua — é o único sinal de nível").toBeGreaterThan(0);
    expect(e.toc.atualCor, "o item atual se distingue dos demais").not.toBe(e.toc.comumCor);
    expect(e.tree.marcador, "a árvore é <ul> e não mostra as bolinhas do navegador").toBe("none");
    expect(e.tree.recuo, "nem os 40px de recuo do UA").toBe(0);
    expect(e.tree.noRaio, "o nó tem cápsula própria para o realce de seleção").toBeGreaterThan(0);
    expect(e.topbar.raio, "o Topbar é superfície flutuante").toBe(e.topbar.radiusCard);
    expect(e.topbar.alt, "e mede --topbar-height").toBe(e.topbar.topbarH);

    // 31. Código, comunicação e mídia.
    expect(e.codeBlock.fonte, "o CodeBlock usa a fonte de código").toContain("IBM Plex Mono");
    expect(e.codeBlock.over, "código longo rola dentro do bloco em vez de esticar a página")
      .toBe("auto");
    expect(e.codeBlock.botaoPos, "o botão de copiar flutua sobre o código").toBe("absolute");
    // 32. LogStream — o achado do item E13, e ele estava em DUAS metades.
    //     A pele do log é de três colunas (hora | nível | texto) e o componente emitia DUAS,
    //     então o texto caía na coluna do nível, com 72px de largura. E a prop `level` não
    //     pintava nada: o core estilizava `.log-level.error` (um elemento) enquanto o React
    //     escrevia `log-error` (no container). Gate nenhum via — o check 18 só enxerga classe
    //     LITERAL, e `log-${level}` é template.
    expect(e.log.nivelExiste, "a linha do log tem célula de NÍVEL — sem ela a prop `level` não "
      + "pinta nada, porque o core estiliza .log-level e o React escrevia só log-error no container")
      .toBe(true);
    expect(e.log.filhos, "a linha tem TRÊS células; com duas o texto cai na coluna do nível")
      .toBe(3);
    expect(e.log.textoW, "e o texto fica na coluna larga — media 72px antes da correção")
      .toBeGreaterThan(200);
    expect(e.log.erroCor, "o nível `error` tem de PINTAR — era a mesma cor da linha normal")
      .not.toBe(e.log.normalCor);
    expect(e.log.fonte, "o log usa a fonte de código").toContain("IBM Plex Mono");
    expect(e.mensagem.balaoRaio, "o balão de mensagem tem cápsula própria").toBeGreaterThan(0);
    expect(e.mensagem.balaoBg, "e superfície própria, senão a mensagem some no fundo")
      .not.toBe("rgba(0, 0, 0, 0)");
    expect(e.mensagem.composerNaLinha, "campo e botão de envio ficam na mesma linha").toBe(true);
    expect(e.media.shellRaio, "o player é superfície flutuante").toBe(e.media.radiusCard);
    expect(e.media.over, "e recorta o vídeo no raio — sem isso o canto vaza").toBe("hidden");
    // 33b. O aperto dos controles responde ao PLAYER, não à janela — item D3. Este é o teste
    //      que separa as duas coisas: a janela tem ~900px, então um `@media (max-width:400px)`
    //      não dispararia em nenhum dos dois players. Se alguém trocar o `@container` por
    //      breakpoint de viewport, o estreito para de quebrar e esta asserção reprova.
    // 33b. O aperto dos controles do player é `@container`, não breakpoint de viewport — item
    //      D3 (08/08/2026). NÃO há asserção de efeito aqui, e a ausência é deliberada: com só o
    //      core, `.media-player` tem `aspect-ratio:16/9` e `min-height:360px`, então ele não fica
    //      abaixo de 640px de largura nesta página de 900px — o contêiner nunca chega a 400 e um
    //      fixture que fingisse chegar estaria medindo o próprio fixture.
    //      Quem pega a regressão é o **check 4b** do `validate.py`, e ele é mais forte que uma
    //      captura: com `LEGACY_BP` vazia desde o item D3, trocar o `@container` de volta por
    //      `@media (max-width:400px)` reprova o build inteiro, porque 400 não está na escala.
    //      Provado contra o defeito em 08/08/2026.
    //      O efeito foi conferido no navegador, na página real: em 375px o player mede 243px, o
    //      `container-type` é `inline-size` e os controles recebem os 44px de `--target-min`.
    expect(e.notificacao.painelRaio, "o painel de notificações é superfície flutuante")
      .toBe(e.notificacao.radiusCard);
    expect(e.notificacao.listaMarcador, "a lista não mostra as bolinhas do navegador").toBe("none");
    expect(e.notificacao.listaRecuo, "nem o recuo do UA").toBe(0);
    expect(e.notificacao.pontoW, "o ponto de não-lida existe").toBeGreaterThan(0);

    // 33. Subpath próprio.
    expect(e.datagrid.wrapOver, "a grade rola dentro da moldura").toBe("auto");
    expect(e.datagrid.wrapRaio, "e a moldura é superfície flutuante").toBe(e.datagrid.radiusCard);
    expect(e.datagrid.ordenavelCursor, "o cabeçalho ordenável se anuncia como alvo").toBe("pointer");
    expect(e.datagrid.filtroPadIn, "a linha de filtro alinha com a coluna porque herda o recuo da célula").toBe(e.datagrid.cabecPadIn);
    expect(e.datagrid.painelRaio, "o painel de detalhe é superfície flutuante, como card e diálogo").toBe(e.datagrid.radiusCard);
    expect(e.datagrid.painelDir, "e fica AO LADO da lista, não por cima — é o ponto do item").toBe(true);
    expect(e.datagrid.listaVisivel, "com a lista ainda ocupando largura").toBe(true);
    expect(e.datagrid.esqueletoAlt, "o esqueleto da linha de carregamento tem altura — sem ela a linha some").toBeGreaterThan(8);
    expect(e.datagrid.alcaCursor, "a alça de redimensionar se anuncia como alvo de arrasto").toBe("col-resize");
    expect(e.datagrid.alcaAltura, "e cobre a altura toda da célula — alça curta é alvo que ninguém acerta").toBe(e.datagrid.cabecAltura);
    expect(e.datagrid.fixo.rolou, "a fixture precisa MESMO rolar, senão o teste do cabeçalho fixo não mede nada").toBe(true);
    expect(e.datagrid.fixo.depois, "o cabeçalho fica onde estava enquanto o corpo rola por baixo").toEqual(e.datagrid.fixo.antes);
    expect(e.datagrid.fixo.degrau, "e a linha de filtro gruda exatamente uma altura de linha abaixo dele").toBe(e.datagrid.fixo.rowH);
    expect(e.datagrid.loteRaio, "a barra de lote chega ao consumidor como superfície em pílula, só com o core").toBe(e.datagrid.radiusControl);
    expect(e.datagrid.loteFundo, "e com fundo próprio — barra sem superfície some dentro da página").not.toBe("rgba(0, 0, 0, 0)");
    expect(e.datagrid.loteBotoes, "a ação declarada mais o limpar: sem o limpar a seleção vira armadilha").toBe(2);
    expect(e.datagrid.filtroCaixa, "e não herda a caixa alta do cabeçalho — sem isto se digita em MAIÚSCULAS").toBe("none");
    expect(e.datagrid.campoGap, "o rótulo da faceta é só para leitor de tela: o vão dele sai, senão são 7px de nada").toBe(0);
    expect(e.datagrid.controles[1].top, "os dois controles do filtro começam na mesma linha, medindo alturas diferentes").toBe(e.datagrid.controles[0].top);
    expect(e.agentes.cardRaio, "o cartão de agente é superfície flutuante, como todo card").toBe(e.agentes.radiusCard);
    expect(e.agentes.capRaio, "e a capacidade é pílula, como todo controle textual da Aurea").toBe(e.agentes.radiusControl);
    expect(e.agentes.statusPonto, "o Status reusado mantém o ponto dele dentro do cartão").toBeGreaterThan(0);
    expect(e.agentes.cabecFlex, "o cabeçalho do cartão põe retrato, nome e estado na MESMA linha").toBe("flex");
    expect(e.agentes.capsQuebra, "e as capacidades quebram em vez de rolar para fora do cartão").toBe("wrap");
    expect(e.agentes.pontoEvento, "o ponto do evento mede igual ao ponto do Status — mesma coisa, mesmo tamanho").toBe(e.agentes.pontoStatus);
    expect(e.agentes.eventoGrave, "e a gravidade muda o ponto").not.toBe(e.agentes.eventoInfo);
    expect(e.agentes.spanRecuo2, "o span aninhado recua — é como a cascata mostra quem chamou quem").toBeGreaterThan(e.agentes.spanRecuo0);
    expect(e.agentes.barraErro, "e a barra que falhou não se confunde com a que passou").not.toBe(e.agentes.barraOk);
    expect(e.agentes.saudeColunas, "a matriz de saúde é grade de VÁRIAS colunas, não uma lista").toBeGreaterThan(1);
    expect(e.agentes.ordemBotoes, "negar vem ANTES de aprovar: a ação destrutiva não é a primeira do foco").toEqual(["Deny", "Approve"]);
    expect(e.agentes.acoesFim, "e as duas ficam no fim da linha, longe do texto que se acabou de ler").toBe("flex-end");
    expect(e.agentes.escopoVisivel, "o escopo da ferramenta é VISÍVEL — conceder /etc achando que é /docs é o defeito").toBe(true);
    expect(e.agentes.escopoFonte, "e sai na monoespaçada do sistema, porque caminho não é prosa").toBe(e.agentes.monoToken);
    expect(e.agentes.permLinha, "nome e escolha na mesma linha").toBe("flex");
    expect(e.agentes.passoBordaRod, "o passo rodando se distingue do concluído pela borda").not.toBe(e.agentes.passoBordaOk);
    expect(e.agentes.passoFundo, "e o estado NÃO vira fundo colorido, que competiria com o texto do passo").toBe("rgba(0, 0, 0, 0)");
    expect(e.agentes.tarefaRaio, "a tarefa da fila é superfície flutuante, como card").toBe(e.agentes.radiusCard);
    expect(e.agentes.tarefaLinha, "e título, prioridade e estado ficam na mesma linha").toBe("flex");
    expect(e.agentes.rotuloCaixa, "o rótulo de seção do inspetor é caixa alta, como todo cabeçalho de grupo").toBe("uppercase");
    expect(e.agentes.trilhaUso, "os dois medidores medem igual — consumo e rastro são ambos `meter`").toBe(e.agentes.trilhaRastro);
    expect(e.agentes.trilhaCusto, "e o do orçamento também: três alturas diferentes leriam como três coisas").toBe(e.agentes.trilhaRastro);
    expect(e.agentes.barraMaior, "a barra é FATIA de verdade: quem consumiu mais desenha maior").toBeGreaterThan(e.agentes.barraMenor);
    // Numa caixa de 260px o rótulo não pode comer a coluna do dado. A asserção é sobre a RAZÃO
    // porque a versão anterior — "a maior é maior que a menor" — passava com 1px contra 0px.
    expect(e.agentes.estreitoTrilhaUso, "num painel estreito a trilha do consumo tem PISO (8rem)").toBeGreaterThanOrEqual(120);
    expect(e.agentes.estreitoTrilhaRastro, "e a da cascata também — foi ela que desenhou 24px em 09/08").toBeGreaterThanOrEqual(120);
    expect(e.agentes.estreitoBarraUso / e.agentes.estreitoTrilhaUso, "e 900 de 1000 desenha 90% da trilha, não 90% de nada").toBeGreaterThan(0.85);
    expect(e.agentes.estreitoRotulo, "quem cede é o RÓTULO, que já trunca com reticência").toBeLessThan(e.agentes.estreitoTrilhaUso);
    expect(Number(e.agentes.pesoTotal), "o número total se destaca pelo PESO, porque a escala da Aurea não tem degrau de display").toBeGreaterThan(Number(e.agentes.pesoBase));
    // O limite brando NÃO tem cor: no tema escuro `--warning-400` é o próprio amarelo da
    // marca, igual a `--primary`, então a barra de aviso sairia idêntica à normal. Ele fala
    // por palavra — e é isso que se mede aqui, nos dois temas.
    expect(e.agentes.custoPerto, "passar do limite brando não repinta a barra, porque no escuro o aviso É o amarelo da marca").toBe(e.agentes.custoSob);
    expect(e.agentes.avisoPerto, "quem avisa é o alerta, em PALAVRA").toBe(true);
    expect(e.agentes.avisoSob, "e ele não existe enquanto o gasto está sob o teto").toBe(false);
    expect(e.agentes.avisoAcima, "estourar o rígido troca o alerta de aviso para perigo").not.toBe(e.agentes.alertaPerto);
    expect(e.agentes.custoAcima, "e aí sim a barra muda — o vermelho separa nos dois temas").not.toBe(e.agentes.custoSob);
    expect(e.agentes.custoFundo, "mas o cartão do orçamento estourado continua sendo um cartão: o estado não vira fundo colorido").toBe(e.agentes.cartaoFundo);
    expect(e.agentes.razaoLinhas, "o razão é apende-só: a linha esquecida CONTINUA na lista").toBe(2);
    expect(e.agentes.razaoRiscado, "e ela vem riscada").toBe("line-through");
    expect(e.agentes.razaoNormal, "enquanto a guardada não").toBe("none");
    expect(e.agentes.razaoRaio, "cada lançamento é superfície flutuante, como a tarefa da fila").toBe(e.agentes.radiusCard);
    expect(e.agentes.recadoBordaErro, "o recado que falhou se distingue pela BORDA").not.toBe(e.agentes.recadoBordaOk);
    expect(e.agentes.recadoFundoErro, "e NÃO por fundo colorido, que disputaria leitura com o texto do recado").toBe(e.agentes.recadoFundoOk);
    expect(e.agentes.regraDesligadaExiste, "a regra desligada CONTINUA no cartão — quem precisa religar tem de achá-la").toBe(true);
    expect(e.agentes.regraDesligada, "ela recua no texto").not.toBe(e.agentes.regraLigada);
    expect(e.agentes.regraFundoDesligada, "e o cartão dela continua sendo um cartão igual ao da ligada").toBe(e.agentes.regraFundoLigada);
    expect(e.agentes.grafoRaio, "a tela do grafo é superfície flutuante, como todo cartão").toBe(e.agentes.radiusCard);
    expect(e.agentes.noRaio, "e o NÓ também — é aqui que ele deixa de parecer React Flow (lá o raio é 3px)").toBe(e.agentes.radiusCard);
    expect(e.agentes.noBordaSel, "o nó selecionado muda a borda").not.toBe(e.agentes.noBorda);
    expect(e.agentes.tipoCaixa, "e o TIPO do nó é texto em caixa alta — a referência pinta dez tipos em dez cores").toBe("uppercase");
    expect(e.agentes.tipoCor, "ele é subordinado ao rótulo, não um segundo destaque").not.toBe(e.agentes.rotuloCor);
    expect(e.qr.quadrado, "o QR é quadrado — deformado ele não escaneia").toBe(true);
    expect(e.qr.raio, "e é superfície flutuante").toBe(e.qr.radiusCard);
    expect(e.qr.modulos, "os módulos do QR são desenhados no servidor").toBeGreaterThan(100);
    // 34. O CodeEditor: aqui se mede a FRONTEIRA, não a pele, e a afirmação é essa mesma.
    //     Ele está declarado em `semRegra` no core-boundary.json porque a pele vive num
    //     StyleModule do CodeMirror, injetado quando a EditorView monta — e num HTML estático
    //     não há montagem. Se um dia alguém escrever `.code-editor` no core, a decisão de
    //     fronteira terá mudado em silêncio, e é isso que esta asserção pega.
    expect(e.codeEditor.regraNoCore, "o core NÃO estiliza .code-editor — a pele é do CodeMirror")
      .toBe(false);
    expect(e.codeEditor.altura, "e por isso, com só o core, ele não tem altura nenhuma").toBe(0);

    // 35. Os seis de portal. Entram como marcação porque `renderToStaticMarkup` não monta
    //     portal — Dialog e Drawer saem com ZERO byte (medido). O que se prova é a REGRA.
    expect(e.dialog.raio, "o Dialog é superfície flutuante").toBe(e.dialog.radiusCard);
    expect(e.dialog.bg, "e tem superfície própria sobre o fundo escurecido")
      .not.toBe("rgba(0, 0, 0, 0)");
    expect(e.dialog.fundoPos, "o fundo do Dialog é fixed").toBe("fixed");
    expect(e.dialog.fundoCobre, "e cobre a janela inteira").toBe(true);
    // ConfirmDialog: a regra é que ele NÃO é uma segunda superfície. Mesmo raio de card, e mais
    // ESTREITO que o Dialog — uma frase e dois botões não pedem a largura dele. O rodapé alinha ao fim
    // porque a ordem é cancelar → agir, e é onde as quatro referências batem.
    // M4: inerte tem de PARECER inerte, e igual ao desabilitado — são o mesmo "não dá".
    expect(e.paleta.colunas, "a linha da paleta tem icone, rotulo e atalho").toBe(3);
    expect(e.paleta.rolaLista, "a lista rola, a caixa nao cresce sem fim").toBe("auto");
    expect(e.paleta.tetoLista, "e tem teto de altura").not.toBe("none");
    expect(e.paleta.mesmaPeleDeMenu, "reusa a pele de `.menu` — nao ha segunda lista").toBe(true);
    // L3. Medido em 15/08/2026 nos dois temas. As duas primeiras asserções são de COMPORTAMENTO
    // vestido de pele: sem `touch-action:none` o navegador rola a página em vez de deixar
    // arrastar, e o componente para de funcionar em toque; e alça menor que 24px reprova o
    // WCAG 2.2 AA (2.5.8) exatamente como o ponto do carrossel reprovaria.
    expect(e.ordenavel.toque, "a alça não deixa o navegador rolar a página no lugar do arrasto").toBe("none");
    expect(e.ordenavel.alcaW, "e é alvo de 24px").toBe(e.ordenavel.space6);
    expect(e.ordenavel.alcaH, "nos dois lados").toBe(e.ordenavel.space6);
    expect(e.ordenavel.cursor, "o cursor diz que aquilo se arrasta — é a única affordance que existe").toBe("grab");
    expect(e.ordenavel.cursorPego, "e muda quando está pego").toBe("grabbing");
    expect(e.ordenavel.display, "a lista é grade").toBe("grid");
    expect(e.ordenavel.marcador, "sem as bolinhas do navegador").toBe("none");
    expect(e.ordenavel.recuo, "nem o recuo do UA").toBe(0);
    expect(e.ordenavel.itemRaio, "cada linha é uma superfície da casa").toBe(e.ordenavel.radiusLg);
    expect(e.ordenavel.itemDisplay, "com alça e rótulo na mesma linha").toBe("flex");
    // O item PEGO se distingue por ELEVAÇÃO e borda, não por cor de fundo: fundo colorido é a
    // quinta recusa da mesma coisa neste repositório, e aqui ela disputaria leitura com o rótulo.
    expect(e.ordenavel.sombraPego, "o item pego se eleva").not.toBe(e.ordenavel.sombraSolto);
    expect(e.ordenavel.bordaPego, "e muda a borda").not.toBe(e.ordenavel.bordaSolto);
    expect(e.ordenavel.fundoPego, "mas continua sendo a mesma superfície — pego não vira fundo colorido")
      .toBe(e.ordenavel.fundoSolto);

    // N1. Medido em 15/08/2026 nos dois temas. As três primeiras são COMPORTAMENTO vestido de
    // pele, e as duas de alvo valem para o lixo também: remover bloco não pode ser alvo menor que
    // reordenar bloco.
    expect(e.blocos.toque, "a alça do bloco não deixa o navegador rolar a página no lugar do arrasto").toBe("none");
    expect(e.blocos.cursor, "o cursor diz que o bloco se arrasta").toBe("grab");
    expect(e.blocos.cursorPego, "e muda quando está pego").toBe("grabbing");
    expect(e.blocos.alcaW, "a alça é alvo de 24px").toBe(e.blocos.space6);
    expect(e.blocos.alcaH, "nos dois lados").toBe(e.blocos.space6);
    expect(e.blocos.lixoW, "e o remover também — o alvo pequeno reprovaria o WCAG 2.2 AA (2.5.8)").toBe(e.blocos.space6);
    expect(e.blocos.lixoH, "nos dois lados").toBe(e.blocos.space6);
    expect(e.blocos.display, "a lista de blocos é grade").toBe("grid");
    expect(e.blocos.marcador, "sem as bolinhas do navegador").toBe("none");
    expect(e.blocos.recuo, "nem o recuo do UA — e este é `<ol>`, onde o recuo é maior").toBe(0);
    expect(e.blocos.itemDisplay, "o bloco é grade de duas colunas: trilho e corpo").toBe("grid");
    expect(e.blocos.itemRaio, "e é a mesma superfície de linha da lista ordenável, não um cartão")
      .toBe(e.blocos.radiusLg);
    // A ASSERÇÃO QUE SÓ EXISTE AQUI. `min-width:0` no corpo é o que faz um filho largo ENCOLHER
    // em vez de furar a coluna do grid; sem ela a página ganha rolagem lateral, que é o defeito
    // que a ADR-0002 proíbe e o `catalog-sweep` reprova. Medir a regra não bastaria — a prova é
    // a figura de verdade caber.
    expect(e.blocos.corpoMin, "o corpo do bloco pode encolher abaixo do conteúdo").toBe("0px");
    expect(e.blocos.corpoEstoura, "e a figura larga cabe na coluna em vez de estourá-la").toBeLessThanOrEqual(0);
    expect(e.blocos.sombraPego, "o bloco pego se eleva").not.toBe(e.blocos.sombraSolto);
    expect(e.blocos.bordaPego, "e muda a borda").not.toBe(e.blocos.bordaSolto);
    expect(e.blocos.fundoPego, "mas continua a mesma superfície — pego não vira fundo colorido")
      .toBe(e.blocos.fundoSolto);

    // L5. Medido em 15/08/2026 nos dois temas: 68ch dão 652,8px, corpo a 16px, entrelinha 27,2.
    expect(e.prosa.fs, "a prosa lê a 16px, e não nos 14 da interface").toBe(e.prosa.textBase);
    expect(e.prosa.lh / e.prosa.fs, "com a entrelinha larga que o token já tinha e ninguém usava").toBeCloseTo(1.7, 2);
    expect(e.prosa.maxW, "e com MEDIDA de linha: o texto para de crescer antes do contêiner").toBeLessThan(700);
    // `toBeCloseTo` e não `toBe`: o `max-width` computado sai arredondado a uma casa (652.8) e a
    // caixa medida vem com a fração inteira (652.796875) — a diferença é serialização, não pele.
    expect(e.prosa.largura, "a medida vale de verdade, não só na folha").toBeCloseTo(e.prosa.maxW, 0);
    expect(e.prosa.tituloFs, "o título de seção usa a escala da casa").toBe(e.prosa.text2xl);
    expect(e.prosa.tituloTopo, "e abre espaço antes de si, que é o que separa seção de parágrafo").toBe(e.prosa.space8);
    expect(e.prosa.citacaoBorda, "a citação tem o fio na borda inicial").toBe(2);
    expect(e.prosa.citacaoRecuo, "e respira depois dele").toBeGreaterThan(0);
    expect(e.prosa.listaRecuo, "a lista tem recuo próprio").toBeGreaterThan(0);
    expect(e.prosa.codigoFs, "código no meio da frase é MENOR que a linha em que está").toBeLessThan(e.prosa.codigoPaiFs);
    expect(e.prosa.codigoFonte, "e é monoespaçado, com a fonte do sistema").toBe(e.prosa.monoToken);
    expect(e.prosa.blocoRola, "o bloco de código rola em vez de estourar a medida").toBe("auto");
    expect(e.prosa.blocoCodigoFundo, "e o código dentro dele não repete a caixa").toBe("rgba(0, 0, 0, 0)");
    // A tabela da prosa NÃO é a tabela de dados: 720px de largura mínima num artigo é o defeito
    // que o calendário sofreu, e caixa alta no cabeçalho é vocabulário de grade, não de texto.
    expect(e.prosa.tabelaMinW, "a tabela do artigo não carrega a largura mínima da grade de dados").toBe(0);
    expect(e.prosa.tabelaCaixaAlta, "nem a caixa alta do cabeçalho dela").toBe("none");
    expect(e.prosa.tabelaPad, "mas tem recuo de célula, que é o que a torna legível").toBeGreaterThan(0);
    // ── A TRAVA DO ITEM, provada contra o defeito ────────────────────────────────────────────
    // Estes três são IRMÃOS da prosa. Se qualquer regra acima perder o escopo, eles mudam.
    expect(e.prosa.foraTabelaMinW, "tabela FORA da prosa não ganha largura mínima nenhuma").toBe(0);
    expect(e.prosa.foraTabelaPad, "nem o recuo de célula da prosa").toBeLessThan(e.prosa.tabelaPad);
    expect(e.prosa.foraCitacaoBorda, "citação fora da prosa não ganha fio").toBe(0);
    expect(e.prosa.foraCitacaoRecuo, "nem recuo").toBe(0);
    expect(e.prosa.foraTituloFs, "e título fora da prosa continua com o tamanho do navegador")
      .not.toBe(e.prosa.tituloFs);

    // L2. Medido em 15/08/2026 nos dois temas, numa caixa de 480px: 3 colunas de 152px.
    expect(e.galeria.display, "a galeria é grade").toBe("grid");
    expect(e.galeria.colunas, "com mais de uma coluna, preenchidas pela largura e não por prop").toBeGreaterThan(1);
    expect(e.galeria.marcador, "e sem as bolinhas de lista do navegador").toBe("none");
    expect(e.galeria.recuo, "nem o recuo do UA").toBe(0);
    expect(e.galeria.ladrilhoCursor, "o ladrilho se anuncia como alvo").toBe("pointer");
    expect(e.galeria.ladrilhoRaio, "e tem o raio da imagem que ele embrulha").toBe(e.galeria.radiusLg);
    expect(e.galeria.fotoQuadrada, "a foto do ladrilho é quadrada por default — grade de proporções mistas é grade torta").toBe(true);
    // O DEFEITO MEDIDO: `.gallery-tile{background:transparent}` vencia `.is-selected` por vir
    // depois com a mesma especificidade, e o escolhido saía sem cápsula — só com o fio. Estas três
    // asserções são o que reprova a volta disso.
    expect(e.galeria.fundoSel, "o escolhido ganha a CÁPSULA da linguagem da casa").not.toBe("rgba(0, 0, 0, 0)");
    expect(e.galeria.fundoSolto, "e quem não está escolhido não tem fundo nenhum").toBe("rgba(0, 0, 0, 0)");
    expect(e.galeria.legendaSel, "a legenda do escolhido muda de cor, como o rótulo da aba ativa").not.toBe(e.galeria.legendaSolta);
    expect(e.galeria.fioAltura, "e o fio amarelo de 2px está lá, o mesmo de toda coisa selecionada").toBe(2);
    expect(e.galeria.legendaFs, "a legenda é texto secundário").toBe(e.galeria.textSm);

    // L4. Medido em 15/08/2026 nos dois temas, numa caixa de 400px e com a imagem AINDA NÃO
    // CARREGADA — que é o único estado em que a caixa reservada importa.
    expect(e.imagem.carregou, "a medição vale porque a imagem NÃO carregou: é aí que a página salta")
      .toBe(false);
    expect(e.imagem.razao169, "com `ratio`, a caixa nasce na proporção pedida").toBe(1.778);
    expect(e.imagem.fit169, "e a foto preenche a caixa, cortando").toBe("cover");
    // O DEFEITO MEDIDO: a regra tinha `aspect-ratio:var(--image-ratio,auto)`, e o `auto` vencia o
    // `auto <width>/<height>` que o navegador deriva dos atributos — 400×0 numa imagem com
    // `width`/`height` e sem `ratio`. A regra contra o salto produzindo o salto. Esta asserção é a
    // que reprova a volta dela.
    expect(e.imagem.alturaIntrinseca, "sem `ratio`, o par width/height ainda reserva altura — e não zero")
      .toBeGreaterThan(0);
    expect(e.imagem.razaoIntrinseca, "na proporção dos atributos (300/200), não numa nossa").toBe(1.5);
    expect(e.imagem.razao11, "1/1 é 1/1").toBe(1);
    expect(e.imagem.fit11, "`contain` mostra a foto inteira").toBe("contain");
    expect(e.imagem.fundo11, "e larga o fundo, senão sobra superfície nas bordas do que não corta")
      .toBe("rgba(0, 0, 0, 0)");
    expect(e.imagem.fundo, "a caixa que espera o byte tem a superfície do esqueleto — marcador sem JavaScript")
      .toBe(e.imagem.surface3);
    expect(e.imagem.raio, "e o raio da imagem é o `--radius-lg`").toBe(e.imagem.radiusLg);
    expect(e.imagem.razaoQuebrada, "a caixa QUEBRADA reserva o mesmo espaço da que carregaria").toBe(1.778);
    expect(e.imagem.displayQuebrada, "ela centra o ícone").toBe("grid");
    expect(e.imagem.fundoQuebrada, "com a mesma superfície").toBe(e.imagem.surface3);
    expect(e.imagem.raioQuebrada, "e o mesmo raio: o erro não muda a forma da página").toBe(e.imagem.radiusLg);

    // L1. Medido em 15/08/2026 nos dois temas, com só o core: trilho 480px, slide 240px
    // (`--carousel-slide:50%`), scrollWidth 996 contra clientWidth 480, ponto 24×24 com miolo de 8.
    expect(e.carousel.rola, "a faixa ROLA de verdade — sem isto o carrossel é uma fila cortada").toBe(true);
    expect(e.carousel.overflowX, "e rola no eixo dela, não na página").toBe("auto");
    expect(e.carousel.encaixe, "o encaixe é do CSS: é ele o motor que a Aurea não escreveu").toBe("inline mandatory");
    expect(e.carousel.alinha, "e cada slide encaixa pela borda inicial").toBe("start");
    expect(e.carousel.animacao, "a animação também é do CSS, para o `prefers-reduced-motion` do core alcançá-la").toBe("smooth");
    expect(e.carousel.display, "os slides ficam em linha").toBe("flex");
    expect(e.carousel.slideW, "quantos aparecem por vez é `--carousel-slide`, e 50% de 480 são 240 — sem prop nenhuma")
      .toBe(e.carousel.trilhoW / 2);
    expect(e.carousel.alvo, "o ponto é alvo de 24px: abaixo disso reprova o WCAG 2.2 AA (2.5.8)").toBe(e.carousel.space6);
    expect(e.carousel.alvoAlt, "nos dois lados").toBe(e.carousel.space6);
    expect(e.carousel.pontoW, "e o DESENHO dele é de 8px, no ::before — alvo grande, marca pequena").toBe(e.carousel.space2);
    expect(e.carousel.pontoRaio, "redondo, não quadrado").toBe("999px");
    expect(e.carousel.pontoAceso, "o ponto do slide atual é o amarelo da marca").toBe(e.carousel.primary);
    expect(e.carousel.pontoApagado, "e os outros não somem: têm a cor da borda, nos dois temas").toBe(e.carousel.borda);
    expect(e.carousel.controles, "as setas e os pontos ficam na mesma linha").toBe("flex");
    expect(e.carousel.setas, "duas setas, e é só isso — a paginação da faixa é a própria rolagem").toBe(2);
    expect(e.form.gap, "o Form empilha com respiro").toBeGreaterThan(0);
    expect(e.form.bg, "e não pinta fundo — arranjo é do Stack e do Grid").toBe("rgba(0, 0, 0, 0)");
    expect(e.form.borda, "nem borda").toBe(0);
    // DataState não é superfície: sem fundo e sem borda. Se ganhar os dois, viram duas caixas
    // para a mesma coisa — o defeito que a `.table-region` cobrou caro.
    expect(e.dataState.bg, "o DataState não pinta fundo próprio").toBe("rgba(0, 0, 0, 0)");
    expect(e.dataState.borda, "nem borda").toBe(0);
    expect(e.dataState.gap, "o que ele faz é empilhar com respiro").toBeGreaterThan(0);
    expect(e.dataState.filhos, "em `stale`, o aviso E o conteúdo — dois filhos, não um").toBe(2);
    expect(e.portao.inertes, "o AccessGate negado produz um botão inerte, sem pele própria")
      .toBeGreaterThanOrEqual(2);
    expect(e.botaoInerte.op, "aria-disabled tem a mesma pele de :disabled")
      .toBe(e.botaoInerte.opDisabled);
    expect(e.botaoInerte.cursor, "e o cursor diz que não dá").toBe("not-allowed");
    expect(e.confirmDialog.raio, "o ConfirmDialog usa a MESMA superfície flutuante do Dialog")
      .toBe(e.confirmDialog.radiusCard);
    expect(e.confirmDialog.largura, "e é mais estreito que o Dialog")
      .toBeLessThan(e.confirmDialog.larguraDoDialog);
    expect(e.confirmDialog.rodapeAlinha, "o rodapé alinha ao fim").toBe("flex-end");
    expect(e.confirmDialog.rodapeGap, "com respiro entre os dois botões").toBeGreaterThan(0);
    expect(e.drawer.pos, "o Drawer é fixed").toBe("fixed");
    expect(e.drawer.colaNaDireita, "e cola na borda direita — é o que o torna gaveta").toBe(true);
    expect(e.drawer.bordaEsq, "com borda no lado que dá para o conteúdo").toBeGreaterThan(0);
    expect(e.popover.raio, "o Popover é superfície flutuante").toBe(e.popover.radiusCard);
    expect(e.popover.maxW, "e tem largura máxima, senão acompanha o gatilho").not.toBe("none");
    expect(e.tooltip.maxW, "a Tooltip tem largura máxima — é um rótulo, não um parágrafo")
      .not.toBe("none");
    expect(e.tooltip.bg, "e superfície própria").not.toBe("rgba(0, 0, 0, 0)");
    expect(e.tooltip.raio, "a Tooltip NÃO usa o raio de card: é pequena e usa o raio menor")
      .toBeLessThan(e.dialog.radiusCard);
    expect(e.menu.itemDisplay, "o item de menu alinha ícone e rótulo").toBe("flex");
    expect(e.menu.itemRaio, "e tem cápsula própria para o realce").toBeGreaterThan(0);
    expect(e.menu.sepH, "o separador do menu é uma linha").toBeGreaterThan(0);
    expect(e.menu.sepCor, "e tem cor").not.toBe("rgba(0, 0, 0, 0)");
  });
}

// ── B-02 · Text, Heading, Paragraph e Code (25/09/2026) ────────────────────────────────────
// O `tipografia.test.tsx` prova o elemento e a classe; aqui se prova que a classe FAZ alguma coisa
// com só o core carregado (QUALITY.md 8b): trocar qualquer regra do bloco TIPOGRAFIA por `{ }`
// reprova. Todo número é lido do token por sonda, e não escrito aqui.
const TIPO = renderToStaticMarkup(h("div", null,
  ...[1, 2, 3, 4, 5, 6].map(n => h(A.Heading, {key: n, level: n as 1, id: `h${n}`}, `Título ${n}`)),
  h(A.Paragraph, {key: "pb", id: "pb"}, "Texto corrido de exemplo."),
  h(A.Paragraph, {key: "ps", id: "ps", size: "sm"}, "Texto pequeno."),
  h(A.Paragraph, {key: "px", id: "px", size: "xs"}, "Texto mínimo."),
  h(A.Text, {key: "tm", id: "tm", color: "muted"}, "apagado"),
  h(A.Text, {key: "tb", id: "tb", weight: "bold"}, "negrito"),
  h(A.Text, {key: "tt", id: "tt", truncate: true}, "uma linha só, cortada com reticências quando não cabe"),
  h(A.Code, {key: "c", id: "c"}, "npm i")));

for (const theme of ["dark", "light"] as const) {
  test(`pele: B-02 · Text, Heading, Paragraph e Code saem do token · ${theme}`, async ({page: p, baseURL}) => {
    const url = `${baseURL}/__tipo-${theme}`;
    await p.route(url, r => r.fulfill({contentType: "text/html; charset=utf-8",
      body: `<!doctype html><html data-theme="${theme}"><head>
        <link rel="stylesheet" href="/packages/fonts/dist/fonts.css">
        <link rel="stylesheet" href="/packages/core/dist/aurea.css"></head>
        <body style="width:600px">${TIPO}</body></html>`}));
    await p.goto(url, {waitUntil: "networkidle"});
    const m = await p.evaluate(() => {
      const cs = (id: string) => getComputedStyle(document.getElementById(id)!);
      const sonda = (css: string, prop: string) => {
        const s = document.createElement("div");
        s.style.cssText = `position:absolute;visibility:hidden;${css}`;
        document.body.append(s);
        const v = getComputedStyle(s).getPropertyValue(prop);
        s.remove();
        return v;
      };
      const px = (token: string) => parseFloat(sonda(`font-size:var(${token})`, "font-size"));
      return {
        titulos: [1, 2, 3, 4, 5, 6].map(n => ({fs: parseFloat(cs(`h${n}`).fontSize), peso: cs(`h${n}`).fontWeight,
          margem: cs(`h${n}`).marginBlockStart})),
        escala: ["--text-4xl", "--text-3xl", "--text-2xl", "--text-xl", "--text-lg", "--text-base"].map(px),
        corpo: ["pb", "ps", "px"].map(id => ({fs: parseFloat(cs(id).fontSize), lh: parseFloat(cs(id).lineHeight),
          margem: cs(id).marginBlockStart})),
        corpoEscala: ["--text-base", "--text-sm", "--text-xs"].map(px),
        relaxada: parseFloat(sonda("line-height:var(--leading-relaxed)", "line-height")) || 0,
        apagado: cs("tm").color, apagadoToken: sonda("color:var(--muted-foreground)", "color"),
        normal: cs("pb").color, normalToken: sonda("color:var(--foreground)", "color"),
        negrito: cs("tb").fontWeight,
        corte: {ws: cs("tt").whiteSpace, of: cs("tt").overflow, to: cs("tt").textOverflow},
        codigo: {fundo: cs("c").backgroundColor, fundoToken: sonda("background-color:var(--surface-2)", "background-color"),
          fonte: cs("c").fontFamily, fonteToken: sonda("font-family:var(--font-code)", "font-family"),
          fs: parseFloat(cs("c").fontSize), raio: cs("c").borderTopLeftRadius},
        textSm: px("--text-sm"),
      };
    });
    m.titulos.forEach((t, i) => {
      expect(t.fs, `h${i + 1}`).toBe(m.escala[i]);
      expect(t.peso, `h${i + 1} seminegrito`).toBe("600");
      expect(t.margem, `h${i + 1} sem a margem do navegador`).toBe("0px");
    });
    m.corpo.forEach((c, i) => {
      expect(c.fs).toBe(m.corpoEscala[i]);
      // `--leading-relaxed` é 1,7: a entrelinha do texto corrido é 1,7 × o tamanho
      expect(Math.abs(c.lh - c.fs * 1.7)).toBeLessThan(0.51);
      expect(c.margem).toBe("0px");
    });
    expect(m.normal).toBe(m.normalToken);
    expect(m.apagado).toBe(m.apagadoToken);
    expect(m.apagado).not.toBe(m.normal);
    expect(m.negrito).toBe("700");
    expect(m.corte).toEqual({ws: "nowrap", of: "hidden", to: "ellipsis"});
    expect(m.codigo.fundo).toBe(m.codigo.fundoToken);
    expect(m.codigo.fonte).toBe(m.codigo.fonteToken);
    expect(m.codigo.fs).toBe(m.textSm);
    expect(m.codigo.raio).not.toBe("0px");
  });
}
