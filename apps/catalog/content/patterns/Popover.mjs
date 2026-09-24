// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: a medição mostrou 77 dos 90 componentes com ZERO composição
// resolvida, contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import {Popover, Button, IconButton} from "../../../../packages/react/dist/index.js";

const PORTAL = "This page is static HTML: the popup lives in a portal and only exists in a real "
  + "React app. The preview shows the trigger; the code is the whole composition.";

export default [
  {
    variant: "Explain",
    name: "The definition behind a number",
    description: "A popover, not a tooltip: the content is rich, it stays open, and the pointer can travel into it to select text. A tooltip that needs a second sentence should have been this.",
    uses: ["Popover", "IconButton"],
    note: PORTAL,
    code: `<Popover
  title="How P95 is measured"
  trigger={<IconButton variant="ghost" size="sm" icon="information" label="About P95" />}
>
  The slowest 5% of runs are excluded. The window is the last 30 minutes,
  recalculated every minute.
</Popover>`,
    render: () => h(IconButton, {variant: "ghost", size: "sm", icon: "information", label: "About P95"}),
  },
];
