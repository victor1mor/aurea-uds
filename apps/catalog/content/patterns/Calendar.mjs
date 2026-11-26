import {createElement as h} from "react";
import {Button, Popover, Field} from "../../../../packages/react/dist/index.js";
import {Calendar, DatePicker} from "../../../../packages/react/dist/calendar.js";

// SELETOR DE DATA. Desde a 0.32.0 (ADR-0068) existe o `DatePicker` da web, o campo que abre este calendário; o
// primeiro padrão mostra a composição por baixo dele, para quando o gatilho não é um campo. E desde o lote 109
// (26/11/2026) o site não manda mais preferir o calendário do navegador: a data de um campo é o `DatePicker`.
//
// O mês é FIXO em todo preview, e `today` junto — os DOIS. Página estática que muda sozinha faz
// o gate de pixel reprovar todo dia 1º. Congelar só o mês não bastou: `data-today` continuava
// caindo numa célula diferente a cada dia, e quem reprovou foi o `dist == build` da CI, onde já
// era 2 de agosto enquanto aqui ainda era 1. Preview gerado não lê o relógio.
const MES = new Date(2026, 7, 1);
const row = {display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "var(--space-3)"};

export default [
  {
    variant: "Picker",
    name: "Date picker",
    description: "In a form, DatePicker is this already. Underneath it is a trigger plus a popover plus "
      + "this calendar: compose them yourself when the trigger is not a field, like this button.",
    uses: ["Button", "Popover", "Calendar"],
    code: `<Popover trigger={<Button leadingIcon="calendar">12 August 2026</Button>}>
  <Calendar mode="single" selected={date} onSelect={setDate} />
</Popover>`,
    render: () => h("div", {style: row},
      h(Popover, {trigger: h(Button, {leadingIcon: "calendar"}, "12 August 2026")},
        h(Calendar, {mode: "single", defaultMonth: MES, today: MES, selected: new Date(2026, 7, 12)}))),
  },
  {
    variant: "Picker",
    name: "Booking with days closed",
    description: "The reason this component exists: a native date input cannot say \"not before "
      + "Thursday, and never a Sunday\". The calendar can, and DatePicker takes the same rules.",
    uses: ["Calendar"],
    code: `<Calendar
  mode="range"
  label="Stay"
  disabled={[{before: new Date(2026, 7, 6)}, {dayOfWeek: [0]}]}
/>`,
    render: () => h(Calendar, {mode: "range", label: "Stay", defaultMonth: MES, today: MES,
      selected: {from: new Date(2026, 7, 12), to: new Date(2026, 7, 18)},
      disabled: [{before: new Date(2026, 7, 6)}, {dayOfWeek: [0]}]}),
  },
  {
    variant: "Field",
    name: "One date in a field",
    description: "One plain date in a form: DatePicker is the field that opens this calendar, in "
      + "every theme and brand. Pass locale for the language; name sends the date as yyyy-mm-dd.",
    uses: ["Field", "DatePicker"],
    code: '<Field label="Invoice date"><DatePicker defaultValue={new Date(2026, 7, 12)} name="invoice" /></Field>',
    embed: true,
    render: () => h("div", {style: {width: "min(260px,100%)"}},
      h(Field, {label: "Invoice date"}, h(DatePicker, {defaultValue: new Date(2026, 7, 12), name: "invoice"}))),
  },
];
