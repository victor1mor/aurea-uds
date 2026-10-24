// O Combobox do nativo no site (bloco 1, o grupo 1 — 23/10/2026). Todo valor das props do tipo em exemplo.
// Cada exemplo guarda a própria escolha: tocar no campo abre a folha com a busca, como no telefone.
import {createElement as h, useRef, useState} from "react";
import {Combobox, Field} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const largura = {display: "grid", gap: "var(--space-4)", width: "min(24rem, 100%)"};
const FRUTAS = ["Apple", "Banana", "Cherry", "Grape", "Mango", "Orange", "Peach", "Pear", "Plum", "Strawberry"]
  .map((f) => ({value: f.toLowerCase(), label: f}));
const CAFES = [
  {value: "beans", label: "Coffee beans", description: "1 kg bag"},
  {value: "ground", label: "Ground coffee", description: "500 g bag"},
  {value: "pods", label: "Coffee pods", description: "Box of 30"},
];

// O campo com a escolha guardada aqui: `props` vão para o Combobox, `rotulo` para o Field.
function Campo({rotulo, props}) {
  const [escolhido, setEscolhido] = useState(null);
  return h(Field, {label: rotulo},
    h(Combobox, {items: FRUTAS, value: escolhido, onValueChange: setEscolhido, placeholder: "Pick a fruit", ...props}));
}

// A busca remota de mentira: a lista chega 400 ms depois, e `loading` mostra a espera.
function Remoto() {
  const [escolhido, setEscolhido] = useState(null);
  const [itens, setItens] = useState(FRUTAS);
  const [buscando, setBuscando] = useState(false);
  const relogio = useRef(null);
  const buscar = (texto) => {
    setBuscando(true);
    clearTimeout(relogio.current);
    relogio.current = setTimeout(() => {
      setItens(FRUTAS.filter((f) => f.label.toLowerCase().includes(texto.trim().toLowerCase())));
      setBuscando(false);
    }, 400);
  };
  return h(Field, {label: "Fruit (remote)"},
    h(Combobox, {items: itens, value: escolhido, onValueChange: setEscolhido, onSearchChange: buscar, loading: buscando,
      placeholder: "Search the catalogue"}));
}

export default {
  install: 'import {Combobox} from "@aurea-uds/native";',
  description: "A field to find one item by typing: the trigger opens a sheet from the bottom with a search field and the list. Aurea filters a list in hand; with onSearchChange, the app searches and Aurea draws what arrives.",
  api: {
    items: "The options, as data: {value, label, description?}. With onSearchChange, it is the list already searched — Aurea draws what arrives.",
    size: "The field height, the same steps as Select and Input: 40, 48 and 56.",
    onSearchChange: "What was typed in the sheet's search field, after searchDelay. Its presence turns off Aurea's own filter: the app searches.",
    searchDelay: "The wait before onSearchChange, in ms. 250 by default; 0 turns it off.",
    loading: "Shows the spinner in place of the list, while the remote search has not come back.",
    onEndReached: "The end of the list was reached: this is where a remote catalogue pages.",
    searchPlaceholder: "What the sheet's search field shows when empty. Without it, the strings phrase (\"Search\").",
    clearable: "Shows the clear button on the trigger when something is chosen. On by default.",
    draggable: "Dragging the sheet's header down closes it. On by default — on the iPhone it is the only gesture that closes.",
    chevron: "The arrow glyph on the trigger; false removes it. It has to be in the app's icon registry.",
    searchIcon: "The magnifier in the sheet's search field; false removes it.",
    searchKeyboardType: "The keyboard of the sheet's search field — \"number-pad\" to search a year or a code.",
    style: "Added to the trigger, after the Aurea skin.",
    testID: "The id for tests.",
  },
  examples: [
    {
      title: "Usage",
      code: `const [fruit, setFruit] = useState<AureaComboboxItem | null>(null);
<Field label="Fruit">
  <Combobox items={fruits} value={fruit} onValueChange={setFruit} placeholder="Pick a fruit" />
</Field>`,
      render: () => h("div", {style: largura}, h(Campo, {rotulo: "Fruit"})),
    },
    cada({titulo: "Sizes", descricao: "The touch scale: 40, 48 and 56, the same as the other fields.",
      valores: ["sm", "md", "lg"], estilo: largura,
      codigo: v => `<Field label="Fruit (${v})">\n  <Combobox size="${v}" items={fruits} value={fruit} onValueChange={setFruit} />\n</Field>`,
      peca: v => h(Campo, {rotulo: `Fruit (${v})`, props: {size: v}})}),
    {
      title: "With a second line",
      description: "An item can carry a description under its label. The search still looks only at the label.",
      code: `<Field label="Product">
  <Combobox items={[
    {value: "beans", label: "Coffee beans", description: "1 kg bag"},
    {value: "ground", label: "Ground coffee", description: "500 g bag"},
    {value: "pods", label: "Coffee pods", description: "Box of 30"},
  ]} value={product} onValueChange={setProduct} />
</Field>`,
      render: () => h("div", {style: largura}, h(Campo, {rotulo: "Product", props: {items: CAFES, placeholder: "Pick a product"}})),
    },
    {
      title: "Remote search",
      description: "With onSearchChange the app searches and Aurea draws what arrives; loading shows the wait.",
      code: `<Field label="Fruit (remote)">
  <Combobox items={results} value={fruit} onValueChange={setFruit}
    onSearchChange={search} loading={searching} placeholder="Search the catalogue" />
</Field>`,
      render: () => h("div", {style: largura}, h(Remoto)),
    },
    {
      title: "Disabled",
      description: "The trigger does not open, and the screen reader hears it as disabled.",
      code: `<Field label="Fruit (disabled)">
  <Combobox items={fruits} value={null} disabled placeholder="Pick a fruit" />
</Field>`,
      render: () => h("div", {style: largura}, h(Campo, {rotulo: "Fruit (disabled)", props: {disabled: true}})),
    },
  ],
};
