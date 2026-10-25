// O Checkbox do nativo no site (bloco 1, o 5-A — 23/10/2026): a caixa que marca, controlada, rodando pelo
// `react-native-web` — cada exemplo guarda o próprio estado e responde ao toque. Todo valor das props do tipo em exemplo.
import {createElement as h, useState} from "react";
import {Checkbox} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const coluna = {display: "grid", gap: "var(--space-3)", width: "min(26rem, 100%)"};

// Cada caixa guarda o próprio `checked`, como a tela do app guardaria.
function Caixa({inicial = false, ...props}) {
  const [marcado, setMarcado] = useState(inicial);
  return h(Checkbox, {checked: marcado, onChange: setMarcado, ...props});
}

const LONGO = "Send me a copy of every invoice, including the ones paid by another person on the account";

export default {
  install: 'import {Checkbox} from "@aurea-uds/native";',
  description: "Binary selection control: ticked or not. The whole row, box and text, is the touch target.",
  api: {
    label: "The text beside the box, and the name the screen reader hears. Inside a Field without a label, the Field's label names it.",
    description: "A muted line under the label, for the consequence of ticking it. As text it is also the hint the screen reader reads.",
    checked: "Whether it is ticked. Controlled: the screen keeps the state.",
    onChange: "Called with the new value on every touch.",
    disabled: "Dims the row; the touch does nothing and it is announced as disabled.",
    size: "The size step; the box is half the control height. Inside a Field it follows the Field's size.",
    align: "Where the box sits against the text: center on the whole block, or start on the middle of the first line, for a label that wraps.",
    accessibilityLabel: "The name for the screen reader when it should not be written beside the box — a list row that already shows it. It wins over label.",
    style: "Style for the row.",
    testID: "Test id of the row.",
  },
  examples: [
    {
      title: "Usage",
      code: `const [weekly, setWeekly] = useState(true);

<Checkbox label="Email me the weekly report" checked={weekly} onChange={setWeekly} />`,
      render: () => h(Caixa, {inicial: true, label: "Email me the weekly report"}),
    },
    cada({titulo: "Sizes", descricao: "The touch scale: the box is half the height of the control at each step.",
      valores: ["sm", "md", "lg"], coluna: true,
      codigo: v => `<Checkbox size="${v}" label="Size ${v}" checked={on} onChange={setOn} />`,
      peca: v => h(Caixa, {size: v, label: `Size ${v}`, inicial: true})}),
    {
      title: "Description",
      description: "A second, muted line under the label says what ticking it does.",
      code: `<Checkbox label="Share usage data"
  description="Helps us find slow screens. No personal data."
  checked={share} onChange={setShare} />`,
      render: () => h(Caixa, {label: "Share usage data", description: "Helps us find slow screens. No personal data."}),
    },
    cada({titulo: "Alignment", descricao: "center puts the box in the middle of the text block; start puts it on the first line, which reads better when the label wraps.",
      valores: ["center", "start"], estilo: coluna,
      codigo: v => `<Checkbox align="${v}" label="${LONGO}" checked={copy} onChange={setCopy} />`,
      peca: v => h(Caixa, {align: v, label: LONGO})}),
    {
      title: "Disabled",
      description: "Dimmed, announced as disabled, and the touch does nothing — ticked or not.",
      code: `<Checkbox label="Required by your plan" checked disabled />
<Checkbox label="Not available on this device" disabled />`,
      render: () => h("div", {style: coluna},
        h(Checkbox, {label: "Required by your plan", checked: true, disabled: true}),
        h(Checkbox, {label: "Not available on this device", disabled: true})),
    },
    {
      title: "Named, not written",
      description: "With accessibilityLabel and no label, the box stands alone and still has a name.",
      code: `<Checkbox accessibilityLabel="Select the October invoice" checked={picked} onChange={setPicked} />`,
      render: () => h(Caixa, {accessibilityLabel: "Select the October invoice"}),
    },
  ],
};
