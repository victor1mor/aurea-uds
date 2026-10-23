// O InputGroupAddon do nativo no site (bloco 1, o 5-A — 23/10/2026): o encaixe dentro do `InputGroup`. O tipo não tem lista
// fechada de valores; os exemplos mostram o lado, que é a ordem do JSX.
import {createElement as h, useState} from "react";
import {Field, Icon, IconButton, Input, InputGroup, InputGroupAddon, Text} from "../../../../packages/native/dist/index.js";

const largo = {width: "min(24rem, 100%)"};

function ComLimpar() {
  const [texto, setTexto] = useState("Weekly report");
  return h(Field, {label: "Report name"}, h(InputGroup, null,
    h(Input, {value: texto, onChangeText: setTexto}),
    h(InputGroupAddon, null, h(IconButton, {name: "x", label: "Clear the name", size: "sm", onPress: () => setTexto("")}))));
}

export default {
  install: 'import {InputGroup, InputGroupAddon} from "@aurea-uds/native";',
  api: {
    testID: "Test id of the slot. Where it sits is the JSX order: before the field it goes in front, after the field it goes behind. There is no side prop — in a React Native row, a prop that changed nothing would lie.",
  },
  examples: [
    {
      title: "Usage",
      description: "The group draws the box — fill, height, focus — and the field inside stops drawing its own. The addon holds what sits glued to it.",
      code: `<Field label="Email">
  <InputGroup>
    <InputGroupAddon><Icon name="envelope-simple" size="sm" /></InputGroupAddon>
    <Input keyboardType="email-address" placeholder="name@company.com" />
  </InputGroup>
</Field>`,
      render: () => h("div", {style: largo}, h(Field, {label: "Email"}, h(InputGroup, null,
        h(InputGroupAddon, null, h(Icon, {name: "envelope-simple", size: "sm"})),
        h(Input, {keyboardType: "email-address", placeholder: "name@company.com"})))),
    },
    {
      title: "Before and after",
      description: "A text prefix in front and a unit behind: the side is where the addon is written.",
      code: `<Field label="Website">
  <InputGroup>
    <InputGroupAddon><Text tone="muted">https://</Text></InputGroupAddon>
    <Input placeholder="your-site" autoCapitalize="none" />
    <InputGroupAddon><Text tone="muted">.com</Text></InputGroupAddon>
  </InputGroup>
</Field>`,
      render: () => h("div", {style: largo}, h(Field, {label: "Website"}, h(InputGroup, null,
        h(InputGroupAddon, null, h(Text, {tone: "muted"}, "https://")),
        h(Input, {placeholder: "your-site", autoCapitalize: "none"}),
        h(InputGroupAddon, null, h(Text, {tone: "muted"}, ".com"))))),
    },
    {
      title: "A button behind",
      description: "An addon can hold a button; it keeps its own name for the screen reader.",
      code: `const [name, setName] = useState("Weekly report");

<Field label="Report name">
  <InputGroup>
    <Input value={name} onChangeText={setName} />
    <InputGroupAddon>
      <IconButton name="x" label="Clear the name" size="sm" onPress={() => setName("")} />
    </InputGroupAddon>
  </InputGroup>
</Field>`,
      render: () => h("div", {style: largo}, h(ComLimpar)),
    },
  ],
};
