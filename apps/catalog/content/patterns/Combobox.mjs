// PADRÃO do arquivo de PATTERN — ver o cabeçalho de `Button.mjs`.
//
// Parte da cobertura do `G-COMP-01`: 77 dos 90 componentes tinham ZERO composição resolvida,
// contra cobertura total no kibo e na reui. O alvo é nenhum componente em zero.
import {createElement as h} from "react";
import {Combobox, Field} from "../../../../packages/react/dist/index.js";

const LISTA = "This page is static HTML: the listbox opens in a portal and only exists in a real "
  + "React app. The preview shows the closed field; the code is the whole composition.";

export default [
  {
    variant: "Single",
    name: "Picking one out of many",
    description: "A select stops working somewhere around twenty options — the eye cannot scan them. A combobox lets the user type what they already know instead of hunting for it.",
    uses: ["Combobox"],
    note: LISTA,
    code: `const [zone, setZone] = useState(null);

<Combobox
  label="Time zone"
  placeholder="Start typing a city…"
  value={zone}
  onValueChange={setZone}
  items={[
    {value: "sao_paulo", label: "America/Sao_Paulo"},
    {value: "lisbon", label: "Europe/Lisbon"},
    {value: "tokyo", label: "Asia/Tokyo"},
  ]}
/>`,
    render: () => h("div", {style: {width: "min(360px,100%)"}},
      h(Combobox, {label: "Time zone", placeholder: "Start typing a city…", items: []})),
  },
  {
    variant: "Grouped",
    name: "Options that belong to sections",
    description: "A flat list of forty time zones is a wall; the same forty under continents is a map. Pass groups — `{label, items}` — in the same `items` prop, and the engine's filter runs inside each section, dropping a section that has nothing left to show. `empty` writes what appears when nothing matches, which is where a list stops saying No results and starts saying what the user can do about it.",
    uses: ["Combobox"],
    note: LISTA,
    code: `<Combobox
  label="Time zone"
  placeholder="Start typing a city…"
  empty="No zone by that name — try the city, not the country."
  value={zone}
  onValueChange={setZone}
  items={[
    {label: "Americas", items: [
      {value: "sao_paulo", label: "America/Sao_Paulo"},
      {value: "new_york", label: "America/New_York"},
    ]},
    {label: "Europe", items: [
      {value: "lisbon", label: "Europe/Lisbon"},
      {value: "berlin", label: "Europe/Berlin"},
    ]},
  ]}
/>`,
    render: () => h("div", {style: {width: "min(360px,100%)"}},
      h(Combobox, {label: "Time zone", placeholder: "Start typing a city…", items: []})),
  },
];
