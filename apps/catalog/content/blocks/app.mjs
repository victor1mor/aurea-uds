// BLOCKS — seções/telas inteiras montadas com componentes Aurea (vocabulário AUREA.md §4:
// Components → Patterns → Blocks → Recipes). Um block é maior que um pattern e menor que
// uma tela de produto: é a peça que se arrasta pronta para dentro de uma página.
//   name/category/description — identidade do block
//   uses — componentes reais que aparecem (chips com link)
//   code/render — o que o consumidor escreve e o Preview dogfooded
import {createElement as h} from "react";
import {Card, Field, Input, Button, Banner, Checkbox, Select, Switch, Textarea,
  Table, SearchField, Pagination, EmptyState, Badge, Status} from "../../../../packages/react/dist/index.js";

const row = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2)"};
const between = {...row, justifyContent: "space-between"};
const stack = {display: "grid", gap: "var(--space-4)"};
// `stackApertado` só onde a prévia estourava a caixa da ADR-0002 por poucos pixels: o
// conteúdo é o mesmo, o que encolhe é o respiro ENTRE as faixas da amostra. Medido em
// 29/08/2026 — 357px numa caixa de 354px. Trocar o `stack` de todos os blocos por causa
// de três páginas seria mexer no desenho de dezenas para consertar as três.
const stackApertado = {display: "grid", gap: "var(--space-3)"};


export default [
  {
    name: "Sign-in panel",
    category: "Auth",
    description: "Card with credentials, an inline error slot and one primary action. No password is ever pre-filled.",
    uses: ["Card", "Field", "Input", "Button", "Banner", "Checkbox"],
    code: `<Card>
  <Banner variant="danger" title="Wrong credentials">Check both fields.</Banner>
  <Field label="Email"><Input type="email" autoComplete="email" /></Field>
  <Field label="Password"><Input type="password" autoComplete="current-password" /></Field>
  <Checkbox label="Keep me signed in" />
  <Button variant="primary" type="submit">Sign in</Button>
</Card>`,
    render: () => h("div", {style: {width: "min(420px,100%)"}}, h(Card, null,
      h("div", {style: stack},
        // Sem título: o botão primário no fim do cartão diz "Sign in" com todas as letras, e o
        // cabeçalho repetia a mesma palavra por 33px. Mesmo critério dos itens I1 a I8 — corta-se
        // o que já está dito em outro lugar, nunca a altura da caixa (ADR-0002). A descrição do
        // bloco nunca prometeu título: "card with credentials, an inline error slot and one
        // primary action".
        // Uma linha no aviso, e o corte é medido: a prévia dava 397px num vão de 354 e ROLAVA.
        // O título do `Banner` já diz o que houve; a segunda frase repetia em outras palavras os
        // dois campos que estão logo abaixo. Cortar o repetido é o mesmo critério dos itens I1 a
        // I8 — e é o que a ADR-0002 manda ceder, em vez da altura da caixa.
        h(Banner, {variant: "danger", title: "Wrong credentials"}, "Check both fields."),
        h(Field, {label: "Email"}, h(Input, {type: "email", placeholder: "you@example.com"})),
        h(Field, {label: "Password"}, h(Input, {type: "password", placeholder: "••••••••"})),
        h(Checkbox, {label: "Keep me signed in"}),
        h(Button, {variant: "primary"}, "Sign in")))),
  },
  {
    name: "Settings form",
    category: "Forms",
    description: "One column of fields, toggles grouped at the end, a single primary action and a ghost escape.",
    uses: ["Card", "Field", "Input", "Select", "Textarea", "Switch", "Button"],
    code: `<Card>
  <div className="grid" style={{gridTemplateColumns:"1fr 1fr"}}>
    <Field label="Workspace name"><Input defaultValue="Acme" /></Field>
    <Field label="Region">
      <Select defaultValue="eu"><option value="eu">Europe</option><option value="us">United States</option></Select>
    </Field>
  </div>
  <Field label="Description" hint="Shown to every member."><Textarea rows={2} /></Field>
  <div className="grid" style={{gridTemplateColumns:"1fr 1fr"}}>
    <Switch label="Email notifications" defaultChecked />
    <Switch label="Weekly digest" />
  </div>
  <div className="cluster"><Button variant="ghost">Discard</Button><Button variant="primary">Save changes</Button></div>
</Card>`,
    // Os dois campos curtos LADO A LADO, e o corte é medido: a prévia dava 462px num vão de 354 e
    // ROLAVA, contra a ADR-0002. Empilhados, nome e região gastavam 126px para mostrar dois
    // controles de uma linha cada. É o mesmo movimento que o I5 fez com as suas duas listas — o
    // que cede é o layout, nunca a altura da caixa. `min(560px)` porque com 520 os dois campos
    // ficavam com 244px cada e o rótulo "Workspace name" quebrava.
    render: () => h("div", {style: {width: "min(560px,100%)"}}, h(Card, null,
      h("div", {style: stack},
        h("div", {style: {display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)"}},
          h(Field, {label: "Workspace name"}, h(Input, {defaultValue: "Acme"})),
          h(Field, {label: "Region"}, h(Select, {defaultValue: "eu"},
            h("option", {value: "eu"}, "Europe"), h("option", {value: "us"}, "United States")))),
        // `rows={2}`: a caixa de texto mostra o que ela é com duas linhas, e a terceira custava
        // 22px que a composição não tinha.
        h(Field, {label: "Description", hint: "Shown to every member."},
          h(Textarea, {rows: 2, defaultValue: "Internal tooling."})),
        // Os dois interruptores na MESMA linha: eles são o grupo que a descrição do bloco chama de
        // "toggles grouped at the end", e agrupar de verdade custa 36px a menos que empilhar.
        h("div", {style: {display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)"}},
          h(Switch, {label: "Email notifications", defaultChecked: true}),
          h(Switch, {label: "Weekly digest"})),
        h("div", {style: {...row, justifyContent: "flex-end"}},
          h(Button, {variant: "ghost"}, "Discard"), h(Button, {variant: "primary"}, "Save changes"))))),
  },
  {
    name: "Members table",
    category: "Collections",
    description: "The full collection surface: filter, selection, status per row, row actions and pagination.",
    uses: ["Card", "SearchField", "Table", "Checkbox", "Status", "Button", "Pagination"],
    code: `<Card>
  <div className="cluster"><SearchField placeholder="Filter members…" /><Button variant="outline">Invite</Button></div>
  <Table caption="Workspace members">
    <thead><tr><th><span className="sr-only">Select</span></th><th>Member</th><th>State</th><th>Actions</th></tr></thead>
    <tbody>{rows.map(r => (
      <tr key={r.name}>
        <td><Checkbox label={\`Select \${r.name}\`} labelHidden /></td>
        <td>{r.name}</td>
        <td><Status variant={r.state}>{r.state}</Status></td>
        <td><Button variant="ghost" size="sm">Remove</Button></td>
      </tr>))}
    </tbody>
  </Table>
  <Pagination page={1} total={4} onPageChange={setPage} />
</Card>`,
    render: () => {
      const rows = [{name: "Messenger", state: "online"}, {name: "Analyst", state: "busy"}, {name: "Curator", state: "offline"}];
      return h("div", {style: {width: "min(680px,100%)"}}, h(Card, null,
        h("div", {style: stackApertado},
          h("div", {style: between},
            h("div", {style: {flex: 1, minWidth: "180px"}}, h(SearchField, {placeholder: "Filter members…"})),
            h(Button, {variant: "outline"}, "Invite")),
          h(Table, {caption: "Workspace members"},
            h("thead", null, h("tr", null, h("th", null, h("span", {className: "sr-only"}, "Select")), h("th", null, "Member"), h("th", null, "State"), h("th", null, "Actions"))),
            h("tbody", null, ...rows.map((r, i) => h("tr", {key: r.name},
              h("td", null, h(Checkbox, {label: `Select ${r.name}`, labelHidden: true, defaultChecked: i === 0})),
              h("td", null, r.name),
              h("td", null, h(Status, {variant: r.state}, r.state)),
              h("td", null, h(Button, {variant: "ghost", size: "sm"}, "Remove")))))),
          h(Pagination, {page: 1, total: 4, onPageChange: () => {}}))));
    },
  },
  {
    name: "Empty project state",
    category: "Feedback",
    description: "First run with nothing to show: says what is missing, why, and the one action that fixes it.",
    uses: ["Card", "EmptyState", "Button", "Badge"],
    code: `<Card>
  <EmptyState icon="folder" title="No projects yet"
    description="A project holds your components, tokens and releases."
    action={<Button variant="primary" leadingIcon="add">New project</Button>} />
</Card>`,
    render: () => h("div", {style: {width: "min(520px,100%)"}}, h(Card, null,
      h(EmptyState, {icon: "document--blank", title: "No projects yet", titleAs: "h2",
        description: "A project holds your components, tokens and releases.",
        action: h(Button, {variant: "primary", leadingIcon: "add"}, "New project")}))),
  },
];
