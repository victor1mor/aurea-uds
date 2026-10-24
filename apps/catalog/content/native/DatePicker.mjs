// O DatePicker do nativo no site (bloco 1, o grupo 1 — 23/10/2026). Todo valor das props do tipo em exemplo.
// No aparelho o toque abre o diálogo do sistema; no navegador (`react-native-web`), o calendário do próprio navegador,
// por um campo invisível por cima do gatilho da Aurea (E16). Cada exemplo guarda a própria data.
import {createElement as h, useState} from "react";
import {Field} from "../../../../packages/native/dist/index.js";
import {DatePicker} from "../../../../packages/native/dist/sistema.js";
import {cada} from "../_eixos.mjs";

const largura = {display: "grid", gap: "var(--space-4)", width: "min(24rem, 100%)"};
const curta = (d) => d.toLocaleDateString("en-GB", {day: "numeric", month: "short", year: "numeric"});

// O campo com a data guardada aqui: `props` vão para o DatePicker, `rotulo` para o Field.
function Campo({rotulo, inicio, props}) {
  const [data, setData] = useState(inicio);
  return h(Field, {label: rotulo}, h(DatePicker, {value: data, onChange: setData, ...props}));
}

export default {
  install: 'import {DatePicker} from "@aurea-uds/native/system";',
  description: "A field that opens the platform's own date or time picker: Aurea draws the trigger, the calendar is the system's — and in the browser, the browser's. One date, no range. It lives in @aurea-uds/native/system, with @react-native-community/datetimepicker as an optional peer.",
  api: {
    value: "The chosen date (controlled). There is no range on native: one Date.",
    onChange: "Called with the picked Date. The system dialog closes on its own; cancelling it calls nothing.",
    mode: "date (the default) or time: which system dialog opens. In time mode the trigger writes the hour and minutes, and the empty one asks for a time.",
    minimumDate: "The system dialog does not offer days before it (in the browser, the date field's min).",
    maximumDate: "The system dialog does not offer days after it (in the browser, the date field's max).",
    format: "How the Date is written on the trigger. Without it, the device's format: the date, or the hour and minutes in time mode.",
    placeholder: "The text of the empty trigger. Without it, the strings phrase: \"Pick a date\", or \"Pick a time\" in time mode.",
    icon: "The icon at the end of the trigger, calendar by default; false removes it. It has to be in the app's icon registry.",
    size: "The field height, the same steps as Select and Input: 40, 48 and 56.",
    disabled: "The trigger does not open.",
    style: "Added to the trigger, after the Aurea skin.",
    testID: "The id for tests; in the browser, the date field inside gets the same id with -campo.",
  },
  examples: [
    {
      title: "Usage",
      code: `const [due, setDue] = useState(new Date(2026, 9, 23));
<Field label="Due date">
  <DatePicker value={due} onChange={setDue} />
</Field>`,
      render: () => h("div", {style: largura}, h(Campo, {rotulo: "Due date", inicio: new Date(2026, 9, 23)})),
    },
    cada({titulo: "Modes", descricao: "Which system dialog opens: the calendar or the clock. In time mode the trigger writes the time in the device's format.",
      valores: ["date", "time"], estilo: largura,
      codigo: v => `<Field label="Start ${v}">\n  <DatePicker mode="${v}" value={start} onChange={setStart} />\n</Field>`,
      peca: v => h(Campo, {rotulo: v === "time" ? "Start time" : "Start date", inicio: new Date(2026, 9, 23, 9, 30),
        props: {mode: v}})}),
    cada({titulo: "Sizes", descricao: "The touch scale: 40, 48 and 56, the same as the other fields.",
      valores: ["sm", "md", "lg"], estilo: largura,
      codigo: v => `<Field label="Date (${v})">\n  <DatePicker size="${v}" value={date} onChange={setDate} />\n</Field>`,
      peca: v => h(Campo, {rotulo: `Date (${v})`, inicio: new Date(2026, 9, 23), props: {size: v}})}),
    {
      title: "Limits and format",
      description: "minimumDate and maximumDate bound the dialog; format writes the trigger. Without a value, the placeholder shows.",
      code: `<Field label="Delivery">
  <DatePicker
    value={delivery} onChange={setDelivery}
    minimumDate={new Date(2026, 9, 24)} maximumDate={new Date(2026, 10, 30)}
    format={(d) => d.toLocaleDateString("en-GB", {day: "numeric", month: "short", year: "numeric"})}
    placeholder="Choose a delivery day"
  />
</Field>`,
      render: () => h("div", {style: largura}, h(Campo, {rotulo: "Delivery", inicio: undefined,
        props: {minimumDate: new Date(2026, 9, 24), maximumDate: new Date(2026, 10, 30), format: curta, placeholder: "Choose a delivery day"}})),
    },
    {
      title: "Disabled",
      description: "The trigger does not open, and the screen reader hears it as disabled.",
      code: `<Field label="Date (disabled)">
  <DatePicker value={date} disabled />
</Field>`,
      render: () => h("div", {style: largura}, h(Campo, {rotulo: "Date (disabled)", inicio: new Date(2026, 9, 23), props: {disabled: true}})),
    },
  ],
};
