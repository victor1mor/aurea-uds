// O PasswordField do nativo no site (bloco 1, o 5-A — 23/10/2026). Todo valor das props do tipo em exemplo. O campo leva o
// nome do `Field` em volta (no React Native não há `<label for>`: o nome chega por contexto).
import {createElement as h, useState} from "react";
import {Field, Icon, PasswordField, criarRegistroDeIcones} from "../../../../packages/native/dist/index.js";
import Olho from "../../../../packages/native/icons/eye.js";
import OlhoRiscado from "../../../../packages/native/icons/eye-slash.js";
import {cada} from "../_eixos.mjs";

const coluna = {display: "grid", gap: "var(--space-4)", width: "min(24rem, 100%)"};
// Os dois glifos do botão de mostrar, num registro só deste campo — o caminho do exemplo "Visible at first".
const OLHOS = criarRegistroDeIcones({eye: Olho, "eye-slash": OlhoRiscado});

function Senha({label = "Password", ...props}) {
  const [senha, setSenha] = useState("");
  return h(Field, {label}, h(PasswordField, {value: senha, onChangeText: setSenha, ...props}));
}

export default {
  install: 'import {PasswordField} from "@aurea-uds/native";',
  api: {
    ref: "The TextInput inside — to focus it from code (ref.current?.focus()), which is how the keyboard's \"next\" jumps from field to field.",
    value: "The text, controlled.",
    defaultValue: "The starting text, uncontrolled.",
    onChangeText: "Called with the text on every keystroke.",
    placeholder: "Example text shown while the field is empty.",
    disabled: "Disables the field and its eye. A Field around can disable it too.",
    autoCapitalize: "What the keyboard capitalises: none (the default here), sentences, words or characters. none because a capital first letter is the costliest typo in a field nobody can see.",
    formatOnBlur: "Normalises the text when the focus leaves — rarely right for a password.",
    onBlur: "Called when the field loses the focus.",
    onFocus: "Called when the field gets the focus.",
    style: "Added to the text input's style.",
    testID: "Test id of the group; the field gets -campo and the eye -olho.",
    leading: "A drawing in front of the field — the lock, almost always.",
    icons: "A registry for the eye's two glyphs, eye and eye-slash, when the provider's lacks them. Without them the show/hide button is invisible.",
  },
  examples: [
    {
      title: "Usage",
      description: "The eye shows and hides the password, and its name says what it will do — \"Show password\", \"Hide password\".",
      code: `const [password, setPassword] = useState("");

<Field label="Password">
  <PasswordField value={password} onChangeText={setPassword} />
</Field>`,
      render: () => h("div", {style: {width: "min(24rem, 100%)"}}, h(Senha)),
    },
    cada({titulo: "Sizes", descricao: "The field's step; it also picks the size of the eye.",
      valores: ["sm", "md", "lg"], estilo: coluna,
      codigo: v => `<Field label="Password (${v})">\n  <PasswordField size="${v}" value={password} onChangeText={setPassword} />\n</Field>`,
      peca: v => h(Senha, {label: `Password (${v})`, size: v})}),
    cada({titulo: "Capitalisation", descricao: "What a phone's keyboard capitalises. A computer's keyboard ignores it, so in this browser the four look the same.",
      valores: ["none", "sentences", "words", "characters"], estilo: coluna,
      codigo: v => `<Field label="Code (${v})">\n  <PasswordField autoCapitalize="${v}" value={code} onChangeText={setCode} />\n</Field>`,
      peca: v => h(Senha, {label: `Code (${v})`, autoCapitalize: v})}),
    {
      title: "A glyph in front",
      description: "leading puts a drawing before the field, inside the same box.",
      code: `<Field label="Password">
  <PasswordField leading={<Icon name="lock" size="sm" />} value={password} onChangeText={setPassword} />
</Field>`,
      render: () => h("div", {style: {width: "min(24rem, 100%)"}}, h(Senha, {leading: h(Icon, {name: "lock", size: "sm"})})),
    },
    {
      title: "Visible at first",
      description: "defaultVisible starts with the password showing; from there the field keeps the state. The eye needs eye and eye-slash: here they come through icons, for the provider's registry that lacks them.",
      code: `import Eye from "@aurea-uds/native/icons/eye";
import EyeSlash from "@aurea-uds/native/icons/eye-slash";

const EYES = criarRegistroDeIcones({eye: Eye, "eye-slash": EyeSlash});

<Field label="Wi-Fi password">
  <PasswordField defaultVisible icons={EYES} defaultValue="orange-river-42" />
</Field>`,
      render: () => h("div", {style: {width: "min(24rem, 100%)"}},
        h(Field, {label: "Wi-Fi password"}, h(PasswordField, {defaultVisible: true, icons: OLHOS, defaultValue: "orange-river-42"}))),
    },
    {
      title: "Disabled",
      code: `<Field label="Password" disabled>
  <PasswordField defaultValue="secret" />
</Field>`,
      render: () => h("div", {style: {width: "min(24rem, 100%)"}},
        h(Field, {label: "Password", disabled: true}, h(PasswordField, {defaultValue: "secret"}))),
    },
  ],
};
