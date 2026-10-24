// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: a medição mostrou 77 dos 90 componentes com ZERO composição
// resolvida, contra cobertura total em duas das referências. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import {Popover, Button, IconButton} from "../../../../packages/react/dist/index.js";

export default [
  {
    variant: "Explain",
    name: "The definition behind a number",
    description: "A popover, not a tooltip: the content is rich, it stays open, and the pointer can travel into it to select text. A tooltip that needs a second sentence should have been this.",
    uses: ["Popover", "IconButton"],
    code: `<Popover
  title="How P95 is measured"
  trigger={<IconButton variant="ghost" size="sm" icon="info" label="About P95" />}
>
  The slowest 5% of runs are excluded. The window is the last 30 minutes,
  recalculated every minute.
</Popover>`,
    render: () => h(Popover, {title: "How P95 is measured",
      trigger: h(IconButton, {variant: "ghost", size: "sm", icon: "info", label: "About P95"})},
      "The slowest 5% of runs are excluded. The window is the last 30 minutes, recalculated every minute."),
  },
];
