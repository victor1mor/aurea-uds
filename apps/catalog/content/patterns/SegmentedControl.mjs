// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import * as A from "../../../../packages/react/dist/index.js";
export default [
  {
    variant: "Range",
    name: "Switching the window of a chart",
    description: "One dimension, few values, and one is always chosen — that is what separates a segmented control from a button group. Zero selected is not a state it can express, so never use it for a filter that can be cleared.",
    uses: ["SegmentedControl"],
    code: `const [range, setRange] = useState("7d");

<SegmentedControl
  label="Range"
  value={range}
  onChange={setRange}
  items={[{value: "24h", label: "24h"}, {value: "7d", label: "7 days"}, {value: "30d", label: "30 days"}]}
/>`,
    render: () => h(A.SegmentedControl, {label: "Range", value: "7d", onChange: () => {},
      items: [{value: "24h", label: "24h"}, {value: "7d", label: "7 days"}, {value: "30d", label: "30 days"}]}),
  },
];
