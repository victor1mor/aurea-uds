// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";
export default [
  {
    variant: "Native",
    name: "A short, closed list of options",
    description: "The native select is the right answer more often than it gets used: it is the control the platform already knows how to render on a phone, and it needs no portal, no listbox and no keyboard code. Reach for a Combobox when typing beats scrolling.",
    uses: ["Select", "Field"],
    code: `<Field label="Visibility">
  <Select defaultValue="team">
    <option value="private">Only me</option>
    <option value="team">My team</option>
    <option value="public">Anyone with the link</option>
  </Select>
</Field>`,
    render: () => h("div", {style: {width: "min(360px,100%)"}},
      h(A.Field, {label: "Visibility"}, h(A.Select, {defaultValue: "team"},
        h("option", {value: "private"}, "Only me"), h("option", {value: "team"}, "My team"),
        h("option", {value: "public"}, "Anyone with the link")))),
  },
];
