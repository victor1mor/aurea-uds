// O Card do nativo no site (bloco 1, o 5-A — 23/10/2026). Todo valor das props do tipo em exemplo.
import {createElement as h} from "react";
import {Button, Card, Text} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const grade = {display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(12rem, 1fr))", gap: "var(--space-3)", width: "100%"};

export default {
  install: 'import {Card} from "@aurea-uds/native";',
  examples: [
    {
      title: "Usage",
      code: `<Card>
  <Text weight={600}>Weekly report</Text>
  <Text tone="muted">Ready for review.</Text>
</Card>`,
      render: () => h("div", {style: {width: "min(24rem, 100%)"}}, h(Card, null,
        h(Text, {weight: 600}, "Weekly report"), h(Text, {tone: "muted"}, "Ready for review."))),
    },
    cada({titulo: "Variants", descricao: "base floats; raised lifts; inset sinks; outline is the one card with a line; selected and danger mark a state; contrast is the dark theme inside the card; interactive answers the touch.",
      valores: ["base", "raised", "inset", "outline", "selected", "danger", "contrast", "interactive"], estilo: grade,
      codigo: v => v === "interactive" ? `<Card variant="interactive" onPress={open}><Text>variant interactive</Text></Card>`
        : `<Card variant="${v}"><Text>variant ${v}</Text></Card>`,
      peca: v => h(Card, {variant: v, ...(v === "interactive" ? {onPress: () => {}, accessibilityLabel: "Open the report"} : {})},
        h(Text, null, `variant ${v}`))}),
    {
      title: "The brand card",
      description: "variant=\"brand\" is the yellow card, and it asks for an action: what the person does here.",
      code: `<Card variant="brand" action={<Button tone="neutral">Upgrade</Button>}>
  <Text weight={600}>Get more credits</Text>
</Card>`,
      render: () => h("div", {style: {width: "min(24rem, 100%)"}}, h(Card, {variant: "brand", action: h(Button, {tone: "neutral"}, "Upgrade")},
        h(Text, {weight: 600}, "Get more credits"))),
    },
    cada({titulo: "Accent", descricao: "A 4 stroke on top, in the full colour of the tone.",
      valores: ["brand", "info", "success", "warning", "danger"], estilo: grade,
      codigo: v => `<Card accent="${v}"><Text>accent ${v}</Text></Card>`,
      peca: v => h(Card, {accent: v}, h(Text, null, `accent ${v}`))}),
  ],
};
