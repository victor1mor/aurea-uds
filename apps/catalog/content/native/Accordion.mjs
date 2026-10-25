// O Accordion do nativo no site (bloco 1, o 5-A — 23/10/2026): a peça do `@aurea-uds/native` rodando pelo
// `react-native-web`. Todo valor das props do tipo em exemplo (`api-surface-native.json`).
import {createElement as h, useState} from "react";
import {Accordion, Text} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const largura = {width: "min(28rem, 100%)"};
const coluna = {display: "grid", gap: "var(--space-4)", width: "100%"};

const ITENS = [
  {id: "shipping", title: "Shipping", content: "Orders leave the warehouse within two working days."},
  {id: "returns", title: "Returns", content: "Send it back within 30 days, in the original box."},
  {id: "warranty", title: "Warranty", content: "Two years on every part, from the day it arrives."},
];
const ITENS_CODIGO = `const items = [
  {id: "shipping", title: "Shipping", content: "Orders leave the warehouse within two working days."},
  {id: "returns", title: "Returns", content: "Send it back within 30 days, in the original box."},
  {id: "warranty", title: "Warranty", content: "Two years on every part, from the day it arrives."},
];`;

// O controlado: quem guarda os abertos é a tela, e a linha de baixo mostra a lista.
function Controlado() {
  const [abertos, setAbertos] = useState(["returns"]);
  return h("div", {style: {...largura, display: "grid", gap: "var(--space-3)"}},
    h(Accordion, {items: ITENS, multiple: true, value: abertos, onValueChange: setAbertos}),
    h(Text, {size: "sm", tone: "muted"}, `Open: ${abertos.length ? abertos.join(", ") : "none"}`));
}

export default {
  install: 'import {Accordion} from "@aurea-uds/native";',
  api: {
    items: "The sections, as data: {id, title, content, disabled?}. A closed section's content is not in the tree, so the screen reader does not read it.",
    variant: "surface puts the items in a card; default lays them on the page.",
    value: "The open ids, owned by the screen. With it, opening and closing go through onValueChange.",
    onValueChange: "Called with the new list of open ids on every touch.",
    style: "Style for the outer View.",
    testID: "Test id of the root; each trigger gets `<testID>-<id>`.",
  },
  examples: [
    {
      title: "Usage",
      code: `${ITENS_CODIGO}\n\n<Accordion items={items} defaultValue={["shipping"]} />`,
      render: () => h("div", {style: largura}, h(Accordion, {items: ITENS, defaultValue: ["shipping"]})),
    },
    cada({titulo: "Variants", descricao: "default sits on the page; surface puts the sections in a card.",
      valores: ["default", "surface"], estilo: coluna,
      codigo: v => `<Accordion variant="${v}" items={items} />`,
      peca: v => h("div", {style: largura}, h(Accordion, {variant: v, items: ITENS}))}),
    {
      title: "Several open",
      description: "multiple keeps every section the person opened; without it, opening one closes the other.",
      code: `<Accordion multiple items={items} defaultValue={["shipping", "returns"]} />`,
      render: () => h("div", {style: largura}, h(Accordion, {multiple: true, items: ITENS, defaultValue: ["shipping", "returns"]})),
    },
    {
      title: "Controlled",
      description: "value and onValueChange put the open sections in the screen's state.",
      code: `const [open, setOpen] = useState(["returns"]);

<Accordion multiple items={items} value={open} onValueChange={setOpen} />`,
      render: () => h(Controlado),
    },
    {
      title: "A section that does not open",
      description: "disabled on an item dims it, announces it as disabled, and the touch does nothing.",
      code: `<Accordion items={[
  {id: "shipping", title: "Shipping", content: "Orders leave the warehouse within two working days."},
  {id: "tracking", title: "Tracking", content: "Available once the order ships.", disabled: true},
]} />`,
      render: () => h("div", {style: largura}, h(Accordion, {items: [ITENS[0],
        {id: "tracking", title: "Tracking", content: "Available once the order ships.", disabled: true}]})),
    },
  ],
};
