// O DataList do nativo no site (bloco 1, o 5-A — 23/10/2026). Todo valor das props do tipo em exemplo.
import {createElement as h} from "react";
import {Badge, DataList} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const ITENS = [
  {term: "Plan", value: "Team"},
  {term: "Seats", value: "12 of 20"},
  {term: "Renews", value: "1 March 2027"},
];
const largo = {width: "min(28rem, 100%)"};

export default {
  install: 'import {DataList} from "@aurea-uds/native";',
  api: {
    items: "Term and value pairs. React Native has no definition list, so each pair is ONE accessible node named \"term: value\" — the screen reader reads the two together, never a value apart from its term.",
    layout: "Forces the shape. auto decides by the window width, at the web's 640; stacked puts the value under its term, which is what a phone always gets; inline puts them side by side.",
    style: "Style of the list.",
    testID: "Test id of the list.",
  },
  examples: [
    {
      title: "Usage",
      code: `<DataList items={[
  {term: "Plan", value: "Team"},
  {term: "Seats", value: "12 of 20"},
  {term: "Renews", value: "1 March 2027"},
]} />`,
      render: () => h("div", {style: largo}, h(DataList, {items: ITENS})),
    },
    cada({titulo: "Layout", descricao: "auto follows the window, stacked is the phone's shape, inline puts term and value on one line.",
      valores: ["auto", "stacked", "inline"], estilo: {display: "grid", gap: "var(--space-6)", width: "min(28rem, 100%)"},
      codigo: v => `<DataList layout="${v}" items={items} />`,
      peca: v => h(DataList, {layout: v, items: ITENS})}),
    {
      title: "A value that is a piece",
      description: "value takes any node — a badge, a link. The joined \"term: value\" name is written for text pairs; with a piece, the pair is still one stop for the screen reader.",
      code: `<DataList items={[
  {term: "Status", value: <Badge tone="success" fit="content">Active</Badge>},
  {term: "Owner", value: "Ana Lima"},
]} />`,
      render: () => h("div", {style: largo}, h(DataList, {items: [
        {term: "Status", value: h(Badge, {tone: "success", fit: "content"}, "Active")},
        {term: "Owner", value: "Ana Lima"},
      ]})),
    },
  ],
};
