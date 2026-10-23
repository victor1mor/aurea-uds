// O Badge do nativo no site (bloco 1, o 5-A — 23/10/2026). Todo valor das props do tipo em exemplo.
import {createElement as h} from "react";
import {Badge, IconButton} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const TONS = ["neutral", "primary", "info", "success", "warning", "danger", "red", "orange", "green", "teal", "cyan", "blue", "violet", "pink"];

export default {
  install: 'import {Badge} from "@aurea-uds/native";',
  examples: [
    {
      title: "Usage",
      code: `<Badge tone="success">Paid</Badge>
<Badge tone="warning">Pending</Badge>
<Badge tone="danger" emphasis="solid">Overdue</Badge>`,
      render: () => h("div", {style: {display: "flex", gap: "var(--space-3)", flexWrap: "wrap", alignItems: "center"}},
        h(Badge, {tone: "success"}, "Paid"), h(Badge, {tone: "warning"}, "Pending"),
        h(Badge, {tone: "danger", emphasis: "solid"}, "Overdue")),
    },
    cada({titulo: "Tones", descricao: "The state tones and the eight category colours; yellow stays the brand's.",
      valores: TONS, codigo: v => `<Badge tone="${v}">${v}</Badge>`, peca: v => h(Badge, {tone: v}, v)}),
    cada({titulo: "Emphasis", descricao: "How loud the tone is: the tinted pill, the contour, or the fill.",
      valores: ["soft", "outline", "solid"], codigo: v => `<Badge tone="success" emphasis="${v}">${v}</Badge>`,
      peca: v => h(Badge, {tone: "success", emphasis: v}, v)}),
    cada({titulo: "Sizes", descricao: "From the small counter to the large pill.",
      valores: ["xs", "sm", "md", "lg"], codigo: v => `<Badge size="${v}">${v}</Badge>`, peca: v => h(Badge, {size: v}, v)}),
    cada({titulo: "Width", descricao: "fit=\"content\" keeps the badge as wide as its text inside a column; auto follows the container.",
      valores: ["auto", "content"], coluna: true, codigo: v => `<Badge fit="${v}">fit ${v}</Badge>`, peca: v => h(Badge, {fit: v}, `fit ${v}`)}),
    cada({titulo: "On a corner", descricao: "anchor hangs the badge on a corner of what it decorates; the count goes in that thing's name.",
      valores: ["top-end", "top-start", "bottom-end", "bottom-start"],
      codigo: v => `<Badge anchor="${v}" count={3} tone="danger" emphasis="solid">\n  <IconButton icon="star" label="Starred, 3 new" />\n</Badge>`,
      peca: v => h(Badge, {anchor: v, count: 3, tone: "danger", emphasis: "solid"}, h(IconButton, {icon: "star", label: `Starred, 3 new (${v})`}))}),
  ],
};
