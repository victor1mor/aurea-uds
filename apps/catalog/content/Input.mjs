import {createElement as h} from "react";
import {Input, Field} from "../../../packages/react/dist/index.js";

const stack = {display: "grid", gap: "var(--space-4)", width: "min(420px, 100%)"};

export default {
  description:
    "Input is the control and nothing else: one line of value, in a pill. It adds no state, and " +
    "every native attribute passes through — type, required, pattern, autoComplete and " +
    "inputMode behave exactly as the platform behaves. One exception, and it is deliberate: " +
    "`size` is the system step (sm/md/lg), not the HTML character count. Width is CSS. " +
    "The label, the hint and the error belong to Field.",

  install: 'import {Input} from "@aurea-uds/react";',

  features: [
    "Native attributes pass through: type, required, pattern, min, max, step, autoComplete, inputMode.",
    "`size` is ours, not the HTML attribute: sm, md, lg — the same steps as Button.",
    "type=\"date\", \"time\", \"color\" and \"file\" use the browser's own widget — themed by tokens, not rebuilt.",
    "No internal state: controlled or uncontrolled is your call, as in plain React.",
    "The focus ring is the system's, and it never relies on colour alone.",
    "Pair with Field for the label; alone it is a control with no name, which is a bug.",
  ],

  examples: [
    {
      title: "Sizes",
      description:
        "Three steps, and they are the SAME steps as the button: a sm field and a sm button on " +
        "one row measure the same, in all three densities. md is the default and needs no prop.",
      code: [
        '<Input size="sm" placeholder="Small" />',
        '<Input placeholder="Medium (default)" />',
        '<Input size="lg" placeholder="Large" />',
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(Input, {size: "sm", placeholder: "Small", "aria-label": "Small"}),
        h(Input, {placeholder: "Medium (default)", "aria-label": "Medium"}),
        h(Input, {size: "lg", placeholder: "Large", "aria-label": "Large"})),
    },
    {
      title: "Text",
      description: "The plain case. The placeholder is an example of the value, never a stand-in for the label.",
      code: '<Field label="Full name"><Input placeholder="Ada Lovelace" /></Field>',
      render: () => h("div", {style: stack},
        h(Field, {label: "Full name"}, h(Input, {placeholder: "Ada Lovelace"}))),
    },
    {
      title: "Types",
      description: "Email, password and number, all native — the keyboard on a phone changes with the type.",
      code: [
        '<Input type="email" autoComplete="email" />',
        '<Input type="password" autoComplete="current-password" />',
        '<Input type="number" min={1} max={99} />',
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(Field, {label: "Email"}, h(Input, {type: "email", placeholder: "you@example.com"})),
        h(Field, {label: "Password"}, h(Input, {type: "password", placeholder: "••••••••"})),
        h(Field, {label: "Seats"}, h(Input, {type: "number", min: 1, max: 99, defaultValue: 12}))),
    },
    {
      title: "Date and time",
      description: "The browser's own picker, wearing our tokens. Rebuilding a calendar would mean rebuilding every locale with it.",
      code: [
        '<Field label="Starts"><Input type="date" /></Field>',
        '<Field label="At"><Input type="time" /></Field>',
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(Field, {label: "Starts"}, h(Input, {type: "date", defaultValue: "2026-07-24"})),
        h(Field, {label: "At"}, h(Input, {type: "time", defaultValue: "09:00"}))),
    },
    {
      title: "Formatting a plate or a document",
      description:
        "formatOnBlur normalises the value after focus leaves — it never masks while you type. " +
        "A live mask makes the screen reader announce what was typed while the field shows " +
        "something else; the US federal design system ships its input mask with a recorded WCAG " +
        "2.1 AA failure, and MUI dropped masked date fields for the same reason. Type and paste " +
        "freely; the formatted text becomes the field's own value, so there is nothing painted " +
        "over it and nothing hidden from a form.",
      code: [
        'const plate = v => {',
        '  const raw = v.toUpperCase().replace(/[^A-Z0-9]/g, "");',
        '  return raw.length > 3 ? `${raw.slice(0, 3)}-${raw.slice(3, 7)}` : raw;',
        '};',
        '',
        '<Field label="Plate" hint="Type it however you like — it tidies up when you leave">',
        '  <Input formatOnBlur={plate} defaultValue="ABC-1D23" />',
        '</Field>',
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(Field, {label: "Plate", hint: "Type it however you like — it tidies up when you leave"},
          h(Input, {defaultValue: "ABC-1D23"}))),
    },
    {
      title: "Disabled and read-only",
      description: "Disabled is not submitted and is skipped by the keyboard; read-only is submitted and still reachable.",
      code: [
        '<Input defaultValue="Pro" disabled />',
        '<Input defaultValue="acme-42" readOnly />',
      ].join("\n"),
      render: () => h("div", {style: stack},
        h(Field, {label: "Plan"}, h(Input, {defaultValue: "Pro", disabled: true})),
        h(Field, {label: "Workspace id", hint: "Copyable, not editable"},
          h(Input, {defaultValue: "acme-42", readOnly: true}))),
    },
  ],
};
