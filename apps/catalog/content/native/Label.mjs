// O Label do nativo no site (bloco 1, o grupo 1 — 23/10/2026). No React Native um texto ao lado não nomeia nada:
// quem nomeia o controle é o `accessibilityLabel` dele, e o `Field` o entrega. O Label solto é o rótulo que se VÊ.
import {createElement as h, useState} from "react";
import {Label, RadioGroup, Text} from "../../../../packages/native/dist/index.js";

const largura = {display: "grid", gap: "var(--space-2)", width: "min(24rem, 100%)"};

// O grupo de rádio tem nome para o leitor de tela (`label`), e não desenha rótulo: o Label é o que se vê.
function Entrega() {
  const [entrega, setEntrega] = useState("standard");
  return h("div", {style: largura},
    h(Label, null, "Delivery"),
    h(RadioGroup, {label: "Delivery", value: entrega, onValueChange: setEntrega},
      h(RadioGroup.Item, {value: "standard", label: "Standard", description: "5 to 7 working days"}),
      h(RadioGroup.Item, {value: "express", label: "Express", description: "2 to 3 working days"})));
}

export default {
  install: 'import {Label} from "@aurea-uds/native";',
  description: "The field label on its own. On React Native a text beside a control names nothing — the control's accessibilityLabel does, and Field hands it over. Inside a Field you do not need it; on its own it is the visible name of something that carries its own accessible name.",
  api: {
    children: "The text, in 16 medium. A string becomes Aurea text; anything else goes in as it is.",
    trailing: "What goes on the right: a character count, \"Optional\".",
  },
  examples: [
    {
      title: "Usage",
      code: `<Label trailing={<Text size="xs" tone="muted">Optional</Text>}>Nickname</Label>`,
      render: () => h("div", {style: largura},
        h(Label, {trailing: h(Text, {size: "xs", tone: "muted"}, "Optional")}, "Nickname")),
    },
    {
      title: "Over a group",
      description: "A RadioGroup's label is its name for the screen reader and draws nothing; a Label above it is the name people see.",
      code: `<Label>Delivery</Label>
<RadioGroup label="Delivery" value={delivery} onValueChange={setDelivery}>
  <RadioGroup.Item value="standard" label="Standard" description="5 to 7 working days" />
  <RadioGroup.Item value="express" label="Express" description="2 to 3 working days" />
</RadioGroup>`,
      render: () => h(Entrega),
    },
  ],
};
