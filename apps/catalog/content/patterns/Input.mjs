import {createElement as h} from "react";
import {Input, Field, Button, Card, Switch, Checkbox, Select, InputGroup, InputGroupAddon, Textarea} from "../../../../packages/react/dist/index.js";

const stack = {display: "grid", gap: "var(--space-4)", width: "min(420px, 100%)"};
const row = {display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2)"};

export default [
  {
    variant: "Text",
    name: "Email and password",
    description: "The sign-in pair, with the autoComplete tokens the browser actually looks for.",
    uses: ["Field", "Input", "Button"],
    code: [
      '<Field label="Email"><Input type="email" autoComplete="email" /></Field>',
      '<Field label="Password"><Input type="password" autoComplete="current-password" /></Field>',
      '<Button variant="primary" type="submit" fullWidth>Sign in</Button>',
    ].join("\n"),
    render: () => h("div", {style: stack},
      h(Field, {label: "Email"}, h(Input, {type: "email", placeholder: "you@example.com"})),
      h(Field, {label: "Password"}, h(Input, {type: "password", placeholder: "••••••••"})),
      h(Button, {variant: "primary", fullWidth: true}, "Sign in")),
  },
  {
    variant: "Number",
    name: "Quantity with bounds",
    description: "A number the browser keeps inside its range, with the limit written next to it.",
    uses: ["Field", "Input"],
    code: '<Field label="Seats" hint="1 to 99"><Input type="number" min={1} max={99} defaultValue={12} /></Field>',
    render: () => h("div", {style: stack},
      h(Field, {label: "Seats", hint: "1 to 99"},
        h(Input, {type: "number", min: 1, max: 99, defaultValue: 12}))),
  },
  {
    variant: "Date",
    name: "Native date range",
    description: "For one plain date the native picker still wins: every locale and every "
      + "screen reader for free, and it is the one people already know. Reach for Calendar "
      + "when you need a visible grid, a range, or days closed.",
    uses: ["Field", "Input"],
    code: [
      '<Field label="From"><Input type="date" /></Field>',
      '<Field label="To"><Input type="date" /></Field>',
    ].join("\n"),
    render: () => h("div", {style: {...row, width: "min(420px,100%)"}},
      h("div", {style: {flex: 1}}, h(Field, {label: "From"}, h(Input, {type: "date", defaultValue: "2026-07-01"}))),
      h("div", {style: {flex: 1}}, h(Field, {label: "To"}, h(Input, {type: "date", defaultValue: "2026-07-24"})))),
  },
  {
    variant: "Read-only",
    name: "Generated identifier",
    description: "A value to copy, not to edit: read-only is still reachable by the keyboard, unlike disabled.",
    uses: ["Field", "Input"],
    code: '<Field label="Workspace id" hint="Copyable, not editable"><Input defaultValue="acme-42" readOnly /></Field>',
    render: () => h("div", {style: stack},
      h(Field, {label: "Workspace id", hint: "Copyable, not editable"},
        h(Input, {defaultValue: "acme-42", readOnly: true}))),
  },
  {
    variant: "Composed",
    name: "Account settings card",
    description: "A short form on a surface: text, a choice, two toggles and one primary action.",
    uses: ["Card", "Field", "Input", "Select", "Switch", "Checkbox", "Button"],
    code: [
      "<Card>",
      '  <Field label="Display name"><Input defaultValue="Curator" /></Field>',
      '  <Field label="Language"><Select defaultValue="en">…</Select></Field>',
      '  <Switch label="Email notifications" defaultChecked />',
      '  <Checkbox label="Public profile" />',
      '  <Button variant="primary">Save changes</Button>',
      "</Card>",
    ].join("\n"),
    render: () => h("div", {style: {width: "min(460px,100%)"}},
      h(Card, null, h("div", {style: stack},
        h(Field, {label: "Display name"}, h(Input, {defaultValue: "Curator"})),
        h(Field, {label: "Language"}, h(Select, {defaultValue: "en"},
          h("option", {value: "en"}, "English"), h("option", {value: "pt"}, "Português"))),
        h(Switch, {label: "Email notifications", defaultChecked: true}),
        h(Checkbox, {label: "Public profile"}),
        h("div", {style: {...row, justifyContent: "flex-end"}},
          h(Button, {variant: "primary"}, "Save changes"))))),
  },
  // ── G-AXIS-01: eixos que existiam na referência e faltavam aqui ─────────
  {
    variant: "Layout",
    name: "Settings row",
    description: "Label on the left, control on the right — the line every settings screen is made of. Until August 2026 this only came out of Aurea with ad-hoc CSS. It is a grid and not a row for one reason: in a row the error message would become a third column beside the control, and the error is about the value, so it belongs under it.",
    uses: ["Field", "Select"],
    code: '<Field label="Time zone" hint="used in reports" orientation="horizontal" error="Unknown zone">\n  <Select aria-label="Time zone">…</Select>\n</Field>',
    render: () => h(Field, {label: "Time zone", hint: "used in reports", orientation: "horizontal",
      error: "Unknown zone"}, h(Select, {"aria-label": "Time zone"}, h("option", null, "America/Sao_Paulo"))),
  },
  {
    variant: "Layout",
    name: "Composer with a toolbar below",
    description: "One box, text on top and controls underneath. The addon takes a whole line instead of sitting beside the field, and the frame drops the pill radius for the panel radius — a group with a block addon is no longer a line, it is a surface. Measured: at 999px on a tall box the sides become half-circles and the field text collides with the curve.",
    uses: ["InputGroup", "Textarea", "Button"],
    code: '<InputGroup>\n  <Textarea rows={2} placeholder="Ask anything…" aria-label="Prompt" />\n  <InputGroupAddon side="end" layout="block">\n    <Button variant="ghost" size="sm">Attach</Button>\n    <Button variant="primary" size="sm">Send</Button>\n  </InputGroupAddon>\n</InputGroup>',
    render: () => h("div", {style: {width: "min(420px,100%)"}},
      h(InputGroup, null,
        h(Textarea, {rows: 2, placeholder: "Ask anything…", "aria-label": "Prompt"}),
        h(InputGroupAddon, {side: "end", layout: "block"},
          h(Button, {variant: "ghost", size: "sm"}, "Attach"),
          h(Button, {variant: "primary", size: "sm"}, "Send")))),
  },
];
