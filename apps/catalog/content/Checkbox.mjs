import {createElement as h} from "react";
import {Checkbox} from "../../../packages/react/dist/index.js";

const stack = {display: "grid", gap: "var(--space-3)", width: "min(460px, 100%)"};

export default {
  description:
    "Checkbox is a yes-or-no that waits: it changes a value the form will submit later. A Switch " +
    "applies immediately — that is the whole difference, and it decides which one you want. The " +
    "label is required and lives inside the <label>, so the entire row is the target, not a 16px box.",

  install: 'import {Checkbox} from "@aurea-uds/react";',

  features: [
    "The label is part of the target: clicking the words toggles it, which matters on a phone.",
    "description adds a second line for the consequence, without inflating the label.",
    "labelHidden keeps the name for the screen reader and takes it off screen — for a selection column.",
    "indeterminate is supported by the native input for a partially selected group.",
    "Checkbox waits for submit; Switch applies now. Pick by the moment of effect, not by the look.",
  ],

  examples: [
    {
      title: "With description",
      description: "The label says what it is; the description says what happens if you tick it.",
      code: [
        '<Checkbox label="Public workspace"',
        '  description="Anyone with the link can read it." />',
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(Checkbox, {label: "Public workspace", description: "Anyone with the link can read it."})),
    },
    {
      title: "A list of options",
      description: "Many-of-many. Each one is independent — for one-of-many use Radio.",
      code: [
        '<Checkbox label="Email" defaultChecked />',
        '<Checkbox label="Push" />',
        '<Checkbox label="Weekly digest" defaultChecked />',
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(Checkbox, {label: "Email", defaultChecked: true}),
        h(Checkbox, {label: "Push"}),
        h(Checkbox, {label: "Weekly digest", defaultChecked: true})),
    },
    {
      title: "Hidden label",
      description: "A table selection column: the per-row name stays for the reader, off screen, so the column stays narrow.",
      code: '<Checkbox label="Select Analyst" labelHidden />',
      render: () => h("div", {style: {display: "flex", gap: "var(--space-3)"}},
        h(Checkbox, {label: "Select row one", labelHidden: true, defaultChecked: true}),
        h(Checkbox, {label: "Select row two", labelHidden: true}),
        h(Checkbox, {label: "Select row three", labelHidden: true})),
    },
    {
      title: "Disabled",
      description: "Unavailable but still readable — the reason belongs somewhere on the screen.",
      code: [
        '<Checkbox label="Audit log" disabled />',
        '<Checkbox label="SSO" defaultChecked disabled />',
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(Checkbox, {label: "Audit log", description: "Available on the Scale plan.", disabled: true}),
        h(Checkbox, {label: "SSO", defaultChecked: true, disabled: true})),
    },
  ],
};
