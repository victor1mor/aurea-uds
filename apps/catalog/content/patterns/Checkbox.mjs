// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";
export default [
  {
    variant: "Consent",
    name: "One box that gates the action",
    description: "The label is the whole sentence and it is clickable — a checkbox whose label is not part of the target is a 16px hit area, which fails on touch. Never pre-checked when it grants permission.",
    uses: ["Checkbox"],
    code: `<Checkbox
  label="Send me release notes"
  description="About once a month. You can turn this off any time."
/>`,
    render: () => h("div", {style: {width: "min(420px,100%)"}}, h(A.Checkbox, {
      label: "Send me release notes",
      description: "About once a month. You can turn this off any time."})),
  },
  {
    variant: "List",
    name: "A set where several answers are right",
    description: "Checkbox, not radio, is the difference between 'pick any' and 'pick one'. The rule is the answer, not the look: if zero selected is a legitimate state, it is a checkbox.",
    uses: ["Checkbox"],
    code: `<fieldset>
  <legend>Notify me about</legend>
  <Checkbox label="Failed runs" />
  <Checkbox label="New members" />
  <Checkbox label="Weekly summary" />
</fieldset>`,
    render: () => h("div", {style: {display: "flex", flexDirection: "column", gap: "var(--space-2)"}},
      h(A.Checkbox, {label: "Failed runs"}), h(A.Checkbox, {label: "New members"}),
      h(A.Checkbox, {label: "Weekly summary"})),
  },
];
