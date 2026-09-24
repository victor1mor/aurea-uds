import {createElement as h} from "react";
import {MultiCombobox} from "../../../packages/react/dist/index.js";

const stack = {display: "grid", gap: "var(--space-4)", width: "min(460px, 100%)"};
const tags = [
  {value: "a11y", label: "Accessibility"},
  {value: "perf", label: "Performance"},
  {value: "i18n", label: "Internationalization"},
];
const people = [
  {value: "messenger", label: "Messenger"},
  {value: "analyst", label: "Analyst"},
  {value: "curator", label: "Curator"},
];
const grouped = [
  {label: "Actions", items: [{value: "button", label: "Button"}]},
  {label: "Inputs", items: [{value: "input", label: "Input"}]},
];

export default {
  description:
    "MultiCombobox is the many-of-many Combobox: the picked options stay as chips inside the field, " +
    "and typing filters what is left. It takes flat options or groups, and it accepts a remote search " +
    "— you filter on your side, the component only shows and announces the result.",

  install: 'import {MultiCombobox} from "@aurea-uds/react";',

  features: [
    "Selected options live as removable chips in the field, each with its own remove control.",
    "Flat items or grouped items ({label, items}) for a long, sectioned list.",
    "onInputChange plus loading: the search can be remote and the wait is announced, not silent.",
    "Base UI keyboard: arrows, Enter, Escape, and Backspace removing the last chip.",
    "disabled reaches the chips too: no removing what you cannot add.",
    "The previews show the CLOSED field; the popup lives in a portal and only exists in a real app.",
  ],

  examples: [
    {
      title: "Facets",
      description: "The filter row of a collection: several values, all visible at once.",
      code: [
        "const [tags, setTags] = useState([]);",
        "",
        '<MultiCombobox label="Tags" placeholder="Add a tag…" value={tags}',
        "  onValueChange={setTags}",
        '  items={[{value: "a11y", label: "Accessibility"}, {value: "perf", label: "Performance"}]} />',
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(MultiCombobox, {label: "Tags", placeholder: "Add a tag…", items: tags,
          value: [tags[0]]})),
    },
    {
      title: "Remote search",
      description: "You own the query; the component shows the state of it.",
      code: [
        '<MultiCombobox label="People" loading={isFetching}',
        "  onInputChange={q => search(q)}",
        "  items={results} value={picked} onValueChange={setPicked} />",
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(MultiCombobox, {label: "People", placeholder: "Search…", items: people,
          onInputChange: () => {}})),
    },
    {
      title: "Grouped options",
      description: "Sections with headings, for a list long enough to need them.",
      code: [
        "const items = [",
        '  {label: "Actions", items: [{value: "button", label: "Button"}]},',
        '  {label: "Inputs", items: [{value: "input", label: "Input"}]},',
        "];",
        "",
        '<MultiCombobox label="Components" items={items} value={picked} onValueChange={setPicked} />',
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(MultiCombobox, {label: "Components", placeholder: "Add a component…", items: grouped})),
    },
    {
      title: "Disabled",
      description: "The chips stay readable, and nothing can be added or removed.",
      code: '<MultiCombobox label="Tags" items={tags} value={picked} disabled />',
      render: () => h("div", {style: stack},
        h(MultiCombobox, {label: "Tags", items: tags, value: [tags[0], tags[1]], disabled: true})),
    },
  ],
};
