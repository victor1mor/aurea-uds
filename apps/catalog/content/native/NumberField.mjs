// O NumberField do nativo no site (bloco 1, o grupo 1 — 23/10/2026). Todo valor das props do tipo em exemplo.
// Cada exemplo guarda o próprio número: o − e o + andam um passo, e o texto digitado vira número quando o foco sai.
import {createElement as h, useState} from "react";
import {NumberField} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const coluna = {display: "grid", gap: "var(--space-4)", justifyItems: "start", width: "min(24rem, 100%)"};

// O campo com o número guardado aqui: `props` vão para o NumberField.
function Campo({inicio = 1, props}) {
  const [valor, setValor] = useState(inicio);
  return h(NumberField, {value: valor, onValueChange: setValor, ...props});
}

export default {
  install: 'import {NumberField} from "@aurea-uds/native";',
  api: {
    value: "The number, controlled. null is empty, which is not the same as zero. What comes out is always the raw number — 1234.5, never \"R$ 1.234,50\".",
    defaultValue: "The starting number when you do not control it.",
    min: "The lowest value. The − button turns off there, and a typed number is clamped to it.",
    max: "The highest value. The + button turns off there, and a typed number is clamped to it.",
    label: "The name for the screen reader when there is no Field around.",
    disabled: "Neither the field nor the buttons respond, and the screen reader hears it as disabled.",
    readOnly: "Shows the value and does not let it change — the buttons go away.",
    size: "sm, md and lg are the field heights (40, 48, 56); display is the big number, in the 30 of heading 2. Money in display needs fullWidth.",
    fullWidth: "Takes the free width instead of hugging the content. Off by default; turn it on for money.",
    placeholder: "What the empty field shows.",
    keyboardType: "The keyboard. Without it, decimal-pad — or the one with a minus sign when min is negative, because the iPhone's decimal-pad has no minus key.",
    icons: "The glyphs of the two buttons, {increment, decrement} (plus and minus by default), or false to remove both.",
    style: "Added after the Aurea skin.",
    testID: "The id for tests.",
  },
  examples: [
    {
      title: "Usage",
      code: `const [quantity, setQuantity] = useState(1);
<NumberField label="Quantity" value={quantity} onValueChange={setQuantity} min={0} />`,
      render: () => h("div", {style: coluna}, h(Campo, {props: {label: "Quantity", min: 0}})),
    },
    cada({titulo: "Sizes", descricao: "The three field heights, and display: the big number you nudge.",
      valores: ["sm", "md", "lg", "display"], estilo: coluna,
      codigo: v => `<NumberField size="${v}" label="Guests (${v})" value={guests} onValueChange={setGuests} min={0} />`,
      peca: v => h(Campo, {inicio: 4, props: {size: v, label: `Guests (${v})`, min: 0}})}),
    {
      title: "Money",
      description: "format takes the Intl.NumberFormat options and locale the language of the number. The field shows R$ 1.234,50 and hands back 1234.5.",
      code: `<NumberField label="Price" value={price} onValueChange={setPrice}
  format={{style: "currency", currency: "BRL"}} locale="pt-BR" step={0.5} min={0} fullWidth />`,
      render: () => h("div", {style: coluna}, h(Campo, {inicio: 1234.5,
        props: {label: "Price", format: {style: "currency", currency: "BRL"}, locale: "pt-BR", step: 0.5, min: 0, fullWidth: true}})),
    },
    cada({titulo: "Keyboards", descricao: "The keyboard a phone opens. In the browser numeric and number-pad ask for the numeric keypad and decimal-pad for the decimal one; numbers-and-punctuation has no browser equivalent and opens the text keyboard.",
      valores: ["numeric", "decimal-pad", "number-pad", "numbers-and-punctuation"], estilo: coluna,
      codigo: v => `<NumberField keyboardType="${v}" label="keyboardType ${v}" value={value} onValueChange={setValue} />`,
      peca: v => h(Campo, {props: {keyboardType: v, label: `keyboardType ${v}`}})}),
    {
      title: "Limits and step",
      description: "min and max bound the value and turn off the button that would cross them; step is how much each press moves.",
      code: `<NumberField label="Rating" value={rating} onValueChange={setRating} min={0} max={10} step={2} />`,
      render: () => h("div", {style: coluna}, h(Campo, {inicio: 10, props: {label: "Rating", min: 0, max: 10, step: 2}})),
    },
    {
      title: "States",
      description: "readOnly shows the value without the buttons; disabled turns everything off; icons={false} removes the buttons and leaves the typing.",
      code: `<NumberField label="Stock" value={12} readOnly />
<NumberField label="Seats" value={3} disabled />
<NumberField label="Year" value={year} onValueChange={setYear} icons={false} />`,
      render: () => h("div", {style: coluna},
        h(NumberField, {label: "Stock", value: 12, readOnly: true}),
        h(NumberField, {label: "Seats", value: 3, disabled: true}),
        h(Campo, {inicio: 2026, props: {label: "Year", icons: false}})),
    },
  ],
};
