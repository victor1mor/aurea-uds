// RECEITAS — preview e código de cada arquétipo (ADR-0001, Fase 7, achado I2).
//
// As 23 páginas de receita eram texto renderizado de Markdown: nenhum preview, nenhum código,
// nada que um consumidor pudesse copiar. Era o pior sintoma do achado I2 e a razão principal da
// ADR-0001. O texto (Composition / Capabilities / Invariants / States) continua vindo de
// `patterns/<id>.md`, que é a fonte validada pelo check 9; o que entra aqui é o par
// preview + código.
//
// O QUE O PREVIEW MOSTRA, declarado: o CENTRO do arquétipo montado com componentes de verdade —
// a superfície que o consumidor copia primeiro —, não uma tela inteira em miniatura. Uma receita
// é a composição de 2 a 5 patterns de arquitetura; o preview mostra o pattern central e o texto
// da página diz como os outros se encaixam. Onde o centro não é renderizável em página estática
// (um mapa, um canvas, um grafo de nós), o preview mostra a superfície ESPELHO que a própria
// receita exige — é invariante dela, não substituto: "toda seleção no mapa espelha uma lista".
//
// `uses` alimenta os chips da seção Uses e o import do Installation — os dois saem daqui, então
// não podem divergir do que o preview realmente usa.
import {createElement as h} from "react";
import * as A from "../../../packages/react/dist/index.js";

const row = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-3)"};
const between = {...row, justifyContent: "space-between"};
const stack = {display: "grid", gap: "var(--space-3)"};
const wide = {width: "min(38rem,100%)"};
// A caixa de demonstração tem altura FIXA (ADR-0002) e o vão útil dela é **354px**, medido a
// 1440×761 — onde o `clamp` bate no piso. Três peças do core têm altura própria e estouravam esse
// vão sozinhas: `.log-stream` gastava 240px para mostrar três linhas e `.media-player` 464px por
// causa do `aspect-ratio`. As válvulas abaixo são as do core (`--log-h` e `--media-h`/`--media-ar`),
// com o valor que a receita precisa — quem sabe quanta altura tem é a página.
// 7rem, e ele NÃO encolhe. Encolher foi tentado em 29/08/2026, quando o `Alert` voltou a
// desenhar o glifo da variante e a receita passou a estourar a caixa em 8px — e o axe reprovou
// na hora: com 6,5rem o fluxo passa a ROLAR, e região que rola sem receber foco é
// `scrollable-region-focusable`, que é um controle removido, não um ajuste de altura. Os 8px
// saem do respiro entre as faixas, abaixo.
// 5.5rem cabe DUAS linhas de log mais o respiro. Eram três em 7rem até a 0.8.8, cuja escala de
// letra fez a receita passar 16px da caixa de demonstração.
const logCurto = {"--log-h": "5.5rem"};
// `--space-2` só nesta receita: são duas folgas, e 4px em cada uma paga os 8px do glifo do
// Alert sem tirar nada da amostra nem fazer nada rolar.
const stackApertado = {display: "grid", gap: "var(--space-2)"};
const playerCurto = {"--media-h": "9rem", "--media-ar": "auto"};
const narrow = {width: "min(24rem,100%)"};
const muted = {color: "var(--muted-foreground)", fontSize: "var(--text-sm)"};

export default {
  public_site: {
    uses: ["Card", "Badge", "Button"],
    code: `<Card>
  <Badge variant="primary">New</Badge>
  <h2>Ship the interface, not the argument about it.</h2>
  <p>One system, two themes, three densities.</p>
  <Button variant="primary" trailingIcon="arrow--right">Get started</Button>
  <Button variant="outline">Read the docs</Button>
</Card>`,
    render: () => h("div", {style: wide}, h(A.Card, null, h("div", {style: stack},
      h(A.Badge, {variant: "primary"}, "New"),
      h("strong", null, "Ship the interface, not the argument about it."),
      h("span", {style: muted}, "One system, two themes, three densities."),
      h("div", {style: row}, h(A.Button, {variant: "primary", trailingIcon: "arrow--right"}, "Get started"),
        h(A.Button, {variant: "outline"}, "Read the docs"))))),
  },
  docs_cms: {
    uses: ["Card", "Badge", "Field", "Input", "Textarea", "Button"],
    code: `<Card>
  <Badge variant="warning">Draft</Badge>
  <Field label="Title"><Input defaultValue="Measuring instead of counting" /></Field>
  <Field label="Body" hint="Markdown."><Textarea rows={3} /></Field>
  <Button variant="ghost">Save draft</Button>
  <Button variant="primary">Publish</Button>
</Card>`,
    render: () => h("div", {style: wide}, h(A.Card, null, h("div", {style: stack},
      h("div", {style: between}, h("strong", null, "Article"), h(A.Badge, {variant: "warning"}, "Draft")),
      h(A.Field, {label: "Title"}, h(A.Input, {defaultValue: "Measuring instead of counting"})),
      h(A.Field, {label: "Body", hint: "Markdown."},
        h(A.Textarea, {rows: 3, defaultValue: "A claim about state needs a command behind it."})),
      h("div", {style: {...row, justifyContent: "flex-end"}},
        h(A.Button, {variant: "ghost"}, "Save draft"),
        h(A.Button, {variant: "primary"}, "Publish"))))),
  },
  saas_admin: {
    uses: ["Card", "SearchField", "Button", "Table", "Status", "Pagination"],
    code: `<Card>
  <SearchField placeholder="Filter members…" />
  <Button variant="outline" leadingIcon="add">Invite</Button>
  <Table caption="Workspace members">
    <thead><tr><th>Member</th><th>Role</th><th>State</th></tr></thead>
    <tbody>{members.map(m => (
      <tr key={m.name}>
        <td>{m.name}</td><td>{m.role}</td>
        <td><Status variant={m.state}>{m.state}</Status></td>
      </tr>))}
    </tbody>
  </Table>
  <Pagination page={page} total={4} onPageChange={setPage} />
</Card>`,
    render: () => h("div", {style: wide}, h(A.Card, null, h("div", {style: stack},
      h("div", {style: between},
        h("div", {style: {flex: 1, minWidth: "12rem"}}, h(A.SearchField, {placeholder: "Filter members…"})),
        h(A.Button, {variant: "outline", leadingIcon: "add"}, "Invite")),
      h(A.Table, {caption: "Workspace members"},
        h("thead", null, h("tr", null, h("th", null, "Member"), h("th", null, "Role"), h("th", null, "State"))),
        h("tbody", null, ...[["Messenger", "Owner", "online"], ["Analyst", "Editor", "busy"],
          ["Curator", "Viewer", "offline"]].map(([n, r, s]) => h("tr", {key: n},
          h("td", null, n), h("td", null, r), h("td", null, h(A.Status, {variant: s}, s)))))),
      h(A.Pagination, {page: 1, total: 4, onPageChange: () => {}})))),
  },
  dashboard_bi: {
    uses: ["KPI", "SegmentedControl", "Table"],
    code: `<SegmentedControl label="Range" value={range} onChange={setRange}
  items={[{value: "7d", label: "7 days"}, {value: "30d", label: "30 days"}]} />
<KPI label="Revenue" value="$48.2k" trend="+12%" />
<KPI label="Active seats" value="312" trend="+4%" />
<Table caption="Revenue by plan">…</Table>`,
    render: () => h("div", {style: {...stack, ...wide}},
      h(A.SegmentedControl, {label: "Range", value: "30d", onChange: () => {},
        items: [{value: "7d", label: "7 days"}, {value: "30d", label: "30 days"}]}),
      h("div", {style: row}, h(A.KPI, {label: "Revenue", value: "$48.2k", trend: "+12%"}),
        h(A.KPI, {label: "Active seats", value: "312", trend: "+4%"})),
      h(A.Table, {caption: "Revenue by plan"},
        h("thead", null, h("tr", null, h("th", null, "Plan"), h("th", null, "Revenue"))),
        h("tbody", null, h("tr", null, h("td", null, "Pro"), h("td", null, "$31.0k")),
          h("tr", null, h("td", null, "Team"), h("td", null, "$17.2k"))))),
  },
  catalog_gallery: {
    uses: ["SegmentedControl", "Badge", "Button", "Grid", "Card", "Checkbox"],
    code: `<SegmentedControl label="View" value={view} onChange={setView}
  items={[{value: "grid", label: "Grid"}, {value: "list", label: "List"}]} />
<Badge variant="primary">2 selected</Badge>
<Button variant="outline">Export</Button>
<Grid>{items.map(i => (
  <Card key={i.id} variant={selected.has(i.id) ? "selected" : "base"}>
    <Checkbox label={\`Select \${i.name}\`} />
    {i.name}
  </Card>))}
</Grid>`,
    render: () => h("div", {style: {...stack, ...wide}},
      h("div", {style: between},
        h(A.SegmentedControl, {label: "View", value: "grid", onChange: () => {},
          items: [{value: "grid", label: "Grid"}, {value: "list", label: "List"}]}),
        h("div", {style: row}, h(A.Badge, {variant: "primary"}, "2 selected"),
          h(A.Button, {variant: "outline"}, "Export"))),
      h(A.Grid, null, ...[["Cover art", true], ["Poster", true], ["Thumbnail", false]]
        .map(([name, sel]) => h(A.Card, {key: name, variant: sel ? "selected" : "base"},
          h("div", {style: row}, h(A.Checkbox, {label: `Select ${name}`, labelHidden: true, defaultChecked: sel}),
            h("span", null, name)))))),
  },
  media_streaming: {
    uses: ["MediaPlayer", "Table", "Badge"],
    code: `<MediaPlayer kind="audio" src="/media/ep-14.mp3" title="Episode 14" subtitle="Season 2" />
<Table caption="Up next">
  <thead><tr><th>Track</th><th>Length</th></tr></thead>
  <tbody><tr><td>Episode 15 <Badge>queued</Badge></td><td>41:02</td></tr></tbody>
</Table>`,
    render: () => h("div", {style: {...stack, ...wide, ...playerCurto}},
      h(A.MediaPlayer, {kind: "audio", title: "Episode 14", subtitle: "Season 2"}),
      h(A.Table, {caption: "Up next"},
        h("thead", null, h("tr", null, h("th", null, "Track"), h("th", null, "Length"))),
        h("tbody", null,
          h("tr", null, h("td", null, h("div", {style: row}, "Episode 15",
            h(A.Badge, null, "queued"))), h("td", null, "41:02")),
          h("tr", null, h("td", null, "Episode 16"), h("td", null, "38:47"))))),
  },
  workflow_automation: {
    uses: ["Card", "Status", "Button", "Timeline", "LogStream"],
    code: `<Card>
  <Status variant="running">running</Status>
  <Button variant="ghost" size="sm">Cancel</Button>
  <Timeline items={[
    {title: "Trigger · webhook", time: "09:14:02"},
    {title: "Transform · map fields", time: "09:14:03"},
  ]} />
  <LogStream lines={runLog} />
</Card>`,
    render: () => h("div", {style: {...wide, ...logCurto}}, h(A.Card, null, h("div", {style: stack},
      h("div", {style: between}, h(A.Status, {variant: "running"}, "running"),
        h(A.Button, {variant: "ghost", size: "sm"}, "Cancel")),
      h(A.Timeline, {items: [{title: "Trigger · webhook", time: "09:14:02"},
        {title: "Transform · map fields", time: "09:14:03"}]}),
      h(A.LogStream, {lines: [{time: "09:14:02", text: "run 184 started"},
        {time: "09:14:03", level: "warn", text: "field owner missing, using default"}]})))),
  },
  developer_tools: {
    uses: ["TreeView", "CodeBlock", "LogStream"],
    code: `<TreeView label="Files" defaultExpandedIds={["src"]} items={tree} onSelect={open} />
<CodeBlock language="tsx" copyable>{source}</CodeBlock>
<LogStream lines={terminal} />`,
    render: () => h("div", {style: {...stack, ...wide, ...logCurto}},
      h(A.TreeView, {label: "Files", defaultExpandedIds: ["src"], items: [
        {id: "src", label: "src", children: [{id: "index", label: "index.tsx"}]},
        {id: "readme", label: "README.md"}]}),
      h(A.CodeBlock, {language: "tsx", copyable: true},
        'export const total = items.reduce((n, i) => n + i.price, 0);'),
      h(A.LogStream, {lines: [{time: "09:14", text: "vitest 143/143"},
        {time: "09:15", text: "playwright 76/76"}]})),
  },
  file_cloud: {
    uses: ["Card", "Table", "Status", "Progress", "Button"],
    code: `<Card>
  <Table caption="Files">
    <thead><tr><th>Name</th><th>Size</th><th>Integrity</th></tr></thead>
    <tbody><tr><td>tokens.json</td><td>18 KB</td>
      <td><Status variant="success">checksum ok</Status></td></tr></tbody>
  </Table>
  <Progress value={62} label="Uploading fonts.woff2" />
  <Button variant="ghost" size="sm">Pause</Button>
</Card>`,
    render: () => h("div", {style: wide}, h(A.Card, null, h("div", {style: stack},
      h(A.Table, {caption: "Files"},
        h("thead", null, h("tr", null, h("th", null, "Name"), h("th", null, "Size"), h("th", null, "Integrity"))),
        h("tbody", null,
          h("tr", null, h("td", null, "tokens.json"), h("td", null, "18 KB"),
            h("td", null, h(A.Status, {variant: "success"}, "checksum ok"))),
          h("tr", null, h("td", null, "fonts.woff2"), h("td", null, "294 KB"),
            h("td", null, h(A.Status, {variant: "running"}, "transferring"))))),
      h(A.Progress, {value: 62, label: "Uploading fonts.woff2"}),
      h("div", {style: {...row, justifyContent: "flex-end"}},
        h(A.Button, {variant: "ghost", size: "sm"}, "Pause"))))),
  },
  messaging_social: {
    uses: ["Card", "Status", "MessageList", "MessageComposer"],
    code: `<Card>
  <Status variant="online">Analyst is online</Status>
  <MessageList messages={messages} />
  <MessageComposer placeholder="Message the team…" onSend={send} />
</Card>`,
    render: () => h("div", {style: wide}, h(A.Card, null, h("div", {style: stack},
      h(A.Status, {variant: "online"}, "Analyst is online"),
      h(A.MessageList, {messages: [
        {id: "1", author: "Analyst", time: "09:12", body: "The sweep is green.", avatar: {fallback: "AN"}},
        {id: "2", author: "You", time: "09:14", body: "Shipping it.",
          status: {label: "read", variant: "success"}}]}),
      h(A.MessageComposer, {placeholder: "Message the team…", onSend: () => {}})))),
  },
  commerce_finance: {
    uses: ["Card", "DataList", "Alert", "Button", "Badge"],
    code: `<Card>
  <Badge variant="warning">Payment pending</Badge>
  <DataList items={[
    {term: "Subtotal", value: "$240.00"},
    {term: "Tax", value: "$21.60"},
    {term: "Total", value: "$261.60"},
  ]} />
  <Alert variant="info">Charging twice is impossible: the order id is the idempotency key.</Alert>
  <Button variant="primary">Pay $261.60</Button>
</Card>`,
    render: () => h("div", {style: wide}, h(A.Card, null, h("div", {style: stack},
      h("div", {style: between}, h("strong", null, "Order 4812"),
        h(A.Badge, {variant: "warning"}, "Payment pending")),
      h(A.DataList, {items: [{term: "Subtotal", value: "$240.00"},
        {term: "Tax", value: "$21.60"}, {term: "Total", value: "$261.60"}]}),
      h(A.Alert, {variant: "info"}, "Charging twice is impossible: the order id is the idempotency key."),
      h(A.Button, {variant: "primary"}, "Pay $261.60")))),
  },
  booking_calendar: {
    uses: ["Card", "Radio", "Field", "Input", "Button", "Badge"],
    code: `<Card>
  <Badge>Europe/Lisbon</Badge>
  <Radio name="slot" label="09:00 – 09:30" defaultChecked />
  <Radio name="slot" label="11:00 – 11:30" />
  <Field label="Name"><Input defaultValue="Curator" /></Field>
  <Button variant="primary">Confirm booking</Button>
</Card>`,
    render: () => h("div", {style: narrow}, h(A.Card, null, h("div", {style: stack},
      h("div", {style: between}, h("strong", null, "Thursday, 6 August"),
        h(A.Badge, null, "Europe/Lisbon")),
      h(A.Radio, {name: "slot", label: "09:00 – 09:30", defaultChecked: true}),
      h(A.Radio, {name: "slot", label: "11:00 – 11:30"}),
      h(A.Field, {label: "Name"}, h(A.Input, {defaultValue: "Curator"})),
      h(A.Button, {variant: "primary"}, "Confirm booking")))),
  },
  maps_logistics: {
    uses: ["Card", "KPI", "Timeline", "Status"],
    code: `// The map is one half; this list is the other, and the invariant is that they
// always agree. Selecting a stop here selects the marker there.
<Card>
  <KPI label="ETA" value="14:42" trend="on time" />
  <Status variant="warning">position 3 min old</Status>
  <Timeline items={stops} />
</Card>`,
    render: () => h("div", {style: wide}, h(A.Card, null, h("div", {style: stack},
      h("div", {style: between}, h(A.KPI, {label: "ETA", value: "14:42", trend: "on time"}),
        h(A.Status, {variant: "warning"}, "position 3 min old")),
      h(A.Timeline, {items: [
        // Sem `description` ("loaded"): a escala de letra da 0.8.8 fez a prévia passar 24px da
        // caixa, e a linha que dizia o óbvio do depósito era a mais barata de cortar.
        {title: "Depot", time: "13:10"},
        {title: "Stop 2 · Harbour Road", time: "14:05"},
        {title: "Stop 3 · Central Avenue", time: "14:42"}]})))),
  },
  iot_control: {
    uses: ["Card", "Status", "Switch", "Progress", "Alert", "Button"],
    code: `<Card>
  <Status variant="online">gateway-04 online</Status>
  <Switch label="Night mode" defaultChecked />
  <Progress value={41} label="Tank level" />
  <Alert variant="warning" title="Confirmation required">
    Calibration writes to the device. Type the device id to continue.
  </Alert>
  <Button variant="danger">Calibrate</Button>
</Card>`,
    render: () => h("div", {style: wide}, h(A.Card, null, h("div", {style: stack},
      h("div", {style: between}, h(A.Status, {variant: "online"}, "gateway-04 online"),
        h(A.Switch, {label: "Night mode", defaultChecked: true})),
      h(A.Progress, {value: 41, label: "Tank level"}),
      h(A.Alert, {variant: "warning", title: "Confirmation required"},
        "Calibration writes to the device. Type the device id to continue."),
      h("div", {style: {...row, justifyContent: "flex-end"}},
        h(A.Button, {variant: "danger"}, "Calibrate"))))),
  },
  agent_ai: {
    uses: ["Card", "MessageList", "Timeline", "Alert", "Button"],
    code: `<Card>
  <MessageList messages={turns} />
  <Timeline items={[
    {title: "read_file · tokens.json", description: "18 KB", time: "09:14:03"},
    {title: "write_file · aurea.css", description: "awaiting approval", time: "09:14:05"},
  ]} />
  <Alert variant="warning" title="Approval required">This run writes to the repository.</Alert>
  <Button variant="ghost">Reject</Button>
  <Button variant="primary">Approve</Button>
</Card>`,
    render: () => h("div", {style: wide}, h(A.Card, null, h("div", {style: stack},
      // UM turno, e é o do agente: o do humano repetia o que o título da receita já diz. Mesmo
      // corte que o I1 fez, pelo mesmo motivo medido — a prévia dava 457px num vão de 354.
      h(A.MessageList, {messages: [
        {id: "2", author: "Agent", time: "09:14", body: "Two files, four values. Plan below.",
          avatar: {fallback: "AG"}}]}),
      // Sem `description`: "18 KB" e "awaiting approval" custavam uma linha cada, e o segundo já
      // está dito no `Alert` logo abaixo, que é quem pede a aprovação.
      h(A.Timeline, {items: [
        {title: "read_file · tokens.json", time: "09:14:03"},
        {title: "write_file · aurea.css", time: "09:14:05"}]}),
      // O pedido e a resposta LADO A LADO: empilhados, a barra de dois botões custava uma linha
      // inteira, e com a escala de letra da 0.8.8 a prévia passava 24px da caixa. O texto vem
      // antes no DOM, então quem tabula lê o pedido antes de alcançar os botões.
      h("div", {style: {display: "grid", gridTemplateColumns: "1fr auto", gap: "var(--space-3)", alignItems: "center"}},
        h(A.Alert, {variant: "warning", title: "Approval required"},
          "This run writes to the repository."),
        h("div", {style: row},
          h(A.Button, {variant: "ghost"}, "Reject"),
          h(A.Button, {variant: "primary"}, "Approve")))))),
  },
  project_crm_erp: {
    uses: ["Card", "SearchField", "Table", "Badge", "Avatar", "Pagination"],
    code: `<Card>
  <SearchField placeholder="Filter deals…" />
  <Table caption="Pipeline">
    <thead><tr><th>Deal</th><th>Stage</th><th>Owner</th></tr></thead>
    <tbody><tr><td>Acme · renewal</td><td><Badge variant="info">Negotiation</Badge></td>
      <td><Avatar fallback="AN" size="sm" /></td></tr></tbody>
  </Table>
  <Pagination page={page} total={9} onPageChange={setPage} />
</Card>`,
    render: () => h("div", {style: wide}, h(A.Card, null, h("div", {style: stack},
      h(A.SearchField, {placeholder: "Filter deals…"}),
      h(A.Table, {caption: "Pipeline"},
        h("thead", null, h("tr", null, h("th", null, "Deal"), h("th", null, "Stage"), h("th", null, "Owner"))),
        h("tbody", null,
          h("tr", null, h("td", null, "Acme · renewal"),
            h("td", null, h(A.Badge, {variant: "info"}, "Negotiation")),
            h("td", null, h(A.Avatar, {fallback: "AN", size: "sm"}))),
          h("tr", null, h("td", null, "Globex · pilot"),
            h("td", null, h(A.Badge, {variant: "success"}, "Won")),
            h("td", null, h(A.Avatar, {fallback: "CU", size: "sm"}))))),
      h(A.Pagination, {page: 1, total: 9, onPageChange: () => {}})))),
  },
  education: {
    uses: ["Card", "Progress", "Accordion", "Badge", "Button"],
    code: `<Card>
  <Progress value={60} label="Module progress" />
  <Badge variant="success">3 of 5 lessons</Badge>
  <Accordion items={[
    {id: "l1", title: "Lesson 1 · Tokens", content: "Every visual value has a name."},
    {id: "l2", title: "Lesson 2 · Density", content: "What density governs, and what it does not."},
  ]} />
  <Button variant="primary">Continue</Button>
</Card>`,
    render: () => h("div", {style: wide}, h(A.Card, null, h("div", {style: stack},
      h("div", {style: between}, h("strong", null, "Foundations"),
        h(A.Badge, {variant: "success"}, "3 of 5 lessons")),
      h(A.Progress, {value: 60, label: "Module progress"}),
      h(A.Accordion, {items: [
        {id: "l1", title: "Lesson 1 · Tokens", content: "Every visual value has a name."},
        {id: "l2", title: "Lesson 2 · Density", content: "What density governs, and what it does not."}]}),
      h("div", {style: {...row, justifyContent: "flex-end"}},
        h(A.Button, {variant: "primary"}, "Continue"))))),
  },
  personal_productivity: {
    uses: ["Card", "Banner", "Checkbox", "Button"],
    code: `<Card>
  <Banner variant="info" title="Offline draft saved">
    It syncs when the connection returns. Navigating away keeps it.
  </Banner>
  <Checkbox label="Write the recipe previews" defaultChecked />
  <Checkbox label="Regenerate the 169 pages" />
  <Button variant="ghost" leadingIcon="add">New task</Button>
</Card>`,
    render: () => h("div", {style: narrow}, h(A.Card, null, h("div", {style: stack},
      h(A.Banner, {variant: "info", title: "Offline draft saved"},
        "It syncs when the connection returns. Navigating away keeps it."),
      h(A.Checkbox, {label: "Write the recipe previews", defaultChecked: true}),
      h(A.Checkbox, {label: "Regenerate the 169 pages"}),
      h(A.Button, {variant: "ghost", leadingIcon: "add"}, "New task")))),
  },
  mobile_pwa: {
    uses: ["Card", "Banner", "Field", "Input", "Button"],
    code: `// 320px is the target, not the exception: one column, full-width action,
// touch target never under 24px.
<Card>
  <Banner variant="warning" title="Offline">Saved locally, queued to send.</Banner>
  <Field label="Reading"><Input inputMode="numeric" defaultValue="41.2" /></Field>
  <Button variant="primary" fullWidth>Save reading</Button>
</Card>`,
    render: () => h("div", {style: {width: "min(20rem,100%)"}}, h(A.Card, null, h("div", {style: stack},
      h(A.Banner, {variant: "warning", title: "Offline"}, "Saved locally, queued to send."),
      h(A.Field, {label: "Reading"}, h(A.Input, {inputMode: "numeric", defaultValue: "41.2"})),
      h(A.Button, {variant: "primary", fullWidth: true}, "Save reading")))),
  },
  support_service: {
    uses: ["Card", "Table", "Badge", "Status", "Button"],
    code: `<Card>
  <Table caption="Inbox">
    <thead><tr><th>Case</th><th>SLA</th><th>State</th></tr></thead>
    <tbody><tr><td>#3412 · cannot sign in</td>
      <td><Badge variant="danger">12 min left</Badge></td>
      <td><Status variant="busy">with support</Status></td></tr></tbody>
  </Table>
  <Button variant="outline">Escalate</Button>
</Card>`,
    render: () => h("div", {style: wide}, h(A.Card, null, h("div", {style: stack},
      h(A.Table, {caption: "Inbox"},
        h("thead", null, h("tr", null, h("th", null, "Case"), h("th", null, "SLA"), h("th", null, "State"))),
        h("tbody", null,
          h("tr", null, h("td", null, "#3412 · cannot sign in"),
            h("td", null, h(A.Badge, {variant: "danger"}, "12 min left")),
            h("td", null, h(A.Status, {variant: "busy"}, "with support"))),
          h("tr", null, h("td", null, "#3411 · invoice mismatch"),
            h("td", null, h(A.Badge, {variant: "warning"}, "2 h left")),
            h("td", null, h(A.Status, {variant: "away"}, "waiting on customer"))))),
      h("div", {style: {...row, justifyContent: "flex-end"}},
        h(A.Button, {variant: "outline"}, "Escalate"))))),
  },
  regulated_records: {
    uses: ["Card", "Alert", "Checkbox", "DataList", "Button"],
    code: `<Card>
  <Alert variant="danger" title="This cannot be undone">
    Deleting a record breaks the retention chain. It is logged with your name.
  </Alert>
  <DataList items={[
    {term: "Consent", value: "given 12/03/2026"},
    {term: "Retention", value: "7 years"},
    {term: "Last access", value: "Curator · 09:14"},
  ]} />
  <Checkbox label="I understand the consequence" />
  <Button variant="danger" disabled>Delete record</Button>
</Card>`,
    render: () => h("div", {style: wide}, h(A.Card, null, h("div", {style: stack},
      h(A.Alert, {variant: "danger", title: "This cannot be undone"},
        "Deleting a record breaks the retention chain. It is logged with your name."),
      h(A.DataList, {items: [{term: "Consent", value: "given 12/03/2026"},
        {term: "Retention", value: "7 years"}, {term: "Last access", value: "Curator · 09:14"}]}),
      h(A.Checkbox, {label: "I understand the consequence"}),
      h("div", {style: {...row, justifyContent: "flex-end"}},
        h(A.Button, {variant: "danger", disabled: true}, "Delete record"))))),
  },
  creative_workspace: {
    uses: ["Card", "Timeline", "MessageList", "Badge"],
    code: `// The canvas is the other half. Versions and comments are the surface that
// makes canvas work reviewable — every operation has an outline alternative.
<Card>
  <Badge variant="primary">v7 · current</Badge>
  <Timeline items={[
    {title: "v7 · exported at 2x", time: "09:20"},
    {title: "v6 · palette swapped", time: "08:55"},
  ]} />
  <MessageList messages={comments} />
</Card>`,
    render: () => h("div", {style: wide}, h(A.Card, null, h("div", {style: stack},
      h("div", {style: between}, h("strong", null, "Cover · hero"),
        h(A.Badge, {variant: "primary"}, "v7 · current")),
      h(A.Timeline, {items: [{title: "v7 · exported at 2x", time: "09:20"},
        {title: "v6 · palette swapped", time: "08:55"}]}),
      h(A.MessageList, {messages: [{id: "1", author: "Curator", time: "09:21",
        body: "The yellow is doing the work. Keep it.", avatar: {fallback: "CU"}}]})))),
  },
  observability_ops: {
    uses: ["Card", "KPI", "Alert", "LogStream", "Button"],
    code: `<Card>
  <KPI label="p95 latency" value="284 ms" trend="+38 ms" />
  <Alert variant="danger" title="Error rate above 2%">
    Started 09:12. The runbook is linked from the alert, not from memory.
  </Alert>
  <LogStream lines={tail} />
  <Button variant="outline">Pause live tail</Button>
</Card>`,
    render: () => h("div", {style: {...wide, ...logCurto}}, h(A.Card, null, h("div", {style: stackApertado},
      h("div", {style: between}, h(A.KPI, {label: "p95 latency", value: "284 ms", trend: "+38 ms"}),
        h(A.Button, {variant: "outline"}, "Pause live tail")),
      // Uma linha: o título já diz o quê, e a hora é o que falta. A frase sobre o runbook é
      // texto da receita, não da prévia — e custava 22px num vão que estourava em 8.
      h(A.Alert, {variant: "danger", title: "Error rate above 2%"}, "Started 09:12."),
      h(A.LogStream, {lines: [
        {time: "09:12:41", level: "error", text: "upstream timeout after 30s"},
        {time: "09:12:44", level: "warn", text: "retry 1 of 3"}]})))),
  },
};
