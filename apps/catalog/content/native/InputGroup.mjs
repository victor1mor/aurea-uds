// O InputGroup do nativo no site (bloco 1, o 5-A — 23/10/2026): a caixa de campo que aceita um glifo na frente e um
// botão atrás, rodando pelo `react-native-web`. Todo valor das props do tipo em exemplo (`api-surface-native.json`).
import {createElement as h, useState} from "react";
import {Field, Icon, IconButton, Input, InputGroup, InputGroupAddon} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const largura = {width: "min(24rem, 100%)"};
const coluna = {display: "grid", gap: "var(--space-4)", width: "min(24rem, 100%)"};

// A busca com o botão de limpar, que só aparece com texto.
function Busca() {
  const [texto, setTexto] = useState("invoices");
  return h(Field, {label: "Search"},
    h(InputGroup, null,
      h(InputGroupAddon, null, h(Icon, {name: "magnifying-glass", size: "sm"})),
      h(Input, {value: texto, onChangeText: setTexto, placeholder: "Search reports"}),
      texto ? h(InputGroupAddon, null,
        h(IconButton, {name: "x", label: "Clear search", appearance: "ghost", size: "sm", onPress: () => setTexto("")})) : null));
}

export default {
  install: 'import {InputGroup, InputGroupAddon} from "@aurea-uds/native";',
  api: {
    size: "The size step. Without it, the Field's around it, as on the Input.",
    disabled: "Disables the box and the control inside. Without it, the Field's.",
    testID: "Test id of the box.",
  },
  examples: [
    {
      title: "Usage",
      description: "The Input inside stops drawing its own box: the group draws the fill, the height, the focus and the invalid state. An addon before the field sits in front; after it, at the end.",
      code: `<Field label="Email">
  <InputGroup>
    <InputGroupAddon><Icon name="envelope-simple" size="sm" /></InputGroupAddon>
    <Input placeholder="name@example.com" keyboardType="email-address" />
  </InputGroup>
</Field>`,
      render: () => h("div", {style: largura}, h(Field, {label: "Email"},
        h(InputGroup, null,
          h(InputGroupAddon, null, h(Icon, {name: "envelope-simple", size: "sm"})),
          h(Input, {placeholder: "name@example.com", keyboardType: "email-address"})))),
    },
    cada({titulo: "Sizes", descricao: "The height and the inset follow the step; the Input inside takes the group's size.",
      valores: ["sm", "md", "lg"], estilo: coluna,
      codigo: v => `<Field label="Email, ${v}">\n  <InputGroup size="${v}">\n    <InputGroupAddon><Icon name="envelope-simple" size="sm" /></InputGroupAddon>\n    <Input placeholder="name@example.com" />\n  </InputGroup>\n</Field>`,
      peca: v => h(Field, {label: `Email, ${v}`}, h(InputGroup, {size: v},
        h(InputGroupAddon, null, h(Icon, {name: "envelope-simple", size: "sm"})),
        h(Input, {placeholder: "name@example.com"})))}),
    {
      title: "A button at the end",
      description: "The addon after the field holds a button; this one clears the search.",
      code: `<Field label="Search">
  <InputGroup>
    <InputGroupAddon><Icon name="magnifying-glass" size="sm" /></InputGroupAddon>
    <Input value={text} onChangeText={setText} placeholder="Search reports" />
    {text ? (
      <InputGroupAddon>
        <IconButton name="x" label="Clear search" appearance="ghost" size="sm" onPress={() => setText("")} />
      </InputGroupAddon>
    ) : null}
  </InputGroup>
</Field>`,
      render: () => h("div", {style: largura}, h(Busca)),
    },
    {
      title: "Disabled",
      code: `<Field label="Website">
  <InputGroup disabled>
    <InputGroupAddon><Icon name="lock" size="sm" /></InputGroupAddon>
    <Input defaultValue="example.com" />
  </InputGroup>
</Field>`,
      render: () => h("div", {style: largura}, h(Field, {label: "Website"}, h(InputGroup, {disabled: true},
        h(InputGroupAddon, null, h(Icon, {name: "lock", size: "sm"})),
        h(Input, {defaultValue: "example.com"})))),
    },
  ],
};
