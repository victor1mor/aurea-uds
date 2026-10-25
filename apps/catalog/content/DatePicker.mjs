// 0.32.0, ADR-0068 — o `DatePicker` da web. As prévias são VIVAS (`embed`): o gatilho abre o calendário de
// verdade dentro da moldura, e é isso que a varredura mede (o clique, o foco no dia, o Esc).
import {createElement as h} from "react";
import {Field} from "../../../packages/react/dist/index.js";
import {DatePicker} from "../../../packages/react/dist/calendar.js";
import {ptBR} from "react-day-picker/locale";

const coluna = {display: "grid", gap: "var(--space-4)", width: "min(100%, 20rem)"};
// Os três tamanhos, cada campo com o rótulo próprio: o código e o desenho saem desta lista.
const TAMANHOS = [["sm", "Small"], ["md", "Medium"], ["lg", "Large"]];

export default {
  description:
    "DatePicker is a field that opens the calendar. One date closes it on the pick; with range, the " +
    "first pick is one end and the second the other, every time it opens.",

  install: 'import {DatePicker} from "@aurea-uds/react/calendar";',

  features: [
    "The same name and props as the native DatePicker: value, onChange, minimumDate, maximumDate, disabled, size, format, placeholder, icon.",
    "range picks a range in the same component; every opening starts a new range.",
    "Inside a Field, the label names the trigger and the calendar window; the calendar opens with focus on the chosen day.",
    "locale sets the language of the trigger and the calendar together, with the same object Calendar takes. Without it, English.",
    "name sends the LOCAL date as yyyy-mm-dd; a range goes as yyyy-mm-dd/yyyy-mm-dd.",
  ],

  examples: [
    {
      title: "One date",
      description: "The days before the minimum are disabled.",
      code: `<Field label="Check-in">
  <DatePicker defaultValue={new Date(2026, 7, 12)} minimumDate={new Date(2026, 7, 6)} name="checkin" />
</Field>`,
      embed: true,
      render: () => h("div", {style: coluna},
        h(Field, {label: "Check-in"},
          h(DatePicker, {defaultValue: new Date(2026, 7, 12), minimumDate: new Date(2026, 7, 6), name: "checkin"}))),
    },
    {
      title: "A range",
      description: "The first pick is one end and the second the other, in any order.",
      code: `<Field label="Stay">
  <DatePicker range defaultValue={{from: new Date(2026, 7, 12), to: new Date(2026, 7, 18)}} name="stay" />
</Field>`,
      embed: true,
      render: () => h("div", {style: coluna},
        h(Field, {label: "Stay"},
          h(DatePicker, {range: true, defaultValue: {from: new Date(2026, 7, 12), to: new Date(2026, 7, 18)}, name: "stay"}))),
    },
    {
      title: "Another language",
      description: "The trigger and the calendar change language together.",
      code: `import {ptBR} from "react-day-picker/locale";

<Field label="Check-in">
  <DatePicker locale={ptBR} defaultValue={new Date(2026, 7, 12)} />
</Field>`,
      embed: true,
      render: () => h("div", {style: coluna},
        h(Field, {label: "Check-in"},
          h(DatePicker, {locale: ptBR, defaultValue: new Date(2026, 7, 12)}))),
    },
    {
      title: "Sizes",
      description: "The field height, on the same scale as Select and Input. md is the default.",
      code: TAMANHOS.map(([size, label]) => `<Field label="${label}">\n  <DatePicker`
        + `${size === "md" ? "" : ` size="${size}"`} defaultValue={new Date(2026, 7, 12)} />\n</Field>`).join("\n"),
      embed: true,
      render: () => h("div", {style: coluna}, ...TAMANHOS.map(([size, label]) =>
        h(Field, {key: size, label},
          h(DatePicker, {...(size === "md" ? {} : {size}), defaultValue: new Date(2026, 7, 12)})))),
    },
  ],
};
