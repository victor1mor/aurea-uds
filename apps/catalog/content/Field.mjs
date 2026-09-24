import {createElement as h} from "react";
import {Field, Input, Select, Textarea, Switch, Range} from "../../../packages/react/dist/index.js";

const stack = {display: "grid", gap: "var(--space-4)", width: "min(420px, 100%)"};

export default {
  description:
    "Field is the label, the help text and the error of a control, bound together. It gives one " +
    "unnamed control a real <label for> and a matching id, so clicking the label focuses it and " +
    "the screen reader gets a precise name. Field organises; Input " +
    "is the control. That distinction is why they are two components.",

  install: 'import {Field, Input} from "@aurea-uds/react";',

  features: [
    "One unnamed native control or documented Aurea control gets a real <label for> and a matching id; arbitrary wrappers become groups.",
    "hint and error are descriptions via aria-describedby; they never become the accessible name.",
    "error also marks the focal control invalid — a red border alone tells a colour-blind user nothing.",
    "A child with its own accessible name (label or ARIA), or several children, makes Field a named group instead of adding a second label.",
    "The label is required by the type. A field with no label is not a field, it is a box.",
  ],

  examples: [
    {
      title: "With hint",
      description: "Label, control and help in one block. The hint explains, it does not repeat the label.",
      code: [
        '<Field label="Email" hint="We never share it.">',
        '  <Input type="email" placeholder="you@example.com" />',
        '</Field>',
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(Field, {label: "Email", hint: "We never share it."},
          h(Input, {type: "email", placeholder: "you@example.com"}))),
    },
    {
      title: "With error",
      description: "The error joins the hint in the accessible description and marks the control invalid. Never colour alone.",
      code: [
        '<Field label="Workspace slug" error="Already taken.">',
        '  <Input defaultValue="aurea" />',
        '</Field>',
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(Field, {label: "Workspace slug", error: "Already taken."}, h(Input, {defaultValue: "aurea"}))),
    },
    {
      title: "Any control",
      description: "A single unnamed control gets a real label; a control with its own accessible name stays named by itself inside the Field group.",
      code: [
        '<Field label="Region"><Select>…</Select></Field>',
        '<Field label="Notes"><Textarea rows={3} /></Field>',
        '<Field label="Volume"><Range defaultValue={60} /></Field>',
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(Field, {label: "Region"}, h(Select, {defaultValue: "eu"},
          h("option", {value: "eu"}, "Europe"), h("option", {value: "us"}, "United States"))),
        h(Field, {label: "Notes"}, h(Textarea, {rows: 3, defaultValue: "Internal tooling."})),
        h(Field, {label: "Volume"}, h(Range, {defaultValue: 60}))),
    },
    {
      title: "Required and disabled",
      description: "State belongs to the control, not to the wrapper: Field only shows what the control already is.",
      code: [
        '<Field label="Name" hint="Required"><Input required /></Field>',
        '<Field label="Plan"><Input defaultValue="Pro" disabled /></Field>',
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(Field, {label: "Name", hint: "Required"}, h(Input, {required: true, placeholder: "Your name"})),
        h(Field, {label: "Plan"}, h(Input, {defaultValue: "Pro", disabled: true}))),
    },
  ],
};
