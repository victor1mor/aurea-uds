// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
//
// CodeBlock é LEITURA: um <pre> com rolagem própria e cópia opcional. Quem edita usa o
// CodeEditor. Os dois existem porque a diferença não é de tamanho, é de intenção — e o de
// leitura não carrega o peso do motor de edição.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";

const largo = {width: "min(560px,100%)"};

export default [
  {
    variant: "Copyable",
    name: "The install line",
    description: "The shortest useful block: one command, one button. `copyable` is what makes it a block instead of a paragraph — a reader who has to select the text by hand will select the prompt with it.",
    uses: ["CodeBlock"],
    code: `<CodeBlock language="bash" copyable>pnpm add @aurea-uds/react @aurea-uds/core</CodeBlock>`,
    render: () => h("div", {style: largo}, h(A.CodeBlock, {language: "bash", copyable: true},
      "pnpm add @aurea-uds/react @aurea-uds/core")),
  },
  {
    variant: "Copyable",
    name: "A snippet under a heading",
    description: "The shape every documentation page repeats: a sentence that says what the code does, then the code. The block keeps its own horizontal scroll, so a long line never widens the page around it.",
    uses: ["Card", "CodeBlock"],
    code: `<Card>
  <h3>Set the theme from the server</h3>
  <p className="muted">Write it on the root element so the first paint is already right.</p>
  <CodeBlock language="tsx" copyable>{snippet}</CodeBlock>
</Card>`,
    render: () => h("div", {style: largo}, h(A.Card, null,
      // <strong> e não <h3> no PREVIEW: a demo mora sob o <h1> da página do pattern e não
      // há <h2> entre os dois, então um h3 aqui seria salto de nível — o gate
      // `catalog-sweep` cobra isso em toda página. O `code` mostra o <h3> porque é o que
      // o consumidor escreve DENTRO da própria página, onde o nível existe.
      h("strong", {style: {display: "block", fontSize: "var(--text-base)"}},
        "Set the theme from the server"),
      h("p", {className: "muted"}, "Write it on the root element so the first paint is already right."),
      h(A.CodeBlock, {language: "tsx", copyable: true},
        '<html lang="en" data-theme={theme}>\n  <body>{children}</body>\n</html>'))),
  },
  {
    variant: "Plain",
    name: "Output, not source",
    description: "`language=\"text\"` is the default for a reason: not everything in a block is code. A stack trace or a command's output is quoted verbatim, and pretending it is a language would colour tokens that are not tokens.",
    uses: ["CodeBlock"],
    code: `<CodeBlock>{stderr}</CodeBlock>`,
    render: () => h("div", {style: largo}, h(A.CodeBlock, null,
      "error TS2322: Type 'string' is not assignable to type 'ButtonTone'.\n"
      + "  packages/react/src/actions.tsx:118:14")),
  },
];
