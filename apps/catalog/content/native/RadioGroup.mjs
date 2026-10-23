// O RadioGroup do nativo no site (bloco 1, o grupo 1 — 23/10/2026). Todo valor das props do tipo em exemplo.
// Cada exemplo guarda a própria escolha: tocar numa linha escolhe, como no telefone.
import {createElement as h, useState} from "react";
import {RadioGroup, Text} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const largura = {display: "grid", gap: "var(--space-6)", width: "min(28rem, 100%)"};

// O grupo com a escolha guardada aqui: `props` vão para o RadioGroup, `itens` são os filhos.
function Grupo({inicio = "standard", props, itens}) {
  const [valor, setValor] = useState(inicio);
  return h(RadioGroup, {label: "Delivery", value: valor, onValueChange: setValor, ...props}, ...(itens ?? ENTREGA()));
}
const ENTREGA = () => [
  h(RadioGroup.Item, {key: "s", value: "standard", label: "Standard", description: "5 to 7 working days"}),
  h(RadioGroup.Item, {key: "e", value: "express", label: "Express", description: "2 to 3 working days"}),
];
const ITENS_DO_CODIGO = `  <RadioGroup.Item value="standard" label="Standard" description="5 to 7 working days" />
  <RadioGroup.Item value="express" label="Express" description="2 to 3 working days" />`;

export default {
  install: 'import {RadioGroup} from "@aurea-uds/native";',
  description: "A group of options where one stays chosen, and each RadioGroup.Item is the whole tappable row. On native the group's label is its name for the screen reader; a visible name, a description or an error go around it.",
  api: {
    label: "The group's name for the screen reader (\"Delivery\"). It draws nothing: for a visible name, put a Label above.",
    value: "The value of the chosen item. Controlled: the screen keeps it.",
    orientation: "vertical (the default) stacks the items; horizontal puts them in a row. 12 between items either way.",
    indicatorPlacement: "Which side of the row the mark sits on, for every item: end (the default) or start. An item's own indicatorPlacement wins.",
    variant: "list (the default) is the row; card makes each item a whole tappable card — the choice card, with the Card's skin, and the selected card on the chosen one.",
    children: "RadioGroup.Item elements (value, label, description, icon, disabled, invalid, indicatorPlacement). Between them a Separator fits; on a card, children of the item hold the price or the list of what it includes.",
  },
  examples: [
    {
      title: "Usage",
      code: `const [delivery, setDelivery] = useState("standard");
<RadioGroup label="Delivery" value={delivery} onValueChange={setDelivery}>
${ITENS_DO_CODIGO}
</RadioGroup>`,
      render: () => h("div", {style: largura}, h(Grupo)),
    },
    cada({titulo: "Orientation", descricao: "vertical stacks the items; horizontal puts them side by side.",
      valores: ["vertical", "horizontal"], estilo: largura,
      codigo: v => `<RadioGroup orientation="${v}" label="Delivery" value={delivery} onValueChange={setDelivery}>\n${ITENS_DO_CODIGO}\n</RadioGroup>`,
      peca: v => h(Grupo, {props: {orientation: v}})}),
    cada({titulo: "Indicator placement", descricao: "The mark at the end of the row (the default) or at the start.",
      valores: ["end", "start"], estilo: largura,
      codigo: v => `<RadioGroup indicatorPlacement="${v}" label="Delivery" value={delivery} onValueChange={setDelivery}>\n${ITENS_DO_CODIGO}\n</RadioGroup>`,
      peca: v => h(Grupo, {props: {indicatorPlacement: v}})}),
    cada({titulo: "Variants", descricao: "list is the row; card makes every item a card, and the chosen one the selected card. The card's children are text to read: the whole card is already the target.",
      valores: ["list", "card"], estilo: largura,
      codigo: v => `<RadioGroup variant="${v}" label="Plan" value={plan} onValueChange={setPlan}>
  <RadioGroup.Item value="basic" label="Basic" description="For one person">
    <Text weight={600}>Free</Text>
  </RadioGroup.Item>
  <RadioGroup.Item value="team" label="Team" description="Up to 10 people">
    <Text weight={600}>$12 a month</Text>
  </RadioGroup.Item>
</RadioGroup>`,
      peca: v => h(Grupo, {inicio: "team", props: {variant: v, label: "Plan"}, itens: [
        h(RadioGroup.Item, {key: "b", value: "basic", label: "Basic", description: "For one person"}, h(Text, {weight: 600}, "Free")),
        h(RadioGroup.Item, {key: "t", value: "team", label: "Team", description: "Up to 10 people"}, h(Text, {weight: 600}, "$12 a month")),
      ]})}),
    {
      title: "With icons",
      description: "An icon before the text; the chosen item draws its filled form.",
      code: `<RadioGroup label="Receive at" value={place} onValueChange={setPlace}>
  <RadioGroup.Item value="home" label="Home" description="Delivered to your door" icon="house" />
  <RadioGroup.Item value="pickup" label="Pick-up" description="Collect it at the counter" icon="user" />
</RadioGroup>`,
      render: () => h("div", {style: largura}, h(Grupo, {inicio: "home", props: {label: "Receive at"}, itens: [
        h(RadioGroup.Item, {key: "h", value: "home", label: "Home", description: "Delivered to your door", icon: "house"}),
        h(RadioGroup.Item, {key: "p", value: "pickup", label: "Pick-up", description: "Collect it at the counter", icon: "user"}),
      ]})),
    },
    {
      title: "States",
      description: "invalid paints the group in danger; disabled turns it off. Both also exist on a single item.",
      code: `<RadioGroup label="Delivery" value={delivery} onValueChange={setDelivery} invalid>
${ITENS_DO_CODIGO}
</RadioGroup>
<RadioGroup label="Delivery" value="standard" disabled>
${ITENS_DO_CODIGO}
</RadioGroup>`,
      render: () => h("div", {style: largura}, h(Grupo, {props: {invalid: true}}), h(Grupo, {props: {disabled: true}})),
    },
  ],
};
