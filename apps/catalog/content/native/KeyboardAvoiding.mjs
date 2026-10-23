// O KeyboardAvoiding do nativo no site (bloco 1, o 5-A — 23/10/2026): a casca que levanta o formulário quando o teclado
// sobe. No navegador não há teclado de tela que avise a altura — o `KeyboardAvoidingView` do `react-native-web` é um
// `View` simples (lido no fonte dele) —, então a página mostra a peça como ela fica com o teclado fechado, e diz isso.
import {createElement as h} from "react";
import {Button, Field, Input, KeyboardAvoiding, Stack} from "../../../../packages/native/dist/index.js";

const largura = {width: "min(24rem, 100%)"};

const formulario = () => h(Stack, null,
  h(Field, {label: "Amount"}, h(Input, {keyboardType: "numeric", placeholder: "0.00"})),
  h(Field, {label: "Note"}, h(Input, {placeholder: "What it was for"})),
  h(Button, {tone: "brand"}, "Save"));

export default {
  install: 'import {KeyboardAvoiding} from "@aurea-uds/native";',
  description: "The shell that lifts a form when the on-screen keyboard rises, so the save button stays above it. The right behaviour differs by platform — padding on iOS, height on Android — and it picks it for you. In the browser there is no on-screen keyboard to measure, so here it stays still.",
  api: {
    children: "The screen's content — usually the form. It fills the height (flex: 1).",
    offset: "Extra space at the top, in dp, when something above the shell is not part of it — the height of a Header, for example.",
  },
  examples: [
    {
      title: "Usage",
      description: "On a phone, the form moves up with the keyboard. Here it shows as it does with the keyboard closed.",
      code: `<KeyboardAvoiding>
  <Stack>
    <Field label="Amount"><Input keyboardType="numeric" placeholder="0.00" /></Field>
    <Field label="Note"><Input placeholder="What it was for" /></Field>
    <Button tone="brand" onPress={save}>Save</Button>
  </Stack>
</KeyboardAvoiding>`,
      render: () => h("div", {style: largura}, h(KeyboardAvoiding, null, formulario())),
    },
    {
      title: "Under a header",
      description: "offset adds the height of what sits above the shell, so the lift is measured from the right place.",
      code: `<KeyboardAvoiding offset={56}>
  <Stack>…</Stack>
</KeyboardAvoiding>`,
      render: () => h("div", {style: largura}, h(KeyboardAvoiding, {offset: 56}, formulario())),
    },
  ],
};
