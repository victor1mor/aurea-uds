// O TagGroup do nativo no site (bloco 1, o 5-A — 23/10/2026). Todo valor das props do tipo em exemplo. A escolha e o X
// funcionam ao toque: cada exemplo que muda guarda o próprio estado.
import {createElement as h, useState} from "react";
import {Card, TagGroup} from "../../../../packages/native/dist/index.js";
import {cada} from "../_eixos.mjs";

const ASSUNTOS = [
  {id: "design", label: "Design"},
  {id: "code", label: "Code"},
  {id: "research", label: "Research"},
  {id: "writing", label: "Writing"},
];
const largo = {width: "min(28rem, 100%)"};
const coluna = {display: "grid", gap: "var(--space-5)", width: "min(28rem, 100%)"};

function Tirar() {
  const [items, setItems] = useState(ASSUNTOS);
  return h(TagGroup, {label: "Topics", items, onRemove: (ids) => setItems((atual) => atual.filter((i) => !ids.includes(i.id))),
    description: items.length ? "Tap the X to remove a topic." : "No topics left."});
}
function Controlado() {
  const [escolhidos, setEscolhidos] = useState(["design", "research"]);
  return h(TagGroup, {label: "Interests", selectionMode: "multiple", items: ASSUNTOS,
    selectedKeys: escolhidos, onSelectionChange: setEscolhidos,
    description: escolhidos.length ? `Chosen: ${escolhidos.join(", ")}` : "Nothing chosen"});
}

export default {
  install: 'import {TagGroup} from "@aurea-uds/native";',
  api: {
    selectionMode: "none: a list of text. single and multiple: each tag is a button with the selected state, and the chosen one takes the light yellow wash.",
    size: "sm, md or lg: 20, 28 and 36 high.",
    description: "Help under the tags, in muted text.",
    errorMessage: "The error under the tags, in the danger tone.",
    selectedKeys: "Controlled: the ids of the chosen tags.",
    defaultSelectedKeys: "Uncontrolled: the ids chosen at first; the group keeps the choice from there.",
    onRemove: "With it each tag gets the X, beside the tag and not inside it (a button inside a button vanishes for VoiceOver). Called with the tag's id.",
    icons: "A local icon registry — the X and the tags' glyphs — when there is none in context.",
    style: "Style of the whole group.",
    testID: "Test id of the group; each tag gets -<id>.",
  },
  examples: [
    {
      title: "Usage",
      code: `<TagGroup label="Topics" items={[
  {id: "design", label: "Design"},
  {id: "code", label: "Code"},
  {id: "research", label: "Research"},
  {id: "writing", label: "Writing"},
]} />`,
      render: () => h("div", {style: largo}, h(TagGroup, {label: "Topics", items: ASSUNTOS})),
    },
    cada({titulo: "Selection", descricao: "none is a plain list; single and multiple make each tag a toggle, and the chosen one takes the light yellow wash.",
      valores: ["none", "single", "multiple"], estilo: coluna,
      codigo: v => `<TagGroup label="selectionMode ${v}" selectionMode="${v}" items={topics}${v === "none" ? "" : ` defaultSelectedKeys={["code"]}`} />`,
      peca: v => h(TagGroup, {label: `selectionMode ${v}`, selectionMode: v, items: ASSUNTOS,
        ...(v === "none" ? {} : {defaultSelectedKeys: ["code"]})})}),
    cada({titulo: "Sizes", descricao: "20, 28 and 36 high: the reference's padding (2, 4, 6) around a line of 16, 20 and 24.",
      valores: ["sm", "md", "lg"], estilo: coluna,
      codigo: v => `<TagGroup label="size ${v}" size="${v}" items={topics} />`,
      peca: v => h(TagGroup, {label: `size ${v}`, size: v, items: ASSUNTOS})}),
    cada({titulo: "Variants", descricao: "default is the neutral fill; surface is the card's fill, for tags on a grey area.",
      valores: ["default", "surface"], estilo: coluna,
      codigo: v => `<Card variant="inset">\n  <TagGroup label="variant ${v}" variant="${v}" items={topics} />\n</Card>`,
      peca: v => h(Card, {variant: "inset"}, h(TagGroup, {label: `variant ${v}`, variant: v, items: ASSUNTOS}))}),
    {
      title: "Controlled",
      description: "selectedKeys comes from the screen, and onSelectionChange gives the new list.",
      code: `const [chosen, setChosen] = useState(["design", "research"]);

<TagGroup label="Interests" selectionMode="multiple" items={topics}
  selectedKeys={chosen} onSelectionChange={setChosen} />`,
      render: () => h("div", {style: largo}, h(Controlado)),
    },
    {
      title: "Removing",
      description: "onRemove gives each tag its X; the screen takes the tag out of items.",
      code: `const [items, setItems] = useState(topics);

<TagGroup label="Topics" items={items}
  onRemove={(ids) => setItems(items.filter(i => !ids.includes(i.id)))} />`,
      render: () => h("div", {style: largo}, h(Tirar)),
    },
    {
      title: "Glyphs, help and errors",
      description: "A tag can carry a glyph or be disabled; description and errorMessage go under the tags; labelHidden keeps the name for the screen reader only.",
      code: `<TagGroup label="Filters" selectionMode="multiple" items={[
  {id: "starred", label: "Starred", icon: "star"},
  {id: "mine", label: "Mine", icon: "user"},
  {id: "archived", label: "Archived", disabled: true},
]} description="Pick any." errorMessage="Pick at least one filter." />
<TagGroup label="Status" labelHidden items={statuses} />`,
      render: () => h("div", {style: coluna},
        h(TagGroup, {label: "Filters", selectionMode: "multiple", items: [
          {id: "starred", label: "Starred", icon: "star"}, {id: "mine", label: "Mine", icon: "user"},
          {id: "archived", label: "Archived", disabled: true}],
          description: "Pick any.", errorMessage: "Pick at least one filter."}),
        h(TagGroup, {label: "Status", labelHidden: true, items: [
          {id: "open", label: "Open"}, {id: "closed", label: "Closed"}]})),
    },
  ],
};
