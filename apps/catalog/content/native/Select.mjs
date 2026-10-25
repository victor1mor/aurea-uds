// O Select do nativo no site (bloco 1, o grupo 1 — 23/10/2026). Todo valor das props do tipo em exemplo.
// Não existe `<select>` no React Native: o gatilho parece um campo, e a lista é uma folha que sobe de baixo. Cada
// exemplo guarda a própria escolha.
import {createElement as h, useState} from "react";
import {Field, Select} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const largura = {display: "grid", gap: "var(--space-4)", width: "min(24rem, 100%)"};
const UNIDADES = [
  {value: "km", label: "Kilometres"},
  {value: "mi", label: "Miles"},
  {value: "nmi", label: "Nautical miles", disabled: true},
];
const ITENS_DO_CODIGO = `[
  {value: "km", label: "Kilometres"},
  {value: "mi", label: "Miles"},
  {value: "nmi", label: "Nautical miles", disabled: true},
]`;

// O campo com a escolha guardada aqui: `props` vão para o Select, `rotulo` e `campo` para o Field.
function Campo({rotulo, inicio, props, campo}) {
  const [valor, setValor] = useState(inicio);
  return h(Field, {label: rotulo, ...campo},
    h(Select, {items: UNIDADES, value: valor, onChange: setValor, placeholder: "Pick a unit", ...props}));
}

export default {
  install: 'import {Select} from "@aurea-uds/native";',
  api: {
    items: "The list as data: {value, label, disabled?}. All of them are drawn at once, so it is for short lists — units, states, types. For thousands of rows, or to type and filter, use Combobox.",
    value: "The chosen value, as a string. Controlled.",
    onChange: "Called with the chosen value itself (not an event), and the sheet closes.",
    disabled: "The trigger does not open, and the screen reader hears it as disabled. Inside a Field, the Field's disabled counts too.",
    size: "The field height on the touch scale: 40, 48 and 56.",
    chevron: "The arrow glyph, caret-down by default; false removes it. It has to be in the app's icon registry.",
    style: "Added to the trigger, after the Aurea skin.",
    testID: "The id for tests.",
  },
  examples: [
    {
      title: "Usage",
      code: `const [unit, setUnit] = useState("km");
<Field label="Distance unit">
  <Select items={units} value={unit} onChange={setUnit} />
</Field>`,
      render: () => h("div", {style: largura}, h(Campo, {rotulo: "Distance unit", inicio: "km"})),
    },
    cada({titulo: "Sizes", descricao: "The touch scale: 40, 48 and 56, the same as the other fields.",
      valores: ["sm", "md", "lg"], estilo: largura,
      codigo: v => `<Field label="Unit (${v})">\n  <Select size="${v}" items={units} value={unit} onChange={setUnit} />\n</Field>`,
      peca: v => h(Campo, {rotulo: `Unit (${v})`, inicio: "km", props: {size: v}})}),
    {
      title: "Placeholder and a disabled option",
      description: "With no value the trigger shows the placeholder. An option with disabled stays in the list and cannot be chosen.",
      code: `<Field label="Unit">
  <Select items={${ITENS_DO_CODIGO.replace(/\n/g, "\n  ")}} value={unit} onChange={setUnit} placeholder="Pick a unit" />
</Field>`,
      render: () => h("div", {style: largura}, h(Campo, {rotulo: "Unit"})),
    },
    {
      title: "States",
      description: "The error is the Field's: the trigger turns invalid, and the screen reader hears the error as its hint. disabled does not open.",
      code: `<Field label="Unit" error="Pick a unit to continue.">
  <Select items={units} value={unit} onChange={setUnit} placeholder="Pick a unit" />
</Field>
<Field label="Unit (disabled)">
  <Select items={units} value="km" disabled />
</Field>`,
      render: () => h("div", {style: largura},
        h(Campo, {rotulo: "Unit", campo: {error: "Pick a unit to continue."}}),
        h(Campo, {rotulo: "Unit (disabled)", inicio: "km", props: {disabled: true}})),
    },
  ],
};
