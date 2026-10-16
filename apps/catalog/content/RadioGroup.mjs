import {createElement as h} from "react";
import {RadioGroup, Radio} from "../../../packages/react/dist/index.js";

// Os exemplos são os da documentação da referência (15/10/2026): básico com descrições, na horizontal, desligado e com
// erro. As opções são o `Radio` de sempre — `RadioGroup.Item` é ele, como no nativo.
export default {
  description:
    "RadioGroup is a set of radio options under one label, with a description and an error. It keeps the chosen " +
    "value: each option says its own value, and the group hands it the checked state, the shared name and the change. " +
    "The options are native radios, so Tab enters on the chosen one and the arrows move and choose.",

  install: 'import {RadioGroup, Radio} from "@aurea-uds/react";',

  features: [
    "role=\"radiogroup\" named by the label; the description and the error are read with it.",
    "value / defaultValue / onValueChange, the same names as the native RadioGroup.",
    "orientation: vertical (16 before each option) or horizontal (16 between them), as the reference.",
    "Each option can carry a description; with an error, every option is marked invalid.",
  ],

  examples: [
    {
      title: "Basic",
      description: "A label, a description and the options, each with its own description.",
      code: [
        '<RadioGroup label="Plan" description="You can change it later" name="plan" defaultValue="pro">',
        '  <Radio value="basic" label="Basic" description="For one person" />',
        '  <Radio value="pro" label="Pro" description="For a small team" />',
        '  <Radio value="business" label="Business" description="For the whole company" />',
        '</RadioGroup>',
      ].join("\n"),
      render: () => h(RadioGroup, {label: "Plan", description: "You can change it later", name: "plan", defaultValue: "pro"},
        h(Radio, {value: "basic", label: "Basic", description: "For one person"}),
        h(Radio, {value: "pro", label: "Pro", description: "For a small team"}),
        h(Radio, {value: "business", label: "Business", description: "For the whole company"})),
    },
    {
      title: "Horizontal",
      description: "The options in a row, 16 apart.",
      code: [
        '<RadioGroup label="Size" orientation="horizontal" defaultValue="m">',
        '  <Radio value="s" label="Small" />',
        '  <Radio value="m" label="Medium" />',
        '  <Radio value="l" label="Large" />',
        '</RadioGroup>',
      ].join("\n"),
      render: () => h(RadioGroup, {label: "Size", orientation: "horizontal", defaultValue: "m"},
        h(Radio, {value: "s", label: "Small"}), h(Radio, {value: "m", label: "Medium"}), h(Radio, {value: "l", label: "Large"})),
    },
    {
      title: "Disabled",
      description: "No option can be chosen.",
      code: [
        '<RadioGroup label="Delivery" disabled defaultValue="standard">',
        '  <Radio value="standard" label="Standard" />',
        '  <Radio value="express" label="Express" />',
        '</RadioGroup>',
      ].join("\n"),
      render: () => h(RadioGroup, {label: "Delivery", disabled: true, defaultValue: "standard"},
        h(Radio, {value: "standard", label: "Standard"}), h(Radio, {value: "express", label: "Express"})),
    },
    {
      title: "With an error",
      description: "The error closes the group, and every option is marked invalid.",
      code: [
        '<RadioGroup label="Payment" required error="Choose how to pay">',
        '  <Radio value="card" label="Card" />',
        '  <Radio value="pix" label="Pix" />',
        '</RadioGroup>',
      ].join("\n"),
      render: () => h(RadioGroup, {label: "Payment", required: true, error: "Choose how to pay"},
        h(Radio, {value: "card", label: "Card"}), h(Radio, {value: "pix", label: "Pix"})),
    },
  ],
};
