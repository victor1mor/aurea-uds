// O Input do nativo no site (bloco 1, o grupo 1 — 23/10/2026). Todo valor das props do tipo em exemplo.
// No React Native o nome do campo vem do `Field` em volta (não há `<label for>`): todo exemplo tem um.
import {createElement as h, useState} from "react";
import {Field, Input} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const largura = {display: "grid", gap: "var(--space-4)", width: "min(24rem, 100%)"};

// A placa: o texto é normalizado quando o foco sai, e quem guarda o valor é a tela.
function Placa() {
  const [placa, setPlaca] = useState("abc1d23");
  return h(Field, {label: "Licence plate", hint: "Leave the field to see it formatted."},
    h(Input, {value: placa, onChangeText: setPlaca, formatOnBlur: (v) => v.toUpperCase(), autoCapitalize: "characters"}));
}

export default {
  install: 'import {Input} from "@aurea-uds/native";',
  api: {
    ref: "The TextInput node inside, to focus by code (ref.current?.focus()) — how the keyboard's next key jumps to the next field. It arrives as a prop (React 19).",
    value: "The text, controlled. With onChangeText.",
    defaultValue: "The starting text when you do not control it.",
    onChangeText: "Called with the new text on every change.",
    disabled: "The field cannot be edited, and the screen reader hears it as disabled. Inside a Field, the Field's disabled counts too.",
    size: "The field height on the touch scale: 40, 48 and 56. Inside a Field, the Field's size counts too.",
    keyboardType: "The keyboard that opens: \"numeric\" for a measure, \"email-address\", \"phone-pad\"… The keyboard is not a format: money and measures are the NumberField.",
    secureTextEntry: "Hides what is typed — the password field. PasswordField adds the eye that shows it.",
    autoCapitalize: "Which letters the keyboard capitalises: none, sentences (the default), words or characters.",
    formatOnBlur: "Normalises the text when focus leaves — a plate, a document, a phone. Aurea gives the moment, not the format. It needs the field controlled: the formatted text arrives through onChangeText.",
    onBlur: "Called when focus leaves.",
    onFocus: "Called when focus arrives.",
    multiline: "Several lines. It is what Textarea turns on; rarely set by hand.",
    style: "Added after the Aurea skin: height, padding and font come from the size and the theme.",
    testID: "The id for tests.",
  },
  examples: [
    {
      title: "Usage",
      code: `<Field label="Email">
  <Input placeholder="name@example.com" keyboardType="email-address" autoCapitalize="none" />
</Field>`,
      render: () => h("div", {style: largura}, h(Field, {label: "Email"},
        h(Input, {placeholder: "name@example.com", keyboardType: "email-address", autoCapitalize: "none"}))),
    },
    cada({titulo: "Sizes", descricao: "The touch scale: 40, 48 and 56.",
      valores: ["sm", "md", "lg"], estilo: largura,
      codigo: v => `<Field label="Name (${v})">\n  <Input size="${v}" placeholder="Ana Souza" />\n</Field>`,
      peca: v => h(Field, {label: `Name (${v})`}, h(Input, {size: v, placeholder: "Ana Souza"}))}),
    cada({titulo: "Auto-capitalize", descricao: "Which letters the phone keyboard capitalises. In the browser it becomes the autocapitalize attribute, which only on-screen keyboards read.",
      valores: ["none", "sentences", "words", "characters"], estilo: largura,
      codigo: v => `<Field label="autoCapitalize ${v}">\n  <Input autoCapitalize="${v}" />\n</Field>`,
      peca: v => h(Field, {label: `autoCapitalize ${v}`}, h(Input, {autoCapitalize: v}))}),
    {
      title: "Format on blur",
      description: "The text is normalised when focus leaves, never while typing. The field is controlled: the formatted text comes back through onChangeText.",
      code: `const [plate, setPlate] = useState("abc1d23");
<Field label="Licence plate" hint="Leave the field to see it formatted.">
  <Input value={plate} onChangeText={setPlate} formatOnBlur={(v) => v.toUpperCase()} autoCapitalize="characters" />
</Field>`,
      render: () => h("div", {style: largura}, h(Placa)),
    },
    {
      title: "Keyboards and secrets",
      description: "keyboardType picks the keyboard (in the browser, the input type or inputmode); secureTextEntry hides the text.",
      code: `<Field label="Mileage">
  <Input keyboardType="numeric" placeholder="12400" />
</Field>
<Field label="Password">
  <Input secureTextEntry />
</Field>`,
      render: () => h("div", {style: largura},
        h(Field, {label: "Mileage"}, h(Input, {keyboardType: "numeric", placeholder: "12400"})),
        h(Field, {label: "Password"}, h(Input, {secureTextEntry: true}))),
    },
    {
      title: "States",
      description: "The error is the Field's: the field turns invalid for the screen reader, and the error becomes its hint. disabled cannot be edited.",
      code: `<Field label="Email" error="Enter an email address.">
  <Input defaultValue="ana@" />
</Field>
<Field label="Account">
  <Input defaultValue="ana.souza" disabled />
</Field>`,
      render: () => h("div", {style: largura},
        h(Field, {label: "Email", error: "Enter an email address."}, h(Input, {defaultValue: "ana@"})),
        h(Field, {label: "Account"}, h(Input, {defaultValue: "ana.souza", disabled: true}))),
    },
  ],
};
