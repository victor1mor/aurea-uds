// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
//
// `items` e não `<Step>` como filho: é o idioma da casa (Timeline, DataList, Breadcrumb) e
// resolve de graça a numeração, que sai do índice e não de uma prop a manter em sincronia.
// Não existe padrão APG para stepper; a prática adotada é `role="list"` com `aria-current="step"`.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";

const cheio = {width: "min(680px,100%)"};

export default [
  {
    variant: "Progress",
    name: "Where you are in a sequence",
    description: "Three states in one row: what is done, what you are on, what is left. The current step carries `aria-current=\"step\"`, so the position is announced and not only drawn — a stepper that only draws is a decoration.",
    uses: ["Stepper"],
    code: `<Stepper label="Checkout" items={[
  {label: "Cart", state: "done"},
  {label: "Address", state: "active"},
  {label: "Payment"},
]} />`,
    render: () => h("div", {style: cheio}, h(A.Stepper, {label: "Checkout", items: [
      {label: "Cart", state: "done"},
      {label: "Address", state: "active"},
      {label: "Payment"}]})),
  },
  {
    variant: "Progress",
    name: "A step that can be skipped",
    description: "`optional` says out loud what a greyed-out label only implies. Marking it is what lets a reader decide to move on, instead of hunting for the field they think they missed.",
    uses: ["Stepper"],
    code: `<Stepper label="Onboarding" items={[
  {label: "Account", state: "done"},
  {label: "Team", state: "done", optional: "Skipped"},
  {label: "Import data", state: "active", optional: "Optional"},
  {label: "Finish"},
]} />`,
    render: () => h("div", {style: cheio}, h(A.Stepper, {label: "Onboarding", items: [
      {label: "Account", state: "done"},
      {label: "Team", state: "done", optional: "Skipped"},
      {label: "Import data", state: "active", optional: "Optional"},
      {label: "Finish"}]})),
  },
  {
    variant: "Error",
    name: "A step that failed",
    description: "`state: \"error\"` keeps the failure in the sequence instead of replacing it with an alert somewhere else. The reader sees which step broke and how far they had got, which is the pair of facts they need to decide whether to fix or restart.",
    uses: ["Stepper", "Alert"],
    code: `<Stepper label="Deploy" items={[
  {label: "Build", state: "done"},
  {label: "Test", state: "error"},
  {label: "Release"},
]} />
<Alert variant="danger" title="Tests failed">Two suites did not pass.</Alert>`,
    render: () => h("div", {style: {...cheio, display: "grid", gap: "var(--space-4)"}},
      h(A.Stepper, {label: "Deploy", items: [
        {label: "Build", state: "done"},
        {label: "Test", state: "error"},
        {label: "Release"}]}),
      h(A.Alert, {variant: "danger", title: "Tests failed"},
        h("p", null, "Two suites did not pass. Fix them and the deploy resumes from here."))),
  },
  {
    variant: "Navigable",
    name: "Going back to a finished step",
    description: "`onClick` turns a step into a real button — but only where going back is allowed. Leaving the unreached steps inert is the point: a stepper whose every step is clickable is a tab list wearing the wrong clothes.",
    uses: ["Stepper"],
    code: `<Stepper label="Checkout" items={[
  {label: "Cart", state: "done", onClick: () => goTo(0)},
  {label: "Address", state: "done", onClick: () => goTo(1)},
  {label: "Payment", state: "active"},
  {label: "Review"},
]} />`,
    render: () => h("div", {style: cheio}, h(A.Stepper, {label: "Checkout", items: [
      {label: "Cart", state: "done", onClick: () => {}},
      {label: "Address", state: "done", onClick: () => {}},
      {label: "Payment", state: "active"},
      {label: "Review"}]})),
  },
];
