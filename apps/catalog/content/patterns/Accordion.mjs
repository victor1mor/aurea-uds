// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import {Accordion} from "../../../../packages/react/dist/index.js";

export default [
  {
    variant: "FAQ",
    name: "Questions on a marketing page",
    description: "The title is the question in the reader's own words, not a category. An accordion earns its place when the reader wants one answer, not all of them — otherwise plain headings read faster.",
    uses: ["Accordion"],
    code: `<Accordion items={[
  {id: "ship", title: "How do I ship it?",
   content: "Install the three packages and import the CSS. Nothing to configure."},
  {id: "theme", title: "Can I match my brand?",
   content: "Every visual value is a token. Override the ones you need."},
  {id: "a11y", title: "Is it accessible?",
   content: "Keyboard and ARIA come from the engine; contrast is gated in CI."},
]} />`,
    render: () => h("div", {style: {width: "min(520px,100%)"}}, h(Accordion, {items: [
      {id: "ship", title: "How do I ship it?", content: "Install the three packages and import the CSS. Nothing to configure."},
      {id: "theme", title: "Can I match my brand?", content: "Every visual value is a token. Override the ones you need."},
      {id: "a11y", title: "Is it accessible?", content: "Keyboard and ARIA come from the engine; contrast is gated in CI."},
    ]})),
  },
  {
    variant: "Settings",
    name: "Advanced options, folded away",
    description: "The defaults are enough for most people, so the rest starts closed. Folding is not hiding: the summary line says what is inside, so nobody has to open it to find out.",
    uses: ["Accordion"],
    code: `<Accordion items={[
  {id: "retry", title: "Retries and timeouts", content: <RetryForm />},
  {id: "net", title: "Network and proxy", content: <NetworkForm />},
]} />`,
    render: () => h("div", {style: {width: "min(520px,100%)"}}, h(Accordion, {items: [
      {id: "retry", title: "Retries and timeouts", content: "Attempts: 3 · Backoff: exponential · Timeout: 30s"},
      {id: "net", title: "Network and proxy", content: "No proxy configured. Outbound requests go direct."},
    ]})),
  },
];
