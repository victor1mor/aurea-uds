import {createElement as h} from "react";
import {Card, TagGroup} from "../../../packages/react/dist/index.js";

const TEMAS = [
  {id: "news", label: "News"}, {id: "travel", label: "Travel"},
  {id: "gaming", label: "Gaming"}, {id: "shopping", label: "Shopping"},
];
const CODIGO_TEMAS = `const topics = [
  {id: "news", label: "News"}, {id: "travel", label: "Travel"},
  {id: "gaming", label: "Gaming"}, {id: "shopping", label: "Shopping"},
];`;
const coluna = {display: "grid", gap: "var(--space-4)"};
// Os três tamanhos, cada grupo com o nome próprio: o código e o desenho saem desta lista.
const TAMANHOS = [["sm", "Small tags"], ["md", "Medium tags"], ["lg", "Large tags"]];

export default {
  description:
    "TagGroup is a wrapping row of tags under one label. None, one or several can be selected, and " +
    "each can be removed. The group is one Tab stop; the arrows move between the tags.",

  install: 'import {TagGroup} from "@aurea-uds/react";',

  features: [
    "selectionMode none, single or multiple; the selected tag is in the light yellow wash.",
    "onRemove adds the X; Delete or Backspace remove the active tag, and the focus moves to the next.",
    "One Tab stop for the group; arrows, Home and End move between the tags.",
    "description and errorMessage under the tags, read with the group.",
    "Three sizes — 20, 24 and 32 high — and a variant for grey surfaces.",
  ],

  examples: [
    {
      title: "Selection",
      description: "Several can be selected.",
      code: [
        '<TagGroup label="Topics" selectionMode="multiple" defaultSelectedKeys={["travel"]}',
        '  items={[{id: "news", label: "News"}, {id: "travel", label: "Travel"},',
        '    {id: "gaming", label: "Gaming"}, {id: "shopping", label: "Shopping"}]} />',
      ].join("\n"),
      render: () => h(TagGroup, {label: "Topics", selectionMode: "multiple", defaultSelectedKeys: ["travel"], items: TEMAS}),
    },
    {
      title: "Removable",
      description: "The X removes; so does Delete on the active tag.",
      code: [
        '<TagGroup label="Filters" items={filters} onRemove={(ids) => setFilters(f => f.filter(x => !ids.includes(x.id)))}',
        '  description="Remove a filter to widen the search" />',
      ].join("\n"),
      render: () => h(TagGroup, {label: "Filters", items: TEMAS.slice(0, 3), onRemove: () => {},
        description: "Remove a filter to widen the search"}),
    },
    {
      title: "Single selection",
      description: "One at a time: picking a tag releases the one before. Picking the same tag again clears it.",
      code: `${CODIGO_TEMAS}

<TagGroup label="Section" selectionMode="single" defaultSelectedKeys={["news"]} items={topics} />`,
      render: () => h(TagGroup, {label: "Section", selectionMode: "single", defaultSelectedKeys: ["news"], items: TEMAS}),
    },
    {
      title: "Sizes",
      description: "20, 24 and 32 high — the reference library's tag. md is the default.",
      code: `${CODIGO_TEMAS}

${TAMANHOS.map(([size, label]) => `<TagGroup label="${label}" size="${size}" items={topics} />`).join("\n")}`,
      render: () => h("div", {style: coluna},
        ...TAMANHOS.map(([size, label]) => h(TagGroup, {key: size, label, size, items: TEMAS}))),
    },
    {
      title: "On a grey surface",
      description: "On a grey surface the neutral tag disappears into it. variant=\"surface\" fills the tags with "
        + "the card colour instead.",
      code: `${CODIGO_TEMAS}

<Card variant="inset">
  <TagGroup label="Saved topics" variant="surface" items={topics} />
</Card>`,
      render: () => h(Card, {variant: "inset", style: {width: "100%", maxWidth: "26rem"}},
        h(TagGroup, {label: "Saved topics", variant: "surface", items: TEMAS})),
    },
  ],
};
