// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";
export default [
  {
    variant: "Formatting",
    name: "The alignment row of an editor",
    description: "Arrow keys walk the group and only one alignment can be true at a time. With multiple it becomes a filter bar where none selected is legitimate — the same component, a different contract.",
    uses: ["ToggleGroup", "Toggle"],
    code: `<ToggleGroup label="Alignment" defaultValue={["left"]}>
  <Toggle value="left" icon="text--align--left" label="Align left" />
  <Toggle value="center" icon="text--align--center" label="Center" />
  <Toggle value="right" icon="text--align--right" label="Align right" />
</ToggleGroup>`,
    render: () => h(A.ToggleGroup, {label: "Alignment", defaultValue: ["left"]},
      h(A.Toggle, {value: "left", icon: "text--align--left", label: "Align left"}),
      h(A.Toggle, {value: "center", icon: "text--align--center", label: "Center"}),
      h(A.Toggle, {value: "right", icon: "text--align--right", label: "Align right"})),
  },
];
