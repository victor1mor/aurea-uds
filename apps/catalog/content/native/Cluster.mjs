// O Cluster do nativo no site (bloco 1, o grupo 1 — 23/10/2026). Todo valor das props do tipo em exemplo.
// A caixa cinza em volta de cada fila é só da página: mostra até onde a fila vai, para o alinhamento se ver.
import {createElement as h} from "react";
import {Badge, Button, Cluster, Text} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const coluna = {display: "grid", gap: "var(--space-3)", width: "100%"};
const caixa = (filho, largura = "100%") => h("div", {style: {width: largura, maxWidth: "100%", padding: "var(--space-3)",
  background: "var(--fill-1)", borderRadius: "var(--radius-card)", boxSizing: "border-box", overflow: "hidden"}}, filho);

export default {
  install: 'import {Cluster} from "@aurea-uds/native";',
  api: {
    children: "A row that wraps, centred on the cross axis, with 12 between items: the row of chips and buttons. The gap has no prop, on purpose, as in Stack.",
  },
  examples: [
    {
      title: "Usage",
      code: `<Cluster>
  <Badge tone="success">Paid</Badge>
  <Badge tone="warning">Pending</Badge>
  <Badge tone="info">Shipped</Badge>
</Cluster>`,
      render: () => caixa(h(Cluster, null,
        h(Badge, {tone: "success"}, "Paid"), h(Badge, {tone: "warning"}, "Pending"), h(Badge, {tone: "info"}, "Shipped"))),
    },
    cada({titulo: "Align", descricao: "The cross axis, with pieces of different heights: start, center (the default), end, or the text baseline.",
      valores: ["start", "center", "end", "baseline"], estilo: coluna,
      codigo: v => `<Cluster align="${v}">\n  <Button size="lg">Large</Button>\n  <Button size="sm">Small</Button>\n  <Text>align ${v}</Text>\n</Cluster>`,
      peca: v => caixa(h(Cluster, {align: v},
        h(Button, {size: "lg"}, "Large"), h(Button, {size: "sm"}, "Small"), h(Text, null, `align ${v}`)))}),
    cada({titulo: "Justify", descricao: "The main axis. between spreads the free space: a name on one side, a button on the other.",
      valores: ["start", "center", "end", "between"], estilo: coluna,
      codigo: v => `<Cluster justify="${v}">\n  <Text>justify ${v}</Text>\n  <Button size="sm">Edit</Button>\n</Cluster>`,
      peca: v => caixa(h(Cluster, {justify: v}, h(Text, null, `justify ${v}`), h(Button, {size: "sm"}, "Edit")))}),
    {
      title: "Wrap",
      description: "The row wraps by default. wrap={false} keeps everything on one line; here the box around it cuts what does not fit.",
      code: ["<Cluster>", "<Cluster wrap={false}>"].map((abre) => `${abre}\n`
        + ["Design", "Research", "Writing", "Review", "Launch"].map((n) => `  <Badge>${n}</Badge>`).join("\n") + "\n</Cluster>").join("\n"),
      render: () => h("div", {style: coluna}, ...[true, false].map((quebra) => h("div", {key: String(quebra)},
        caixa(h(Cluster, quebra ? null : {wrap: false},
          ...["Design", "Research", "Writing", "Review", "Launch"].map((n) => h(Badge, {key: n}, n))), "16rem")))),
    },
  ],
};
