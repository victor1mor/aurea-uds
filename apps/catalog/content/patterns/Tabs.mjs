// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import {Tabs} from "../../../../packages/react/dist/index.js";

export default [
  {
    variant: "Views",
    name: "Two readings of the same thing",
    description: "Tabs are for alternative views of one subject, never for steps — a step has an order and a tab does not. If the user must visit all of them, it was a form, not a tab set.",
    uses: ["Tabs"],
    code: `const [tab, setTab] = useState("preview");

<Tabs
  label="Component view"
  value={tab}
  onChange={setTab}
  tabs={[
    {id: "preview", label: "Preview", content: <Preview />},
    {id: "code", label: "Code", content: <Code />},
  ]}
/>`,
    render: () => h("div", {style: {width: "min(520px,100%)"}}, h(Tabs, {
      label: "Component view", value: "preview", onChange: () => {},
      tabs: [
        {id: "preview", label: "Preview", content: "The rendered component, on the page background."},
        {id: "code", label: "Code", content: "The exact source a consumer copies."},
      ]})),
  },
  {
    variant: "Vertical",
    name: "A column of sections beside the content",
    description: "`orientation=\"vertical\"` when the labels are words rather than one-word nouns, or when there are more of them than a row can hold without scrolling. The root becomes a grid and not a row: on a row the panel and the list share a line, and a tall panel would stretch the label column with it.",
    uses: ["Tabs"],
    code: `<Tabs
  orientation="vertical"
  label="Settings"
  value={section}
  onChange={setSection}
  tabs={[
    {id: "profile", label: "Profile", content: <Profile />},
    {id: "notifications", label: "Notifications", content: <Notifications />},
    {id: "billing", label: "Billing and invoices", content: <Billing />},
  ]}
/>`,
    render: () => h("div", {style: {width: "min(620px,100%)"}}, h(Tabs, {
      orientation: "vertical", label: "Settings", value: "profile", onChange: () => {},
      tabs: [
        {id: "profile", label: "Profile", content: "Name, avatar and the handle other people see."},
        {id: "notifications", label: "Notifications", content: "What reaches you, and where."},
        {id: "billing", label: "Billing and invoices", content: "Plan, seats and the invoice history."},
      ]})),
  },
  {
    variant: "Manual activation",
    name: "When switching a tab costs a request",
    description: "With the default, the arrow key switches the panel along with focus — right when the panel is already there. When each tab fetches, that means crossing five tabs fires five requests. `activateOnFocus={false}` is the APG's manual pattern: the arrow only moves focus, and Enter or Space commits. The choice belongs to the panel's cost, not to taste.",
    uses: ["Tabs"],
    code: `<Tabs
  label="Report"
  activateOnFocus={false}
  value={tab}
  onChange={setTab}
  tabs={[
    {id: "summary", label: "Summary", content: <Summary />},
    {id: "runs", label: "Runs", content: <Runs />},
    {id: "audit", label: "Audit log", content: <AuditLog />},
  ]}
/>`,
    render: () => h("div", {style: {width: "min(620px,100%)"}}, h(Tabs, {
      label: "Report", activateOnFocus: false, value: "summary", onChange: () => {},
      tabs: [
        {id: "summary", label: "Summary", content: "Cheap: already on the page."},
        {id: "runs", label: "Runs", content: "One request per visit — worth not firing by accident."},
        {id: "audit", label: "Audit log", content: "The expensive one, and the reason for the manual pattern."},
      ]})),
  },
];
