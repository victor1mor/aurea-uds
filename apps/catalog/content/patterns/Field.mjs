import {createElement as h} from "react";
import {Field, Input, Select, Textarea, Switch, Checkbox, SearchField, Button} from "../../../../packages/react/dist/index.js";

const stack = {display: "grid", gap: "var(--space-4)", width: "min(420px, 100%)"};
const row = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2)"};

export default [
  {
    variant: "With hint",
    name: "Email field",
    description: "Label, control and hint bound together — the hint is read by the screen reader, not painted beside it.",
    uses: ["Field", "Input"],
    code: '<Field label="Email" hint="We never share it.">\n  <Input type="email" placeholder="you@example.com" />\n</Field>',
    render: () => h("div", {style: stack},
      h(Field, {label: "Email", hint: "We never share it."},
        h(Input, {type: "email", placeholder: "you@example.com"}))),
  },
  {
    variant: "With error",
    name: "Rejected value",
    description: "The error joins the accessible description and marks the control invalid. A red border alone tells a colour-blind user nothing.",
    uses: ["Field", "Input"],
    code: '<Field label="Slug" error="Already taken.">\n  <Input defaultValue="button" />\n</Field>',
    render: () => h("div", {style: stack},
      h(Field, {label: "Slug", error: "Already taken."}, h(Input, {defaultValue: "button"}))),
  },
  {
    variant: "With select",
    name: "Plan picker",
    description: "One value out of a known set. Select chooses a value; a Menu would execute an action.",
    uses: ["Field", "Select"],
    code: '<Field label="Plan">\n  <Select defaultValue="pro">\n    <option value="free">Free</option>\n    <option value="pro">Pro</option>\n  </Select>\n</Field>',
    render: () => h("div", {style: stack},
      h(Field, {label: "Plan"}, h(Select, {defaultValue: "pro"},
        h("option", {value: "free"}, "Free"), h("option", {value: "pro"}, "Pro")))),
  },
  {
    variant: "Composed",
    name: "Settings block",
    description: "A short settings form: text, long text and two toggles, in one column with a single primary action.",
    uses: ["Field", "Input", "Textarea", "Switch", "Checkbox", "Button"],
    code: '<Field label="Workspace"><Input defaultValue="Acme" /></Field>\n<Field label="Description"><Textarea rows={3} /></Field>\n<Switch label="Email notifications" defaultChecked />\n<Checkbox label="Public workspace" />\n<Button variant="primary">Save changes</Button>',
    render: () => h("div", {style: stack},
      h(Field, {label: "Workspace"}, h(Input, {defaultValue: "Acme"})),
      h(Field, {label: "Description"}, h(Textarea, {rows: 3, defaultValue: "Internal tooling."})),
      h(Switch, {label: "Email notifications", defaultChecked: true}),
      h(Checkbox, {label: "Public workspace"}),
      h("div", {style: row}, h(Button, {variant: "primary"}, "Save changes"))),
  },
  {
    variant: "Search",
    name: "Filter row",
    description: "Search plus a scope select — the pair that heads most collections.",
    uses: ["SearchField", "Select"],
    // aria-label no Select: numa fila de filtro o rótulo visível seria ruído, mas sem nome
    // acessível o axe reprova (select-name) — o exemplo mostra o jeito certo, não o cômodo.
    code: ['<SearchField placeholder="Search components…" />',
      '<Select aria-label="Category" defaultValue="all">',
      '  <option value="all">All categories</option>',
      '</Select>'].join("\n"),
    render: () => h("div", {style: {...row, width: "min(520px,100%)"}},
      h("div", {style: {flex: 1, minWidth: "200px"}}, h(SearchField, {placeholder: "Search components…"})),
      h(Select, {defaultValue: "all", "aria-label": "Category"}, h("option", {value: "all"}, "All categories"))),
  },
];
