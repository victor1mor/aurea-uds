import {createElement as h} from "react";
import {Combobox, Field} from "../../../packages/react/dist/index.js";

const stack = {display: "grid", gap: "var(--space-4)", width: "min(420px, 100%)"};
const components = [
  {value: "button", label: "Button"},
  {value: "badge", label: "Badge"},
  {value: "combobox", label: "Combobox"},
];
const people = [
  {value: "messenger", label: "Messenger"},
  {value: "analyst", label: "Analyst"},
  {value: "curator", label: "Curator"},
];

export default {
  description:
    "Combobox is a Select you can type into: the list filters as you write, and the value is still " +
    "one option out of the set. It runs on Base UI, so the keyboard contract — arrows, Enter, Escape, " +
    "type-ahead — is the APG one and not our improvisation. If the user never needs to type, a Select " +
    "is lighter and works everywhere.",

  install: 'import {Combobox} from "@aurea-uds/react";',

  features: [
    "Base UI underneath: arrows move, Enter picks, Escape closes, and focus returns where it came from.",
    "Options are DATA ({value, label}) — no children to keep in sync with the filter.",
    "Typing filters the list; the value is still one option, never free text.",
    "An empty result says so in words, from the i18n dictionary.",
    "disabled goes on the whole control: field and both buttons, never one without the other.",
    "The previews show the CLOSED field; the popup lives in a portal and only exists in a real app.",
  ],

  examples: [
    {
      title: "Sizes",
      description:
        "The two buttons on the right grow with the field — at lg they step up, and the room " +
        "reserved for them steps up with them. Otherwise they float in the middle of the height.",
      code: [
        '<Combobox size="sm" items={items} />',
        '<Combobox items={items} />',
        '<Combobox size="lg" items={items} />',
      ].join("\n"),
      render: null,
    },
    {
      title: "Single choice",
      description: "One option out of many, with the list filtering as you type.",
      code: [
        "const [value, setValue] = useState(null);",
        "",
        '<Combobox label="Component" placeholder="Search…" value={value}',
        "  onValueChange={setValue}",
        '  items={[{value: "button", label: "Button"}, {value: "badge", label: "Badge"}]} />',
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(Combobox, {label: "Component", placeholder: "Search…", items: components})),
    },
    {
      title: "Inside a Field",
      description: "The Field names the question; the Combobox holds the answer.",
      // O Combobox aqui NÃO leva `label`: quem nomeia é o Field, e o próprio Field desiste do
      // <label for> quando o filho já se nomeia (`nomeProprio`, inputs.tsx). Com os dois, o texto
      // saía duas vezes na tela — o snippet dizia isso e ninguém via, porque não havia preview.
      code: [
        '<Field label="Assignee" hint="Who picks this up">',
        "  <Combobox items={people} value={who} onValueChange={setWho} />",
        "</Field>",
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(Field, {label: "Assignee", hint: "Who picks this up"},
          h(Combobox, {items: people, placeholder: "Search…"}))),
    },
    {
      title: "Disabled",
      description: "The field and both buttons go down together — a locked field that still opens is not locked.",
      code: '<Combobox label="Component" placeholder="Search…" items={items} disabled />',
      render: () => h("div", {style: stack},
        h(Combobox, {label: "Component", placeholder: "Search…", items: components, disabled: true})),
    },
  ],
};
