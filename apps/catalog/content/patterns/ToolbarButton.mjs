// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
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
  <ToolbarButton pressed leadingIcon="text--bold">Bold</ToolbarButton>
  <ToolbarButton leadingIcon="text--italic">Italic</ToolbarButton>
</Toolbar>`,
    render: () => h(A.Toolbar, {label: "Formatting"},
      h(A.ToolbarButton, {pressed: true, leadingIcon: "text--bold"}, "Bold"),
      h(A.ToolbarButton, {leadingIcon: "text--italic"}, "Italic")),
  },
  {
    variant: "Ghost",
    name: "An unavailable step kept in place",
    description: "`disabled` on the step that cannot run — never removing it. A bar whose buttons come and go renumbers itself under the reader's hand, and the muscle memory that a toolbar exists to build never forms.",
    uses: ["Toolbar", "ToolbarButton"],
    code: `<Toolbar label="History">
  <ToolbarButton leadingIcon="undo" disabled>Undo</ToolbarButton>
  <ToolbarButton leadingIcon="redo">Redo</ToolbarButton>
</Toolbar>`,
    render: () => h(A.Toolbar, {label: "History"},
      h(A.ToolbarButton, {leadingIcon: "undo", disabled: true}, "Undo"),
      h(A.ToolbarButton, {leadingIcon: "redo"}, "Redo")),
  },
  {
    variant: "Primary",
    name: "The one action that is not a tool",
    description: "A toolbar is mostly ghost buttons because they are peers; the moment one of them is the point of the screen it takes a tone of its own. One per bar — a bar of primaries has no primary.",
    uses: ["Toolbar", "ToolbarButton", "ToolbarSeparator"],
    code: `<Toolbar label="Draft">
  <ToolbarButton leadingIcon="save">Save</ToolbarButton>
  <ToolbarButton leadingIcon="view">Preview</ToolbarButton>
  <ToolbarSeparator />
  <ToolbarButton variant="primary">Publish</ToolbarButton>
</Toolbar>`,
    render: () => h(A.Toolbar, {label: "Draft"},
      h(A.ToolbarButton, {leadingIcon: "save"}, "Save"),
      h(A.ToolbarButton, {leadingIcon: "view"}, "Preview"),
      h(A.ToolbarSeparator),
      h(A.ToolbarButton, {variant: "primary"}, "Publish")),
  },
];
