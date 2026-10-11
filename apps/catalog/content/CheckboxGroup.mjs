import {createElement as h} from "react";
import {CheckboxGroup, Checkbox} from "../../../packages/react/dist/index.js";

export default {
  description:
    "CheckboxGroup is a set of checkboxes under one label, with a description and an error. It keeps " +
    "the list of what is checked: each Checkbox inside says its own value, and the group hands it the " +
    "checked state and the change.",

  install: 'import {CheckboxGroup, Checkbox} from "@aurea-uds/react";',

  features: [
    "role=\"group\" named by the label; the description and the error are read with it.",
    "value / defaultValue / onValueChange work on the list of checked values.",
    "name and disabled reach every checkbox; with an error, each one is marked invalid.",
    "Each checkbox keeps its own description, aligned with its text.",
  ],

  examples: [
    {
      title: "Basic",
      description: "A label, a description and the checkboxes.",
      code: [
        '<CheckboxGroup label="Your interests" description="Choose all that apply" name="interests">',
        '  <Checkbox label="Coding" value="coding" description="Building software" />',
        '  <Checkbox label="Design" value="design" description="Creating interfaces" />',
        '  <Checkbox label="Writing" value="writing" description="Content creation" />',
        '</CheckboxGroup>',
      ].join("\n"),
      render: () => h(CheckboxGroup, {label: "Your interests", description: "Choose all that apply", name: "interests", defaultValue: ["design"]},
        h(Checkbox, {label: "Coding", value: "coding", description: "Building software"}),
        h(Checkbox, {label: "Design", value: "design", description: "Creating interfaces"}),
        h(Checkbox, {label: "Writing", value: "writing", description: "Content creation"})),
    },
    {
      title: "With an error",
      description: "The error closes the group, and every checkbox is marked invalid.",
      code: [
        '<CheckboxGroup label="Notifications" required error="Pick at least one channel">',
        '  <Checkbox label="E-mail" value="email" />',
        '  <Checkbox label="SMS" value="sms" />',
        '</CheckboxGroup>',
      ].join("\n"),
      render: () => h(CheckboxGroup, {label: "Notifications", required: true, error: "Pick at least one channel"},
        h(Checkbox, {label: "E-mail", value: "email"}),
        h(Checkbox, {label: "SMS", value: "sms"})),
    },
  ],
};
