// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total em duas das referências. O alvo é nenhum componente em zero.
//
// ToolbarButton ≠ Button. Ele recebe a MESMA `ButtonProps`, e é aí que mora a confusão: a
// diferença não está na API, está no que o Toolbar faz com ele — um único ponto de tabulação
// para a barra inteira, e seta para andar entre os botões. Fora de um Toolbar ele é um Button
// com um passo a mais, e o certo é usar Button.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";

export default [
  {
    variant: "Ghost",
    name: "A toggle that stays pressed",
    description: "`pressed` emits `aria-pressed`, so the state is announced and not only shaded. This is the whole reason a formatting bar uses ToolbarButton instead of a styled div: bold-is-on has to be a fact, not an appearance.",
    uses: ["Toolbar", "ToolbarButton"],
    code: `<Toolbar label="Formatting">
  <ToolbarButton pressed leadingIcon="text-b">Bold</ToolbarButton>
  <ToolbarButton leadingIcon="text-italic">Italic</ToolbarButton>
</Toolbar>`,
    render: () => h(A.Toolbar, {label: "Formatting"},
      h(A.ToolbarButton, {pressed: true, leadingIcon: "text-b"}, "Bold"),
      h(A.ToolbarButton, {leadingIcon: "text-italic"}, "Italic")),
  },
  {
    variant: "Ghost",
    name: "An unavailable step kept in place",
    description: "`disabled` on the step that cannot run — never removing it. A bar whose buttons come and go renumbers itself under the reader's hand, and the muscle memory that a toolbar exists to build never forms.",
    uses: ["Toolbar", "ToolbarButton"],
    code: `<Toolbar label="History">
  <ToolbarButton leadingIcon="arrow-counter-clockwise" disabled>Undo</ToolbarButton>
  <ToolbarButton leadingIcon="arrow-clockwise">Redo</ToolbarButton>
</Toolbar>`,
    render: () => h(A.Toolbar, {label: "History"},
      h(A.ToolbarButton, {leadingIcon: "arrow-counter-clockwise", disabled: true}, "Undo"),
      h(A.ToolbarButton, {leadingIcon: "arrow-clockwise"}, "Redo")),
  },
  {
    variant: "Primary",
    name: "The one action that is not a tool",
    description: "A toolbar is mostly ghost buttons because they are peers; the moment one of them is the point of the screen it takes a tone of its own. One per bar — a bar of primaries has no primary.",
    uses: ["Toolbar", "ToolbarButton", "ToolbarSeparator"],
    code: `<Toolbar label="Draft">
  <ToolbarButton leadingIcon="floppy-disk">Save</ToolbarButton>
  <ToolbarButton leadingIcon="eye">Preview</ToolbarButton>
  <ToolbarSeparator />
  <ToolbarButton variant="primary">Publish</ToolbarButton>
</Toolbar>`,
    render: () => h(A.Toolbar, {label: "Draft"},
      h(A.ToolbarButton, {leadingIcon: "floppy-disk"}, "Save"),
      h(A.ToolbarButton, {leadingIcon: "eye"}, "Preview"),
      h(A.ToolbarSeparator),
      h(A.ToolbarButton, {variant: "primary"}, "Publish")),
  },
];
