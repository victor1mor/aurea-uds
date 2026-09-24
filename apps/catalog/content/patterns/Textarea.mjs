// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";
export default [
  {
    variant: "Long text",
    name: "A description field that grows",
    description: "Rows set the starting height, not the limit. The field keeps the pill radius of every other control, because a text area is still a field — the shape changes only when it becomes a composition box with its own toolbar.",
    uses: ["Textarea", "Field"],
    code: `<Field label="Description" hint="Markdown is supported">
  <Textarea rows={4} placeholder="What does this project do?" />
</Field>`,
    render: () => h("div", {style: {width: "min(460px,100%)"}},
      h(A.Field, {label: "Description", hint: "Markdown is supported"},
        h(A.Textarea, {rows: 4, placeholder: "What does this project do?"}))),
  },
];
