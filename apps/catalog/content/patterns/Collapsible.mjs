// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
//
// Collapsible ≠ Accordion. Um disparador, uma região, INDEPENDENTE — nada fecha porque outra
// coisa abriu. O Accordion é o conjunto com essa regra; escolher errado entre os dois é o erro
// mais comum aqui, e é por isso que cada pattern abaixo diz por que é este e não aquele.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";

const largo = {width: "min(560px,100%)"};
const pilha = {display: "grid", gap: "var(--space-3)"};

export default [
  {
    variant: "Uncontrolled",
    name: "Advanced options, folded away",
    description: "The default answer for a form section most people never open. `defaultOpen` is left off and the state stays inside the component — a consumer that does not need to read the state should not have to hold it.",
    uses: ["Collapsible", "Field", "Input", "Switch"],
    code: `<Collapsible trigger="Advanced">
  <Field label="Timeout (ms)"><Input defaultValue="30000" inputMode="numeric" /></Field>
  <Switch label="Retry on failure" defaultChecked />
</Collapsible>`,
    render: () => h("div", {style: largo}, h(A.Collapsible, {trigger: "Advanced"},
      h("div", {style: pilha},
        h(A.Field, {label: "Timeout (ms)"}, h(A.Input, {defaultValue: "30000", inputMode: "numeric"})),
        h(A.Switch, {label: "Retry on failure", defaultChecked: true})))),
  },
  {
    variant: "Open",
    name: "A detail already unfolded",
    description: "`defaultOpen` starts unfolded but leaves the reader in charge of folding it back. Use it when the content is the point of the screen and the fold is a courtesy, not a filter.",
    uses: ["Collapsible", "DataList"],
    code: `<Collapsible trigger="Run details" defaultOpen>
  <DataList items={[
    {term: "Started", value: "09:12:04"},
    {term: "Duration", value: "1m 48s"},
    {term: "Exit code", value: "0"},
  ]} />
</Collapsible>`,
    render: () => h("div", {style: largo}, h(A.Collapsible, {trigger: "Run details", defaultOpen: true},
      h(A.DataList, {items: [
        {term: "Started", value: "09:12:04"},
        {term: "Duration", value: "1m 48s"},
        {term: "Exit code", value: "0"}]}))),
  },
  {
    variant: "Controlled",
    name: "Fold driven from outside",
    description: "`open` plus `onOpenChange` when something else in the screen decides — a \"expand all\" button, a deep link, a search that has to reveal the match it found. Passing `open` without `onOpenChange` freezes it, which is a legitimate read-only state and not a bug.",
    uses: ["Collapsible", "Button"],
    code: `const [open, setOpen] = useState(false);

<Button size="sm" variant="ghost" onClick={() => setOpen(o => !o)}>
  {open ? "Collapse all" : "Expand all"}
</Button>
<Collapsible trigger="Environment" open={open} onOpenChange={setOpen}>
  <CodeBlock>{env}</CodeBlock>
</Collapsible>`,
    render: () => h("div", {style: {...largo, ...pilha}},
      h("div", null, h(A.Button, {size: "sm", variant: "ghost"}, "Collapse all")),
      h(A.Collapsible, {trigger: "Environment", open: true},
        h(A.CodeBlock, null, "NODE_ENV=production\nAUREA_THEME=dark"))),
  },
  {
    variant: "Disabled",
    name: "A section that cannot be opened yet",
    description: "`disabled` keeps the row in place while the content is unavailable, instead of removing it. A section that disappears and comes back renumbers everything around it; a section that stays says the same thing without moving anything.",
    uses: ["Collapsible"],
    code: `<Collapsible trigger="Billing history" disabled>
  <p>Available once the first invoice is issued.</p>
</Collapsible>`,
    render: () => h("div", {style: largo}, h(A.Collapsible, {trigger: "Billing history", disabled: true},
      h("p", {className: "muted"}, "Available once the first invoice is issued."))),
  },
];
