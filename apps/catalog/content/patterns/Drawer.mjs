// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Fechando o `G-AXIS-01`, a medição do `G-COMP-01` ganhou forma: a média de 0,86 composição por
// componente escondia a distribuição real — **77 dos 90 componentes tinham ZERO**, e um punhado
// carregava tudo. As referências não têm essa forma: kibo e reui estão em cobertura total, e a
// shark só deixa infra de fora. O alvo, portanto, não é "subir a média": é **nenhum componente
// em zero**. Este arquivo é parte dessa cobertura.
import {createElement as h} from "react";
import {Drawer, Button, Field, Input, Select} from "../../../../packages/react/dist/index.js";

const PORTAL = "This page is static HTML: the drawer lives in a portal and only exists in a real "
  + "React app. The preview shows the trigger; the code is the whole composition.";

export default [
  {
    variant: "Right",
    name: "Detail panel beside the list",
    description: "The row stays on screen and the detail slides in beside it — the reason to pick a drawer over a dialog is exactly this: the context does not disappear.",
    uses: ["Drawer", "Button", "Field"],
    note: PORTAL,
    code: `<Drawer open={open} onClose={close} side="right" title="Run #4821">
  <Field label="Status"><Input readOnly value="waiting_approval" /></Field>
  <Field label="Started"><Input readOnly value="14:31" /></Field>
</Drawer>`,
    render: () => h(Button, {variant: "outline"}, "Open run"),
  },
  {
    variant: "Left",
    name: "Filters that stay open while you read",
    description: "Filters on the left, results on the right. A dialog would cover the results the filters are changing, which is the one thing a filter panel must not do.",
    uses: ["Drawer", "Select", "Button"],
    note: PORTAL,
    code: `<Drawer open={open} onClose={close} side="left" title="Filters">
  <Field label="Status"><Select>…</Select></Field>
  <Field label="Owner"><Select>…</Select></Field>
  <Button variant="primary" fullWidth onClick={apply}>Apply</Button>
</Drawer>`,
    render: () => h(Button, {variant: "outline", leadingIcon: "filter"}, "Filters"),
  },
];
