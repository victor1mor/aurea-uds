import {createElement as h} from "react";
import {Switch, Checkbox, Card, Badge, Status, Radio} from "../../../../packages/react/dist/index.js";

const stack = {display: "grid", gap: "var(--space-3)", width: "min(440px, 100%)"};
const between = {display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)"};

export default [
  {
    variant: "Immediate",
    name: "Notification settings",
    description: "Flip and it is done. No Save button — that is what makes it a Switch and not a Checkbox.",
    uses: ["Card", "Switch"],
    code: [
      "<Card>",
      "  <strong>Notifications</strong>",
      '  <Switch label="Email" defaultChecked />',
      '  <Switch label="Push" />',
      '  <Switch label="Weekly digest" defaultChecked />',
      "</Card>",
    ].join("\n"),
    render: () => h("div", {style: {width: "min(440px,100%)"}},
      h(Card, null, h("div", {style: stack},
        h("strong", null, "Notifications"),
        h(Switch, {label: "Email", defaultChecked: true}),
        h(Switch, {label: "Push"}),
        h(Switch, {label: "Weekly digest", defaultChecked: true})))),
  },
  {
    variant: "Immediate",
    name: "Feature with state",
    description: "The switch sets it; a Status reports what the system did with it.",
    uses: ["Card", "Switch", "Status"],
    code: [
      '<div className="cluster" style={{justifyContent: "space-between"}}>',
      '  <Switch label="Public API" defaultChecked />',
      '  <Status variant="online">live</Status>',
      "</div>",
    ].join("\n"),
    render: () => h("div", {style: {width: "min(440px,100%)"}},
      h(Card, null, h("div", {style: stack},
        h("div", {style: between}, h(Switch, {label: "Public API", defaultChecked: true}),
          h(Status, {variant: "online"}, "live")),
        h("div", {style: between}, h(Switch, {label: "Webhooks"}),
          h(Status, {variant: "offline"}, "off"))))),
  },
  {
    variant: "Locked",
    name: "Gated by plan",
    description: "Visible so the value is known, disabled so it cannot be flipped — with the reason next to it.",
    uses: ["Switch", "Badge"],
    code: [
      '<div className="cluster" style={{justifyContent: "space-between"}}>',
      '  <Switch label="Audit log" disabled />',
      '  <Badge variant="primary">Scale</Badge>',
      "</div>",
    ].join("\n"),
    render: () => h("div", {style: stack},
      h("div", {style: between}, h(Switch, {label: "Audit log", disabled: true}),
        h(Badge, {variant: "primary"}, "Scale")),
      h("div", {style: between}, h(Switch, {label: "SSO", defaultChecked: true, disabled: true}),
        h(Badge, {variant: "primary"}, "Scale"))),
  },
  {
    variant: "Not a Switch",
    name: "When it waits, it is a Checkbox",
    description: "Same yes-or-no, different moment: this one only takes effect when the form is submitted.",
    uses: ["Checkbox"],
    code: '<Checkbox label="Public workspace" description="Anyone with the link can read it." />',
    render: () => h("div", {style: stack},
      h(Checkbox, {label: "Public workspace", description: "Anyone with the link can read it."})),
  },
];
