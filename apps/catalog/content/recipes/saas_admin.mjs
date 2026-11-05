// RECEITA · SaaS · admin (S-11, 05/11/2026) — a gestão de membros como tela de produto, na linguagem dos blocos v2 (a
// `Tela`: a trilha com o id, o título com o estado, as propriedades e "Invite" no canto): os assentos, a grade com busca,
// o filtro por estado, escolha em lote e o convite numa janela. A grade é a `DataGrid` (a decisão S-02: toda
// tabela do site é a `DataGrid`). Interação de verdade: convidar entra na grade como "Invited"; escolher linhas e
// "Suspend" muda o estado delas; os assentos e a contagem de escolhidos acompanham. O estado é ponto e texto (`Status`).
import {createElement as h, useState} from "react";
import * as A from "../../../../packages/react/dist/index.js";
import {DataGrid} from "../../../../packages/react/dist/data-grid.js";
import {Tela} from "./_tela.mjs";

const pilha = {display: "grid", gap: "var(--space-4)", minInlineSize: 0};
const TOM = {Active: "success", Invited: "info", Suspended: "warning"};
const ASSENTOS = 12;

const MEMBROS = [
  {id: "1", name: "Messenger", email: "messenger@example.com", role: "Owner", state: "Active"},
  {id: "2", name: "Analyst", email: "analyst@example.com", role: "Admin", state: "Active"},
  {id: "3", name: "Curator", email: "curator@example.com", role: "Editor", state: "Active"},
  {id: "4", name: "Writer", email: "writer@example.com", role: "Editor", state: "Invited"},
  {id: "5", name: "Reviewer", email: "reviewer@example.com", role: "Viewer", state: "Suspended"},
  {id: "6", name: "Planner", email: "planner@example.com", role: "Viewer", state: "Active"},
];
const COLUNAS = [
  {accessorKey: "name", header: "Member",
    cell: ({row}) => h("span", {style: {display: "inline-flex", alignItems: "center", gap: "var(--space-3)"}},
      h(A.Avatar, {size: "sm", fallback: row.original.name.slice(0, 2).toUpperCase()}),
      h("span", {style: {display: "grid"}}, h("span", null, row.original.name),
        h(A.Text, {type: "body-xs", tone: "muted"}, row.original.email)))},
  {accessorKey: "state", header: "State", cell: ({getValue}) => h(A.Status, {variant: TOM[getValue()]}, getValue())},
  {accessorKey: "role", header: "Role"},
];
const PAPEIS = ["Admin", "Editor", "Viewer"].map(p => ({value: p, label: p}));

function MembersAdmin() {
  const [membros, setMembros] = useState(MEMBROS);
  const [aberta, setAberta] = useState(false);
  const [email, setEmail] = useState("");
  const [papel, setPapel] = useState("Editor");
  const [filtro, setFiltro] = useState("All");
  const [escolhidos, setEscolhidos] = useState(0);
  const ocupados = membros.filter(m => m.state !== "Suspended").length;
  const convidar = () => {
    if (!email.trim()) return;
    setMembros(ms => [...ms, {id: String(ms.length + 1), name: email.split("@")[0], email, role: papel, state: "Invited"}]);
    setEmail(""); setAberta(false);
  };
  const suspender = (linhas, limpar) => {
    const ids = new Set(linhas.map(l => l.id));
    setMembros(ms => ms.map(m => ids.has(m.id) && m.role !== "Owner" ? {...m, state: "Suspended"} : m));
    limpar();
  };
  return h(Tela, {icone: "users", trilha: ["Settings", "Workspace"], id: "ws_acme", titulo: "Members",
    estado: h(A.Status, {variant: "success"}, "Team plan"),
    propriedades: [["users", `${membros.length} members`], ["envelope", `${membros.filter(m => m.state === "Invited").length} invited`],
      ["check-square", `${escolhidos} selected`]],
    acoes: h(A.Button, {variant: "primary", leadingIcon: "user-plus", onClick: () => setAberta(true)}, "Invite member"),
    rodape: "Suspended members keep their history and stop using a seat. The owner cannot be suspended."},
    h(A.Progress, {value: Math.round(ocupados / ASSENTOS * 100), label: "Seats in use", showLabel: true, detail: `${ocupados} of ${ASSENTOS}`}),
    h(A.SegmentedControl, {label: "Show", value: filtro, onChange: setFiltro,
      items: ["All", "Active", "Invited", "Suspended"].map(v => ({value: v, label: v}))}),
    h(DataGrid, {label: "Workspace members", data: filtro === "All" ? membros : membros.filter(m => m.state === filtro),
      columns: COLUNAS, getRowId: m => m.id, filterable: true, selectable: true, pageSize: 5,
      onSelectionChange: linhas => setEscolhidos(linhas.length),
      bulkActions: [{id: "suspend", label: "Suspend", icon: "pause", onAction: suspender}]}),
    h(A.Dialog, {open: aberta, onClose: () => setAberta(false), title: "Invite a member", size: "sm",
      footer: h("div", {style: {display: "flex", justifyContent: "flex-end", gap: "var(--space-2)"}},
        h(A.Button, {variant: "ghost", onClick: () => setAberta(false)}, "Cancel"),
        h(A.Button, {variant: "primary", onClick: convidar}, "Send invite"))},
      h("div", {style: pilha},
        h(A.Field, {label: "Email", hint: "They get a link that expires in 7 days."},
          h(A.Input, {type: "email", value: email, onChange: e => setEmail(e.target.value), placeholder: "name@example.com"})),
        h(A.Field, {label: "Role"}, h(A.Select, {items: PAPEIS, value: papel, onValueChange: setPapel})))));
}

export default {
  uses: ["Card", "Separator", "Avatar", "Icon", "Text", "Code", "Heading", "Status", "Button", "Progress", "SegmentedControl", "DataGrid", "Dialog", "Field", "Input", "Select"],
  code: `import {useState} from "react";
import {Avatar, Button, Card, Code, Dialog, Field, Heading, Icon, Input, Progress, SegmentedControl, Select,
  Separator, Status, Text} from "@aurea-uds/react";
import {DataGrid} from "@aurea-uds/react/data-grid";

const tone = {Active: "success", Invited: "info", Suspended: "warning"};
const columns = [
  {accessorKey: "name", header: "Member",
    cell: ({row}) => (
      <>
        <Avatar size="sm" fallback={row.original.name.slice(0, 2)} />
        {row.original.name}
        <Text type="body-xs" tone="muted">{row.original.email}</Text>
      </>
    )},
  {accessorKey: "state", header: "State", cell: ({getValue}) => <Status variant={tone[getValue()]}>{getValue()}</Status>},
  {accessorKey: "role", header: "Role"},
];

export function MembersAdmin({initial, seats}) {
  const [members, setMembers] = useState(initial);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Editor");
  const [show, setShow] = useState("All");
  const [selected, setSelected] = useState(0);
  const used = members.filter(m => m.state !== "Suspended").length;

  const invite = () => {
    setMembers(m => [...m, {id: crypto.randomUUID(), name: email.split("@")[0], email, role, state: "Invited"}]);
    setOpen(false);
  };
  const suspend = (rows, clear) => {
    const ids = new Set(rows.map(r => r.id));
    setMembers(m => m.map(x => ids.has(x.id) ? {...x, state: "Suspended"} : x));
    clear();
  };

  return (
    <Card>
      <header>
        <Avatar size="lg" tone="brand" emphasis="soft" fallback={<Icon name="users" />} />
        <Text type="body-xs" tone="muted">Settings › Workspace</Text> <Code>ws_acme</Code>
        <Heading level={3}>Members</Heading> <Status variant="success">Team plan</Status>
        <Text type="body-sm" tone="muted">{members.length} members · {selected} selected</Text>
        <Button variant="primary" leadingIcon="user-plus" onClick={() => setOpen(true)}>Invite member</Button>
      </header>
      <Separator />

      <Progress value={Math.round(used / seats * 100)} label="Seats in use" showLabel detail={\`\${used} of \${seats}\`} />

      <SegmentedControl label="Show" value={show} onChange={setShow}
        items={["All", "Active", "Invited", "Suspended"].map(v => ({value: v, label: v}))} />

      <DataGrid
        label="Workspace members"
        data={show === "All" ? members : members.filter(m => m.state === show)}
        columns={columns}
        getRowId={m => m.id}
        filterable
        selectable
        pageSize={5}
        onSelectionChange={rows => setSelected(rows.length)}
        bulkActions={[{id: "suspend", label: "Suspend", icon: "pause", onAction: suspend}]}
      />

      <Dialog open={open} onClose={() => setOpen(false)} title="Invite a member" size="sm"
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={invite}>Send invite</Button></>}>
        <Field label="Email" hint="They get a link that expires in 7 days.">
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </Field>
        <Field label="Role">
          <Select items={[{value: "Admin", label: "Admin"}, {value: "Editor", label: "Editor"}, {value: "Viewer", label: "Viewer"}]}
            value={role} onValueChange={setRole} />
        </Field>
      </Dialog>

      <Separator />

      <footer>
        <Text type="body-sm" tone="muted">Suspended members keep their history and stop using a seat.</Text>
      </footer>
    </Card>
  );
}`,
  render: () => h(MembersAdmin),
};
