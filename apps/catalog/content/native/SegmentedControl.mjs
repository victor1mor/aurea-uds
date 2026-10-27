// O SegmentedControl do nativo no site (bloco 1, o 5-A — 23/10/2026): um de poucos, lado a lado, controlado — cada
// exemplo guarda a própria escolha e responde ao toque. Todo valor das props do tipo em exemplo.
import {createElement as h, useState} from "react";
import {SegmentedControl} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const PERIODOS = [{value: "day", label: "Day"}, {value: "week", label: "Week"}, {value: "month", label: "Month"}];
const ITENS_CODIGO = `const periods = [
  {value: "day", label: "Day"},
  {value: "week", label: "Week"},
  {value: "month", label: "Month"},
];`;
const larga = {display: "grid", gap: "var(--space-4)", width: "100%"};

function Segmentos({inicial = "week", items = PERIODOS, label = "Period", ...props}) {
  const [valor, setValor] = useState(inicial);
  return h(SegmentedControl, {items, value: valor, onChange: setValor, label, ...props});
}

const TIPOS = ["Oil", "Tyres", "Brakes", "Battery", "Filters", "Inspection"].map((n) => ({value: n.toLowerCase(), label: n}));

export default {
  install: 'import {SegmentedControl} from "@aurea-uds/native";',
  api: {
    disabled: "Dims the whole control; no segment takes the touch. Without it, the Field's.",
    justify: "Where the control sits in the row when it fits: start, center or end. When it does not fit, it scrolls from the start. No effect with fullWidth.",
    selectedStyle: "The colour of the selected segment (ADR-0084): current — the yellow capsule, the default — neutral (the white capsule with a shadow), contrast (graphite), brand (yellow), ring (a yellow ring) and dot (a yellow dot before the label).",
  },
  examples: [
    {
      title: "Usage",
      code: `${ITENS_CODIGO}\n\n<SegmentedControl label="Period" items={periods} value={period} onChange={setPeriod} />`,
      render: () => h(Segmentos),
    },
    cada({titulo: "Justify", descricao: "Where the control sits when it fits in the row.",
      valores: ["start", "center", "end"], estilo: larga,
      codigo: v => `<SegmentedControl justify="${v}" label="Period" items={periods} value={period} onChange={setPeriod} />`,
      peca: v => h(Segmentos, {justify: v, label: `Period, ${v}`})}),
    {
      title: "Full width",
      description: "fullWidth fills the row; each segment grows from its own label and never shrinks below it.",
      code: `<SegmentedControl fullWidth label="Period" items={periods} value={period} onChange={setPeriod} />`,
      render: () => h("div", {style: {width: "min(28rem, 100%)"}}, h(Segmentos, {fullWidth: true})),
    },
    {
      title: "More than fits",
      description: "When the options do not fit, the row scrolls sideways and the cut option is the sign that there is more; no label is squeezed.",
      code: `<SegmentedControl label="Service" items={services} value={service} onChange={setService} />`,
      render: () => h("div", {style: {width: "min(18rem, 100%)"}}, h(Segmentos, {items: TIPOS, inicial: "oil", label: "Service"})),
    },
    {
      title: "Disabled",
      code: `<SegmentedControl disabled label="Period" items={periods} value="week" />`,
      render: () => h(SegmentedControl, {disabled: true, label: "Period", items: PERIODOS, value: "week"}),
    },
    cada({titulo: "The colour of the selected segment", descricao: "selectedStyle (ADR-0084), the same six as on the web.",
      valores: ["current", "neutral", "contrast", "brand", "ring", "dot"], estilo: larga,
      codigo: v => `<SegmentedControl selectedStyle="${v}" label="Period" items={periods} value={period} onChange={setPeriod} />`,
      peca: v => h(Segmentos, {selectedStyle: v, label: `Period, ${v}`})}),
  ],
};
