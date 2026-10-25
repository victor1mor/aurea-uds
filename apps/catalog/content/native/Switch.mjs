// O Switch do nativo no site (bloco 1, o 5-A — 23/10/2026): o interruptor da Aurea (não o do sistema), controlado —
// cada exemplo guarda o próprio estado e responde ao toque. Todo valor das props do tipo em exemplo.
import {createElement as h, useState} from "react";
import {Switch} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const coluna = {display: "grid", gap: "var(--space-3)", width: "min(26rem, 100%)"};

function Interruptor({inicial = false, ...props}) {
  const [ligado, setLigado] = useState(inicial);
  return h(Switch, {checked: ligado, onChange: setLigado, ...props});
}

const LONGO = "Unlock with fingerprint on this phone, and ask again after five minutes away";

export default {
  install: 'import {Switch} from "@aurea-uds/native";',
  api: {
    label: "The text beside the track, and the name the screen reader hears. Inside a Field without a label, the Field's label names it.",
    description: "A muted line under the label. As text it is also the hint the screen reader reads.",
    checked: "Whether it is on. Controlled: the screen keeps the state.",
    onChange: "Called with the new value on every touch.",
    disabled: "Dims the row; the touch does nothing and it is announced as disabled.",
    size: "The size step: the track is the control height wide and half of it tall.",
    align: "Where the track sits against the text: center (the default) on the middle of the block; start on the middle of the first line, for a long label.",
    accessibilityLabel: "The name for the screen reader when it should not be written beside the track — a list row that already shows it. It wins over label.",
    style: "Style for the row.",
    testID: "Test id of the row.",
  },
  examples: [
    {
      title: "Usage",
      description: "Aurea's own track and thumb, not the system's switch; with reduced motion the thumb jumps instead of sliding.",
      code: `const [alerts, setAlerts] = useState(true);

<Switch label="Price alerts" checked={alerts} onChange={setAlerts} />`,
      render: () => h(Interruptor, {inicial: true, label: "Price alerts"}),
    },
    cada({titulo: "Sizes", descricao: "The touch scale: the track is as wide as the control is tall.",
      valores: ["sm", "md", "lg"], coluna: true,
      codigo: v => `<Switch size="${v}" label="Size ${v}" checked={on} onChange={setOn} />`,
      peca: v => h(Interruptor, {size: v, label: `Size ${v}`, inicial: true})}),
    {
      title: "Description",
      code: `<Switch label="Unlock with fingerprint"
  description="Asks again after five minutes away."
  checked={unlock} onChange={setUnlock} />`,
      render: () => h(Interruptor, {label: "Unlock with fingerprint", description: "Asks again after five minutes away."}),
    },
    cada({titulo: "Alignment", descricao: "center puts the track on the middle of the text; start puts it on the middle of the first line, for a label that wraps.",
      valores: ["center", "start"], estilo: coluna,
      codigo: v => `<Switch align="${v}" label="${LONGO}" checked={unlock} onChange={setUnlock} />`,
      peca: v => h(Interruptor, {align: v, label: LONGO})}),
    {
      title: "Disabled",
      code: `<Switch label="Managed by your company" checked disabled />
<Switch label="Not available on this device" disabled />`,
      render: () => h("div", {style: coluna},
        h(Switch, {label: "Managed by your company", checked: true, disabled: true}),
        h(Switch, {label: "Not available on this device", disabled: true})),
    },
    {
      title: "Named, not written",
      description: "With accessibilityLabel and no label, the track stands alone and still has a name.",
      code: `<Switch accessibilityLabel="Notifications for this report" checked={on} onChange={setOn} />`,
      render: () => h(Interruptor, {accessibilityLabel: "Notifications for this report"}),
    },
  ],
};
