import {createElement as h} from "react";
import {SearchField, Field, Select, Button} from "../../../packages/react/dist/index.js";

const row = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2)", width: "min(520px,100%)"};
const stack = {display: "grid", gap: "var(--space-4)", width: "min(460px, 100%)"};

export default {
  description:
    "SearchField is an Input that carries the search glyph inside the pill. The icon is decorative — " +
    "the accessible name still comes from the label, because a magnifier is not a word. Everything " +
    "else is the native input: type, value, events.",

  install: 'import {SearchField} from "@aurea-uds/react";',

  features: [
    "The glyph is inside the field and aria-hidden: decoration cannot be the accessible name.",
    "Native input underneath — value, onChange, onKeyDown and the rest behave as you expect.",
    "The icon is swappable (filter, catalog) for a field that filters rather than searches.",
    "For search that opens a list of results as you type, compose it with Combobox.",
    "Pair with a scope Select when the same query can run over different sets.",
  ],

  examples: [
    {
      title: "Sizes",
      description:
        "The glyph stays put and the text moves: at each step the value starts further from " +
        "the icon, so a small field never has its first letter under the magnifier.",
      code: [
        '<SearchField size="sm" />',
        '<SearchField />',
        '<SearchField size="lg" />',
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(SearchField, {size: "sm", "aria-label": "Small", placeholder: "Search"}),
        h(SearchField, {"aria-label": "Medium", placeholder: "Search"}),
        h(SearchField, {size: "lg", "aria-label": "Large", placeholder: "Search"})),
    },
    {
      title: "Plain search",
      description: "One field, one placeholder saying what is searchable.",
      code: '<Field label="Search"><SearchField placeholder="Search components…" /></Field>',
      render: () => h("div", {style: stack},
        h(Field, {label: "Search"}, h(SearchField, {placeholder: "Search components…"}))),
    },
    {
      title: "Filter row",
      description: "Search plus scope: the pair that heads most collections.",
      code: [
        '<SearchField placeholder="Filter rows…" />',
        '<Select aria-label="Category" defaultValue="all"><option value="all">All categories</option></Select>',
      ].join("\n"),
      render: () => h("div", {style: row},
        h("div", {style: {flex: 1, minWidth: "200px"}},
          h(SearchField, {placeholder: "Filter rows…"})),
        h(Select, {defaultValue: "all", "aria-label": "Category"}, h("option", {value: "all"}, "All categories"),
          h("option", {value: "actions"}, "Actions"))),
    },
    {
      title: "As a filter",
      description: "Same control, different glyph: what it does to the list is filter, not search.",
      code: '<SearchField icon="filter" placeholder="Filter by name…" />',
      render: () => h("div", {style: stack},
        h(SearchField, {icon: "filter", placeholder: "Filter by name…"})),
    },
    {
      title: "With an action",
      description: "When the query costs something to run, give it an explicit button as well as Enter.",
      code: [
        '<SearchField placeholder="Search the archive…" />',
        '<Button variant="primary">Search</Button>',
      ].join("\n"),
      render: () => h("div", {style: row},
        h("div", {style: {flex: 1, minWidth: "200px"}},
          h(SearchField, {placeholder: "Search the archive…"})),
        h(Button, {variant: "primary"}, "Search")),
    },
  ],
};
