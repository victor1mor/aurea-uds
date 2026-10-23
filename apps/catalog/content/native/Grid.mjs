// O Grid do nativo no site (bloco 1, o 5-A — 23/10/2026): colunas sem breakpoint, na conta do `auto-fill` da web —
// o React Native não tem CSS Grid, então a grade mede a própria largura e reparte a sobra.
import {createElement as h} from "react";
import {Card, Grid, Text} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const largura = {width: "100%"};
const coluna = {display: "grid", gap: "var(--space-6)", width: "100%"};
const NOMES = ["Visits", "Orders", "Revenue", "Returns"];
const cartoes = (prefixo = "") => NOMES.map((n) => h(Card, {key: n}, h(Text, {weight: 600}, `${prefixo}${n}`)));

export default {
  install: 'import {Grid} from "@aurea-uds/native";',
  api: {
    minColumnWidth: "The narrowest a column gets, in dp or by name: xs 8rem, sm 12rem, md 15rem, lg 20rem. Defaults to 240, the web's 15rem. As many columns as fit, and the spare width is shared.",
    children: "The cells. Each one stretches to the tallest in its row; in the last row a cell keeps the width of one column.",
  },
  examples: [
    {
      title: "Usage",
      code: `<Grid>
  <Card><Text weight={600}>Visits</Text></Card>
  <Card><Text weight={600}>Orders</Text></Card>
  <Card><Text weight={600}>Revenue</Text></Card>
  <Card><Text weight={600}>Returns</Text></Card>
</Grid>`,
      render: () => h("div", {style: largura}, h(Grid, null, ...cartoes())),
    },
    cada({titulo: "Column width by name", descricao: "The same four names as the web. The grid fits as many columns as the width allows.",
      valores: ["xs", "sm", "md", "lg"], estilo: coluna,
      codigo: v => `<Grid minColumnWidth="${v}">…</Grid>`,
      peca: v => h(Grid, {minColumnWidth: v}, ...cartoes(`${v} · `))}),
    {
      title: "Column width in dp",
      description: "A number is the minimum in dp; the spare width is shared between the columns.",
      code: `<Grid minColumnWidth={150}>…</Grid>`,
      render: () => h("div", {style: largura}, h(Grid, {minColumnWidth: 150}, ...cartoes())),
    },
  ],
};
