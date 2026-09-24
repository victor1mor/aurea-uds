// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import {CodeEditor} from "../../../../packages/react/dist/code-editor.js";

export default [
  {
    variant: "Editable",
    name: "A snippet the reader can change",
    description: "An editor, not a code block: the reader types. Use it where the change is the point — a query, a config, a rule — and use CodeBlock everywhere else, because a read-only editor costs a bundle it does not earn.",
    uses: ["CodeEditor"],
    code: `<CodeEditor defaultValue={\`select count(*)\nfrom runs\nwhere status = 'failed'\`} />`,
    render: () => h("div", {style: {width: "min(520px,100%)"}}, h(CodeEditor, null)),
  },
];
