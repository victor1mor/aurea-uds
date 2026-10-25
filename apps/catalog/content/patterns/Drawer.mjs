// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Fechando o `G-AXIS-01`, a medição do `G-COMP-01` ganhou forma: a média de 0,86 composição por
// componente escondia a distribuição real — **77 dos 90 componentes tinham ZERO**, e um punhado
// carregava tudo. As referências não têm essa forma: duas delas estão em cobertura total, e uma
// terceira só deixa infra de fora. O alvo, portanto, não é "subir a média": é **nenhum componente
// em zero**. Este arquivo é parte dessa cobertura.
import {createElement as h} from "react";
import {Drawer, Button, Field, Input, Select} from "../../../../packages/react/dist/index.js";
import {ComJanela} from "../_estado.mjs";

export default [
  {
    variant: "Right",
    name: "Detail panel beside the list",
    description: "The row stays on screen and the detail slides in beside it — the reason to pick a drawer over a dialog is exactly this: the context does not disappear.",
    uses: ["Drawer", "Button", "Field"],
    code: `<Drawer open={open} onClose={close} side="right" title="Run #4821">
  <Field label="Status"><Input readOnly value="waiting_approval" /></Field>
  <Field label="Started"><Input readOnly value="14:31" /></Field>
</Drawer>`,
    render: () => h(ComJanela, {
      gatilho: (abrir) => h(Button, {variant: "outline", onClick: abrir}, "Open run"),
      janela: (open, fechar) => h(Drawer, {open, onClose: fechar, side: "right", title: "Run #4821"},
        h(Field, {label: "Status"}, h(Input, {readOnly: true, value: "waiting_approval"})),
        h(Field, {label: "Started"}, h(Input, {readOnly: true, value: "14:31"})))}),
  },
  {
    variant: "Left",
    name: "Filters that stay open while you read",
    description: "Filters on the left, results on the right. A dialog would cover the results the filters are changing, which is the one thing a filter panel must not do.",
    uses: ["Drawer", "Select", "Button"],
    code: `<Drawer open={open} onClose={close} side="left" title="Filters">
  <Field label="Status"><Select>…</Select></Field>
  <Field label="Owner"><Select>…</Select></Field>
  <Button variant="primary" fullWidth onClick={apply}>Apply</Button>
</Drawer>`,
    render: () => h(ComJanela, {
      gatilho: (abrir) => h(Button, {variant: "outline", leadingIcon: "funnel", onClick: abrir}, "Filters"),
      janela: (open, fechar) => h(Drawer, {open, onClose: fechar, side: "left", title: "Filters"},
        h(Field, {label: "Status"}, h(Select, {defaultValue: "any", items: [{value: "any", label: "Any status"},
          {value: "running", label: "Running"}, {value: "failed", label: "Failed"}]})),
        h(Field, {label: "Owner"}, h(Select, {defaultValue: "anyone", items: [{value: "anyone", label: "Anyone"},
          {value: "me", label: "Me"}]})),
        h(Button, {variant: "primary", fullWidth: true, onClick: fechar}, "Apply"))}),
  },
];
