// O Radio do nativo no site (bloco 1, o 5-A — 23/10/2026). Todo valor das props do tipo em exemplo. Não há prop `name`: quem
// agrupa os rádios é o estado da tela, e cada exemplo guarda o seu.
import {createElement as h, useState} from "react";
import {View} from "react-native";
import {Radio} from "../../../../packages/native/dist/index.js";

const LONGO = "Deliver to the address on file, and leave the parcel at the front desk if nobody answers";

// Um grupo de rádios: a tela guarda a escolha; cada rádio diz se é o escolhido. Cada opção leva as próprias props.
function Grupo({nome, opcoes, inicial = opcoes[0].id}) {
  const [escolhido, setEscolhido] = useState(inicial);
  return h(View, {accessibilityRole: "radiogroup", accessibilityLabel: nome},
    ...opcoes.map(({id, ...props}) => h(Radio, {key: id, ...props,
      checked: escolhido === id, onChange: () => setEscolhido(id)})));
}
const largo = (filho) => h("div", {style: {width: "min(26rem, 100%)"}}, filho);

export default {
  install: 'import {Radio} from "@aurea-uds/native";',
  api: {
    label: "The option's name, written beside the circle. Optional on native — without it, give accessibilityLabel.",
    description: "A muted line under the label, read by the screen reader as the hint.",
    checked: "Whether this option is the chosen one. There is no name prop: the screen's state groups the radios, and checked comes from it.",
    onChange: "Called with true when the option is tapped; the screen stores the choice.",
    style: "Style of the row.",
    testID: "Test id of the row.",
    align: "Where the circle sits against the text: center (the default) in the middle of the block; start in the middle of the first line, for a long label.",
    accessibilityLabel: "The name for the screen reader when it must not be written beside the circle — a NavList row already shows it. It wins over label.",
  },
  examples: [
    {
      title: "Usage",
      description: "One choice of several. The view around carries the question; RadioGroup does this wiring for you.",
      code: `const [plan, setPlan] = useState("yearly");

<View accessibilityRole="radiogroup" accessibilityLabel="Plan">
  <Radio label="Monthly" checked={plan === "monthly"} onChange={() => setPlan("monthly")} />
  <Radio label="Yearly" checked={plan === "yearly"} onChange={() => setPlan("yearly")} />
  <Radio label="Lifetime" checked={plan === "lifetime"} onChange={() => setPlan("lifetime")} />
</View>`,
      render: () => largo(h(Grupo, {nome: "Plan", inicial: "yearly", opcoes: [
        {id: "monthly", label: "Monthly"}, {id: "yearly", label: "Yearly"}, {id: "lifetime", label: "Lifetime"}]})),
    },
    {
      title: "Sizes",
      description: "The field step: the circle is half the control's height.",
      code: `<Radio size="sm" label="size sm" checked={size === "sm"} onChange={() => setSize("sm")} />
<Radio size="md" label="size md" checked={size === "md"} onChange={() => setSize("md")} />
<Radio size="lg" label="size lg" checked={size === "lg"} onChange={() => setSize("lg")} />`,
      render: () => largo(h(Grupo, {nome: "Size", inicial: "md",
        opcoes: ["sm", "md", "lg"].map((v) => ({id: v, size: v, label: `size ${v}`}))})),
    },
    {
      title: "With a description",
      description: "A muted line under the label; the screen reader reads it as the hint.",
      code: `const [plan, setPlan] = useState("yearly");

<Radio label="Monthly" description="$ 12 a month" checked={plan === "monthly"} onChange={() => setPlan("monthly")} />
<Radio label="Yearly" description="$ 120 a year — two months free" checked={plan === "yearly"} onChange={() => setPlan("yearly")} />`,
      render: () => largo(h(Grupo, {nome: "Billing", inicial: "yearly", opcoes: [
        {id: "monthly", label: "Monthly", description: "$ 12 a month"},
        {id: "yearly", label: "Yearly", description: "$ 120 a year — two months free"}]})),
    },
    {
      title: "Alignment",
      description: "With a long label, align=\"start\" puts the circle by the first line; center keeps it in the middle of the block.",
      code: `const [choice, setChoice] = useState("center");

<Radio align="center" label="${LONGO}" checked={choice === "center"} onChange={() => setChoice("center")} />
<Radio align="start" label="${LONGO}" checked={choice === "start"} onChange={() => setChoice("start")} />`,
      render: () => largo(h(Grupo, {nome: "Delivery", opcoes: [
        {id: "center", align: "center", label: LONGO}, {id: "start", align: "start", label: LONGO}]})),
    },
    {
      title: "Disabled",
      description: "The option keeps its place, and the screen reader still reaches it and says it is unavailable.",
      code: `<Radio label="Lifetime" description="Sold out" disabled checked={false} />`,
      render: () => largo(h(Grupo, {nome: "Plan", opcoes: [
        {id: "monthly", label: "Monthly"},
        {id: "lifetime", label: "Lifetime", description: "Sold out", disabled: true}]})),
    },
  ],
};
