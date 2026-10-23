// O Form do nativo no site (bloco 1, o grupo 1 — 23/10/2026). No React Native ele é só a pilha dos campos: não há
// `<form>`, envio nem validação da plataforma — cada `Field` leva o próprio erro, e o botão chama a função do app.
import {createElement as h, useState} from "react";
import {Button, Field, Form, Input, Text} from "../../../../packages/native/dist/index.js";

const largura = {width: "min(24rem, 100%)"};

// O cadastro: o erro é decidido aqui, pela tela, e o Field só o mostra.
function Cadastro() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState(null);
  const [enviado, setEnviado] = useState(false);
  const enviar = () => {
    const ok = email.includes("@");
    setErro(ok ? null : "Enter an email address, like name@example.com.");
    setEnviado(ok);
  };
  return h("div", {style: largura}, h(Form, null,
    h(Field, {label: "Name"}, h(Input, {placeholder: "Ana Souza", autoCapitalize: "words"})),
    h(Field, {label: "Email", error: erro},
      h(Input, {value: email, onChangeText: setEmail, keyboardType: "email-address", autoCapitalize: "none", placeholder: "name@example.com"})),
    h(Button, {tone: "brand", onPress: enviar}, "Create account"),
    enviado && h(Text, {tone: "muted"}, "Account created.")));
}

export default {
  install: 'import {Form} from "@aurea-uds/native";',
  description: "The stack of fields, with the form's breathing room. On React Native there is no form element, no submit and no platform validation: each Field shows its own error, and the button calls your handler.",
  api: {
    children: "Fields and the button, stacked with 20 between them. Aurea validates nothing: the screen decides what an error is and hands it to the Field.",
  },
  examples: [
    {
      title: "Usage",
      code: `<Form>
  <Field label="Name">
    <Input placeholder="Ana Souza" autoCapitalize="words" />
  </Field>
  <Field label="Email" error={error}>
    <Input value={email} onChangeText={setEmail} keyboardType="email-address"
      autoCapitalize="none" placeholder="name@example.com" />
  </Field>
  <Button tone="brand" onPress={submit}>Create account</Button>
</Form>`,
      render: () => h(Cadastro),
    },
    {
      title: "With an error",
      description: "The error comes from the screen, already decided. The Field paints it, and the screen reader hears the field as invalid with the error as its hint.",
      code: `<Form>
  <Field label="Password" error="Use at least 8 characters.">
    <Input defaultValue="1234" secureTextEntry />
  </Field>
  <Button tone="brand">Save</Button>
</Form>`,
      render: () => h("div", {style: largura}, h(Form, null,
        h(Field, {label: "Password", error: "Use at least 8 characters."}, h(Input, {defaultValue: "1234", secureTextEntry: true})),
        h(Button, {tone: "brand"}, "Save"))),
    },
  ],
};
