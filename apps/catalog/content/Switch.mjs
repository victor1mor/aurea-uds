import {createElement as h} from "react";
import {Switch, Card} from "../../../packages/react/dist/index.js";

const stack = {display: "grid", gap: "var(--space-3)", width: "min(420px, 100%)"};

export default {
  description:
    "Switch applies now. Flip it and the setting is on — no Save button in between. That is the " +
    "whole difference from Checkbox, which changes a value the form will submit later. It carries " +
    "role=\"switch\", so the screen reader says \"on\" and \"off\" instead of \"checked\".",

  install: 'import {Switch} from "@aurea-uds/react";',

  features: [
    "role=\"switch\": announced as on/off, which is what an immediate setting is.",
    "The label is required and part of the target — the words toggle it too.",
    "Effect is immediate. If the change needs a Save button, the control is a Checkbox.",
    "Never use it for a destructive setting without confirmation: there is no submit step to think in.",
  ],

  examples: [
    {
      title: "Settings list",
      description: "The natural home: a column of switches that take effect as you flip them.",
      code: [
        '<Switch label="Email notifications" defaultChecked />',
        '<Switch label="Weekly digest" />',
        '<Switch label="Mentions only" />',
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(Switch, {label: "Email notifications", defaultChecked: true}),
        h(Switch, {label: "Weekly digest"}),
        h(Switch, {label: "Mentions only"})),
    },
    {
      title: "On a surface",
      description: "Inside a Card, with the section title above: the setting reads as part of that area.",
      code: [
        '<Card>',
        '  <strong>Notifications</strong>',
        '  <Switch label="Email" defaultChecked />',
        '  <Switch label="Push" />',
        '</Card>',
      ].join("\n"),
      render: () => h("div", {style: {width: "min(420px,100%)"}},
        h(Card, null, h("div", {style: stack},
          h("strong", null, "Notifications"),
          h(Switch, {label: "Email", defaultChecked: true}),
          h(Switch, {label: "Push"})))),
    },
    {
      title: "Disabled",
      description: "Locked by the plan or by permission — the state stays visible, the control does not.",
      code: [
        '<Switch label="Audit log" disabled />',
        '<Switch label="SSO" defaultChecked disabled />',
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(Switch, {label: "Audit log", disabled: true}),
        h(Switch, {label: "SSO", defaultChecked: true, disabled: true})),
    },
  ],
};
