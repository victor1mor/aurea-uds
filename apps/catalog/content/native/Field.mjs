// O Field do nativo no site (bloco 1, o 5-A — 23/10/2026): rótulo, controle, dica e erro, rodando pelo
// `react-native-web`. Todo valor das props do tipo em exemplo (`api-surface-native.json`).
import {createElement as h} from "react";
import {Field, Input, OTPField} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const largura = {width: "min(24rem, 100%)"};
const coluna = {display: "grid", gap: "var(--space-4)", width: "min(24rem, 100%)"};

export default {
  install: 'import {Field} from "@aurea-uds/native";',
  api: {
    label: "The label above the control, and the control's name: React Native has no htmlFor, so the Field passes it to the control inside by context.",
    hint: "Help text under the control. As text it is the hint the screen reader reads, outside the name.",
    error: "Shown under the control when the value is rejected. Present means invalid: the control knows it by context, and the error becomes the hint the screen reader reads.",
    disabled: "Disables the control inside.",
    size: "The size step the control inside takes, when it does not set its own.",
    children: "The control. Input, Textarea, Select, OTPField, FileInput and the rest read the label, the hint, the error and the size from the Field.",
  },
  examples: [
    {
      title: "Usage",
      code: `<Field label="Email" hint="We use it to sign you in.">
  <Input placeholder="name@example.com" keyboardType="email-address" />
</Field>`,
      render: () => h("div", {style: largura}, h(Field, {label: "Email", hint: "We use it to sign you in."},
        h(Input, {placeholder: "name@example.com", keyboardType: "email-address"}))),
    },
    cada({titulo: "Sizes", descricao: "The size step goes down to the control inside.",
      valores: ["sm", "md", "lg"], estilo: coluna,
      codigo: v => `<Field size="${v}" label="Name, ${v}"><Input placeholder="Ada Lovelace" /></Field>`,
      peca: v => h(Field, {size: v, label: `Name, ${v}`}, h(Input, {placeholder: "Ada Lovelace"}))}),
    {
      title: "Error",
      description: "The error replaces the hint, marks the control as invalid and is what the screen reader hears.",
      code: `<Field label="Email" hint="We use it to sign you in." error="Enter an email like name@example.com.">
  <Input defaultValue="ada@" keyboardType="email-address" />
</Field>`,
      render: () => h("div", {style: largura}, h(Field, {label: "Email", hint: "We use it to sign you in.",
        error: "Enter an email like name@example.com."}, h(Input, {defaultValue: "ada@", keyboardType: "email-address"}))),
    },
    {
      title: "Disabled",
      code: `<Field label="Account number" disabled>
  <Input defaultValue="0042-7" />
</Field>`,
      render: () => h("div", {style: largura}, h(Field, {label: "Account number", disabled: true}, h(Input, {defaultValue: "0042-7"}))),
    },
    {
      title: "Other controls",
      description: "Any Aurea control inside reads the Field: here the code field takes its name from the label.",
      code: `<Field label="Code sent by SMS" hint="Six digits.">
  <OTPField length={6} />
</Field>`,
      render: () => h("div", {style: largura}, h(Field, {label: "Code sent by SMS", hint: "Six digits."}, h(OTPField, {length: 6}))),
    },
  ],
};
