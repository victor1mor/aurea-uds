// O SearchField do nativo no site (bloco 1, o 5-A — 23/10/2026). Todo valor das props do tipo em exemplo. O nome do campo
// vem do `Field` em volta; sem ele, do `placeholder`.
import {createElement as h, useState} from "react";
import {Field, SearchField, Stack, Text} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const NOMES = ["Ana Lima", "Bruno Reis", "Carla Dias", "Davi Melo", "Elisa Rocha"];
const largo = {width: "min(24rem, 100%)"};
const coluna = {display: "grid", gap: "var(--space-4)", width: "min(24rem, 100%)"};

// O campo controlado e a lista que ele filtra, na hora.
function Filtrar() {
  const [busca, setBusca] = useState("");
  const achados = NOMES.filter((n) => n.toLowerCase().includes(busca.trim().toLowerCase()));
  return h(Stack, null,
    h(Field, {label: "Search people"}, h(SearchField, {value: busca, onChangeText: setBusca, placeholder: "Name"})),
    ...(achados.length ? achados.map((n) => h(Text, {key: n}, n)) : [h(Text, {key: "-", tone: "muted"}, "No one by that name")]));
}

// A busca que espera a pessoa parar de digitar: o texto muda a cada tecla, a busca só depois da pausa.
function Esperar() {
  const [texto, setTexto] = useState("");
  const [buscado, setBuscado] = useState("");
  return h(Stack, null,
    h(Field, {label: "Search orders"},
      h(SearchField, {value: texto, onChangeText: setTexto, onSearchChange: setBuscado, searchDelay: 400, placeholder: "Order number"})),
    h(Text, {tone: "muted", size: "xs"}, buscado ? `Searched for: ${buscado}` : "Nothing searched yet"));
}

function Campo(props) {
  const [texto, setTexto] = useState(props.defaultText ?? "");
  const {label, defaultText, ...resto} = props;
  return h(Field, {label}, h(SearchField, {value: texto, onChangeText: setTexto, ...resto}));
}

export default {
  install: 'import {SearchField} from "@aurea-uds/native";',
  api: {
    value: "The text, controlled. Without it the field keeps its own text, and the X still empties it.",
    onChangeText: "Called with the text on every keystroke, and with \"\" when the X clears it.",
    onSearchChange: "Called with the text once the typing pauses for searchDelay — the place to run a search that costs something.",
    searchDelay: "How long the typing must pause before onSearchChange, in ms. 250 by default; 0 calls on every keystroke.",
    placeholder: "What can be searched. Without a Field around, it is also the field's accessible name.",
    disabled: "Disables the field. A Field around can disable it too.",
    icon: "The magnifying glass, decorative. magnifying-glass by default; another name, or false to remove it.",
    clearable: "The X that empties the field, shown while there is text. On by default.",
    onSubmit: "Called by the keyboard's search key.",
    style: "Added to the box's style.",
    testID: "Test id of the box; the field gets -campo and the X -limpar.",
  },
  examples: [
    {
      title: "Usage",
      description: "It filters what is already on the screen and gives back text — to pick one item from a catalogue, use Combobox.",
      code: `const [query, setQuery] = useState("");

<Field label="Search people">
  <SearchField value={query} onChangeText={setQuery} placeholder="Name" />
</Field>
{people.filter(p => p.includes(query)).map(p => <Text key={p}>{p}</Text>)}`,
      render: () => h("div", {style: largo}, h(Filtrar)),
    },
    cada({titulo: "Sizes", descricao: "The field step; the glyph shrinks with it.",
      valores: ["sm", "md", "lg"], estilo: coluna,
      codigo: v => `<Field label="Search (${v})">\n  <SearchField size="${v}" value={query} onChangeText={setQuery} />\n</Field>`,
      peca: v => h(Campo, {label: `Search (${v})`, size: v})}),
    {
      title: "Waiting for a pause",
      description: "onSearchChange runs once the typing stops for searchDelay ms, so a remote search is not fired on every key.",
      code: `<Field label="Search orders">
  <SearchField value={text} onChangeText={setText}
    onSearchChange={runSearch} searchDelay={400} placeholder="Order number" />
</Field>`,
      render: () => h("div", {style: largo}, h(Esperar)),
    },
    {
      title: "Without value",
      description: "The field keeps its own text when the screen does not hold it; type, and the X empties the field.",
      code: `<Field label="Quick search">
  <SearchField placeholder="Anything" onSearchChange={runSearch} />
</Field>`,
      render: () => h("div", {style: largo}, h(Field, {label: "Quick search"}, h(SearchField, {placeholder: "Anything"}))),
    },
    {
      title: "Glyph, X and disabled",
      description: "icon={false} removes the glass; clearable={false} removes the X; disabled stops the field.",
      code: `<Field label="Filter"><SearchField icon={false} value={text} onChangeText={setText} /></Field>
<Field label="Tag"><SearchField icon="funnel" clearable={false} value={text} onChangeText={setText} /></Field>
<Field label="Archive"><SearchField disabled value="2025" /></Field>`,
      render: () => h("div", {style: coluna},
        h(Campo, {label: "Filter", icon: false, defaultText: "invoices"}),
        h(Campo, {label: "Tag", icon: "funnel", clearable: false, defaultText: "urgent"}),
        h(Field, {label: "Archive"}, h(SearchField, {disabled: true, value: "2025"}))),
    },
  ],
};
