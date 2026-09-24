import {createElement as h} from "react";
import {Button, Popover, Field, Input} from "../../../../packages/react/dist/index.js";
import {Calendar} from "../../../../packages/react/dist/calendar.js";

// SELETOR DE DATA. Não existe componente `DatePicker` na Aurea, e é decisão, não falta: é a
// composição de duas peças que já existem, e o shadcn/ui — a referência para "como envelopar
// biblioteca de terceiro" — também não tem componente-raiz para isso, pelo mesmo motivo.
// Aqui é onde a composição fica escrita.
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
    description: "There is no DatePicker component: a picker is a trigger plus a popover plus "
      + "this calendar. Three parts you already have, and the trigger is what names the field.",
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
    description: "The reason this component exists. A native date input cannot say \"not before "
      + "Thursday, and never a Sunday\" — everything else about a plain date, it does better.",
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
    variant: "Native",
    name: "When the native input wins",
    description: "One plain date, no closed days: the native picker is smaller, knows every "
      + "locale, and is the one the person already knows how to use on their phone.",
    uses: ["Field", "Input"],
    code: '<Field label="Invoice date"><Input type="date" /></Field>',
    render: () => h("div", {style: {width: "min(260px,100%)"}},
      h(Field, {label: "Invoice date"}, h(Input, {type: "date", defaultValue: "2026-08-12"}))),
  },
];
