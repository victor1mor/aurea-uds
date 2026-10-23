// O Textarea do nativo no site (bloco 1, o grupo 1 — 23/10/2026). Todo valor das props do tipo em exemplo.
// É o mesmo campo do Input com várias linhas, canto maior e altura mínima. O nome vem do `Field` em volta.
import {createElement as h} from "react";
import {Field, Textarea} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const largura = {display: "grid", gap: "var(--space-4)", width: "min(28rem, 100%)"};

export default {
  install: 'import {Textarea} from "@aurea-uds/native";',
  api: {
    rows: "Visible lines. React Native has no rows: it becomes a minimum height, the field height times rows. Without it the minimum is 128.",
    ref: "The TextInput node inside, to focus by code. It arrives as a prop (React 19).",
    value: "The text, controlled. With onChangeText.",
    defaultValue: "The starting text when you do not control it.",
    onChangeText: "Called with the new text on every change.",
    disabled: "The field cannot be edited, and the screen reader hears it as disabled. Inside a Field, the Field's disabled counts too.",
    size: "The step of the text and the padding (sm, md, lg). The height still grows with the content.",
    keyboardType: "The keyboard that opens, as on Input.",
    secureTextEntry: "Hides what is typed. Rarely useful on many lines.",
    autoCapitalize: "Which letters the keyboard capitalises: none, sentences (the default), words or characters.",
    formatOnBlur: "Normalises the text when focus leaves, as on Input. It needs the field controlled.",
    onBlur: "Called when focus leaves.",
    onFocus: "Called when focus arrives.",
    multiline: "Always on here — it is what makes it a Textarea.",
    style: "Added after the Aurea skin.",
    testID: "The id for tests.",
  },
  examples: [
    {
      title: "Usage",
      code: `<Field label="Notes">
  <Textarea placeholder="What happened on the trip?" />
</Field>`,
      render: () => h("div", {style: largura}, h(Field, {label: "Notes"}, h(Textarea, {placeholder: "What happened on the trip?"}))),
    },
    cada({titulo: "Sizes", descricao: "The step of the text and the padding; the height grows with what is typed.",
      valores: ["sm", "md", "lg"], estilo: largura,
      codigo: v => `<Field label="Notes (${v})">\n  <Textarea size="${v}" placeholder="Write a note" />\n</Field>`,
      peca: v => h(Field, {label: `Notes (${v})`}, h(Textarea, {size: v, placeholder: "Write a note"}))}),
    {
      title: "Rows",
      description: "rows becomes a minimum height: two rows of a field, here.",
      code: `<Field label="Short note">
  <Textarea rows={2} placeholder="One or two lines" />
</Field>`,
      render: () => h("div", {style: largura}, h(Field, {label: "Short note"}, h(Textarea, {rows: 2, placeholder: "One or two lines"}))),
    },
    cada({titulo: "Auto-capitalize", descricao: "Which letters the phone keyboard capitalises. In the browser it becomes the autocapitalize attribute, which only on-screen keyboards read.",
      valores: ["none", "sentences", "words", "characters"], estilo: largura,
      codigo: v => `<Field label="autoCapitalize ${v}">\n  <Textarea rows={2} autoCapitalize="${v}" />\n</Field>`,
      peca: v => h(Field, {label: `autoCapitalize ${v}`}, h(Textarea, {rows: 2, autoCapitalize: v}))}),
    {
      title: "States",
      description: "The Field's error takes the place of its hint, and the screen reader hears the field as invalid; disabled cannot be edited.",
      code: `<Field label="Reason" hint="At least one sentence." error="Tell us why you are cancelling.">
  <Textarea rows={2} />
</Field>
<Field label="Reason (disabled)">
  <Textarea rows={2} defaultValue="Moved to another plan." disabled />
</Field>`,
      render: () => h("div", {style: largura},
        h(Field, {label: "Reason", hint: "At least one sentence.", error: "Tell us why you are cancelling."}, h(Textarea, {rows: 2})),
        h(Field, {label: "Reason (disabled)"}, h(Textarea, {rows: 2, defaultValue: "Moved to another plan.", disabled: true}))),
    },
  ],
};
