import {createElement as h} from "react";
import {Select, Field} from "../../../packages/react/dist/index.js";

const stack = {display: "grid", gap: "var(--space-4)", width: "min(420px, 100%)"};

export default {
  description:
    "Select chooses a VALUE from a known list. A Menu executes an ACTION — that is the line between " +
    "them, and it decides which one you need. This is the native element: the list is the platform's, " +
    "which is why it works with a screen reader, on a phone, and with the keyboard you already know.",

  install: 'import {Select, Field} from "@aurea-uds/react";',

  features: [
    "Native <select>: the option list is the platform's own, on every device, with no JS to load.",
    "Choosing a value is Select; running a command is DropdownMenu. Never swap them for looks.",
    "<optgroup> works, so a long list can be sectioned without a custom widget.",
    "The chevron is drawn by the field and mirrors itself in RTL.",
    "When the user needs to type to find the option, that is Combobox — not a longer Select.",
  ],

  examples: [
    {
      title: "Sizes",
      description:
        "sm, md and lg — the same steps as Input and Button. The chevron keeps its distance " +
        "from the text at every step, which is why the end padding scales with the height.",
      code: [
        '<Select size="sm">…</Select>',
        '<Select>…</Select>',
        '<Select size="lg">…</Select>',
      ].join("\n"),
      render: () => {
        const opts = ["Draft", "In review", "Published"].map((o) => h("option", {key: o}, o));
        return h("div", {style: stack},
          h(Select, {size: "sm", "aria-label": "Small", defaultValue: "Draft"}, opts),
          h(Select, {"aria-label": "Medium", defaultValue: "Draft"}, opts),
          h(Select, {size: "lg", "aria-label": "Large", defaultValue: "Draft"}, opts));
      },
    },
    {
      title: "A plain choice",
      description: "Short list, one value. The Field names the question.",
      code: [
        '<Field label="Plan">',
        '  <Select defaultValue="pro">',
        '    <option value="free">Free</option>',
        '    <option value="pro">Pro</option>',
        '    <option value="scale">Scale</option>',
        '  </Select>',
        '</Field>',
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(Field, {label: "Plan"}, h(Select, {defaultValue: "pro"},
          h("option", {value: "free"}, "Free"), h("option", {value: "pro"}, "Pro"),
          h("option", {value: "scale"}, "Scale")))),
    },
    {
      title: "Grouped options",
      description: "optgroup sections a long list; the browser reads the group name before the options.",
      code: [
        '<Select defaultValue="fra">',
        '  <optgroup label="Europe"><option value="fra">Paris</option></optgroup>',
        '  <optgroup label="Americas"><option value="gru">São Paulo</option></optgroup>',
        '</Select>',
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(Field, {label: "Region"}, h(Select, {defaultValue: "fra"},
          h("optgroup", {label: "Europe"},
            h("option", {value: "fra"}, "Paris"), h("option", {value: "ams"}, "Amsterdam")),
          h("optgroup", {label: "Americas"},
            h("option", {value: "gru"}, "São Paulo"), h("option", {value: "iad"}, "Virginia"))))),
    },
    {
      title: "Disabled",
      description: "The whole field, or a single option that exists but cannot be picked yet.",
      code: [
        '<Select disabled defaultValue="pro">…</Select>',
        '<option value="lifetime" disabled>Lifetime (soon)</option>',
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(Field, {label: "Plan (locked)"}, h(Select, {disabled: true, defaultValue: "pro"},
          h("option", {value: "pro"}, "Pro"))),
        h(Field, {label: "Billing"}, h(Select, {defaultValue: "monthly"},
          h("option", {value: "monthly"}, "Monthly"), h("option", {value: "yearly"}, "Yearly"),
          h("option", {value: "lifetime", disabled: true}, "Lifetime (soon)")))),
    },
  ],
};
