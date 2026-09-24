import {createElement as h} from "react";
import {Radio, Field} from "../../../packages/react/dist/index.js";

const stack = {display: "grid", gap: "var(--space-2)", width: "min(420px, 100%)"};

export default {
  description:
    "Radio is one-of-many: the options share a name, and choosing one releases the other. What " +
    "groups them is the name attribute — without it every radio is its own group and two can be " +
    "on at once, which is the most common bug with this control.",

  install: 'import {Radio} from "@aurea-uds/react";',

  features: [
    "The shared name is what makes a group. Same name, one choice; different names, no group at all.",
    "The label is inside the <label>, so the words are part of the target.",
    "Native keyboard: the arrows move within the set and Tab leaves it — the browser's own behaviour.",
    "One of the options should start selected; a group with nothing chosen has no default to submit.",
    "For two options that apply immediately, consider SegmentedControl or Switch instead.",
  ],

  examples: [
    {
      title: "A choice",
      description: "Three options, one name, one selected from the start.",
      code: [
        '<Radio name="billing" label="Monthly" defaultChecked />',
        '<Radio name="billing" label="Yearly" />',
        '<Radio name="billing" label="Lifetime" />',
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(Radio, {name: "billing", label: "Monthly", defaultChecked: true}),
        h(Radio, {name: "billing", label: "Yearly"}),
        h(Radio, {name: "billing", label: "Lifetime"})),
    },
    {
      title: "With a disabled option",
      description: "The unavailable choice keeps its place, so the list never reorders under the arrows.",
      code: [
        '<Radio name="region" label="Europe" defaultChecked />',
        '<Radio name="region" label="South America" disabled />',
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(Radio, {name: "region", label: "Europe", defaultChecked: true}),
        h(Radio, {name: "region", label: "United States"}),
        h(Radio, {name: "region", label: "South America (soon)", disabled: true})),
    },
    {
      title: "Inside a Field",
      description: "The Field names the question; each Radio names an answer.",
      code: [
        '<Field label="Visibility" hint="Who can open this workspace">',
        '  <div className="stack">…radios…</div>',
        '</Field>',
      ].join("\n"),
      render: () => h("div", {style: {width: "min(420px,100%)"}},
        h(Field, {label: "Visibility", hint: "Who can open this workspace"},
          h("div", {style: {...stack, marginTop: "var(--space-2)"}},
            h(Radio, {name: "vis", label: "Private", defaultChecked: true}),
            h(Radio, {name: "vis", label: "Members only"}),
            h(Radio, {name: "vis", label: "Anyone with the link"})))),
    },
  ],
};
