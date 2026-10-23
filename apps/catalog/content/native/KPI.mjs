// O KPI do nativo no site (bloco 1, o 5-A — 23/10/2026): um número com nome, rodando pelo `react-native-web`.
// Todo valor das props do tipo em exemplo (`api-surface-native.json`).
import {createElement as h} from "react";
import {Card, KPI, Stack, Text} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const largura = {width: "min(18rem, 100%)"};
const grade = {display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(14rem, 1fr))", gap: "var(--space-3)", width: "100%"};
const TENDENCIA = {up: "+12% vs last month", down: "−8% vs last month", flat: "Same as last month"};

export default {
  install: 'import {KPI} from "@aurea-uds/native";',
  api: {
    direction: "Where the number went. Draws the arrow (trend-up, trend-down, minus — your icon registry needs the three), colours the trend and puts the word in the name the screen reader hears.",
  },
  examples: [
    {
      title: "Usage",
      code: `<KPI label="Revenue" value="$48.2k" trend="+12% vs last month" direction="up" />`,
      render: () => h("div", {style: largura}, h(KPI, {label: "Revenue", value: "$48.2k", trend: "+12% vs last month", direction: "up"})),
    },
    cada({titulo: "Directions", descricao: "The arrow and the word say where the number went, so the direction never depends on colour alone.",
      valores: ["up", "down", "flat"], estilo: grade,
      codigo: v => `<KPI label="Orders" value="1,284" trend="${TENDENCIA[v]}" direction="${v}" />`,
      peca: v => h(KPI, {label: "Orders", value: "1,284", trend: TENDENCIA[v], direction: v})}),
    cada({titulo: "Tones", descricao: "The colour of the trend. Set it when going up is bad — a cost, an error rate.",
      valores: ["success", "danger", "neutral"], estilo: grade,
      codigo: v => `<KPI label="Support cost" value="$9.1k" trend="+4% vs last month" direction="up" tone="${v}" />`,
      peca: v => h(KPI, {label: "Support cost", value: "$9.1k", trend: "+4% vs last month", direction: "up", tone: v})}),
    {
      title: "Variants",
      description: "card is the number in its own card; plain drops the card, for a number inside a card that already exists.",
      code: `<KPI variant="card" label="Visits" value="18,402" />

<Card>
  <Stack>
    <Text weight={600}>This week</Text>
    <KPI variant="plain" label="Visits" value="18,402" />
  </Stack>
</Card>`,
      render: () => h("div", {style: grade},
        h(KPI, {variant: "card", label: "Visits", value: "18,402"}),
        h(Card, null, h(Stack, null, h(Text, {weight: 600}, "This week"), h(KPI, {variant: "plain", label: "Visits", value: "18,402"})))),
    },
    {
      title: "The word in another language",
      description: "directionLabel is the word the screen reader hears before the trend; English by default.",
      code: `<KPI label="Receita" value="R$ 48,2 mil" trend="+12% sobre o mês passado" direction="up" directionLabel="Subiu" />`,
      render: () => h("div", {style: largura}, h(KPI, {label: "Receita", value: "R$ 48,2 mil", trend: "+12% sobre o mês passado", direction: "up", directionLabel: "Subiu"})),
    },
  ],
};
